import axios from "axios";
import * as fs from "fs/promises";
import * as path from "path";
import {
  FileMetadata,
  GitHubApiResponse,
  GitRepoFetcherError,
  RepoCodeSummary,
} from "../../types/github";
import { pipeline } from "stream/promises";
import * as unzipper from "unzipper";

export class GitRepoFetcher {
  private apiUrl: string;
  private logger: (message: string) => void;

  constructor(
    private readonly repoUrl: string,
    private readonly githubToken?: string,
    customLogger?: (message: string) => void
  ) {
    this.logger = customLogger || console.log;
    this.apiUrl = this.constructApiUrl(repoUrl);
  }

  private constructApiUrl(repoUrl: string): string {
    if (!repoUrl.startsWith("https://github.com/")) {
      this.logStatus("Invalid GitHub URL provided");
      throw new GitRepoFetcherError("Invalid GitHub URL");
    }

    this.logStatus("Constructing API URL");
    return repoUrl.replace(
      "https://github.com/",
      "https://api.github.com/repos/"
    );
  }

  private logStatus(message: string): void {
    this.logger(`[STATUS] ${message}`);
  }

  private async makeGitHubRequest<T>(url: string): Promise<T> {
    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };

      if (this.githubToken) {
        headers["Authorization"] = `token ${this.githubToken}`;
      }

      const response = await axios.get<T>(url, { headers });
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      throw new GitRepoFetcherError(
        `GitHub API request failed: ${
          err.response?.data?.message || err.message || "Unknown error"
        }`
      );
    }
  }

  private async fetchFileContent(url: string): Promise<string> {
    this.logStatus(`Fetching file content from ${url}`);
    try {
      const response = await axios.get<string>(url);
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logStatus(`Failed to fetch file content: ${message}`);
      return "";
    }
  }

  async getRepoContents(path: string = ""): Promise<GitHubApiResponse[]> {
    const url = `${this.apiUrl}/contents/${path}`;
    this.logStatus(`Fetching contents from ${url}`);
    return this.makeGitHubRequest<GitHubApiResponse[]>(url);
  }

  async fetchAllCode(): Promise<RepoCodeSummary> {
    this.logStatus("Starting to fetch all code files");

    const fetchFiles = async (
      currentPath: string = ""
    ): Promise<FileMetadata[]> => {
      const contents = await this.getRepoContents(currentPath);
      const files: FileMetadata[] = [];

      for (const item of contents) {
        const itemPath = item.path.replace(/\\/g, "/");

        if (this.shouldExcludeFile(itemPath)) {
          this.logStatus(`Skipping excluded path: ${itemPath}`);
          continue;
        }

        if (item.type === "file") {
          const content = item.download_url
            ? await this.fetchFileContent(item.download_url)
            : "";

          files.push({
            filename: itemPath,
            downloadUrl: item.download_url || "",
            content,
          });
        } else if (item.type === "dir") {
          const subFiles = await fetchFiles(item.path);
          files.push(...subFiles);
        }
      }

      return files;
    };

    try {
      const allFiles = await fetchFiles();
      this.logStatus("Successfully fetched all code files");
      return {
        totalFiles: allFiles.length,
        files: allFiles,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logStatus(`Error fetching repository contents: ${message}`);
      throw error;
    }
  }

  async fetchAndProcessRepoZip(
    localDir: string,
    base: string = "main",
    deleteAfter: boolean = true
  ): Promise<RepoCodeSummary> {
    // Extract repository information from URL
    const [repoAuthor, repoName] = this.repoUrl
      .replace("https://github.com/", "")
      .split("/")
      .filter(Boolean);

    const repoFolderPath = path.join(
      localDir,
      "repos",
      `${repoAuthor}-${repoName}`
    );

    // Check if repository already exists
    try {
      await fs.access(repoFolderPath);
      this.logStatus(
        `Repository already exists at ${repoFolderPath}. Processing existing files.`
      );
      return this.processExistingRepo(repoFolderPath);
    } catch {
      // Repository doesn't exist, proceed with download
      return this.downloadAndProcessRepo(
        repoFolderPath,
        base,
        deleteAfter,
        repoAuthor,
        repoName
      );
    }
  }

  // Patterns for files and directories to exclude
  private readonly excludePatterns = [
    // Config and manifest files
    /package\.json$/,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /\.gitignore$/,
    /\.npmrc$/,
    /tsconfig\.json$/,
    /jest\.config\.js$/,
    /\.eslintrc$/,
    /\.prettierrc$/,
    /\.env.*$/,

    // Build and dependency directories
    /^node_modules\//,
    /^dist\//,
    /^build\//,
    /^\.next\//,
    /^\.nuxt\//,
    /^\.cache\//,

    // Version control and CI/CD
    /^\.git\//,
    /^\.github\//,
    /^\.gitlab\//,
    /^\.circleci\//,

    // Binary and generated files
    /\.(exe|dll|so|dylib|bin)$/,
    /\.(jpg|jpeg|png|gif|ico|svg)$/,
    /\.(mp3|mp4|wav|avi)$/,
    /\.(pdf|doc|docx|xls|xlsx)$/,

    // IDE and editor files
    /^\.vscode\//,
    /^\.idea\//,
    /^\.vs\//,
    /\.DS_Store$/,
  ];

  private shouldExcludeFile(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, "/");
    return this.excludePatterns.some((pattern) => pattern.test(normalizedPath));
  }

  private async processExistingRepo(
    repoPath: string
  ): Promise<RepoCodeSummary> {
    const files: FileMetadata[] = [];

    const processDirectory = async (dirPath: string) => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path
          .relative(repoPath, fullPath)
          .replace(/\\/g, "/");

        if (this.shouldExcludeFile(relativePath)) {
          this.logStatus(`Skipping excluded path: ${relativePath}`);
          continue;
        }

        if (entry.isDirectory()) {
          await processDirectory(fullPath);
        } else {
          try {
            const content = await fs.readFile(fullPath, "utf-8");
            files.push({
              filename: relativePath,
              downloadUrl: "",
              content,
            });
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            this.logStatus(`Error reading file ${fullPath}: ${message}`);
          }
        }
      }
    };

    await processDirectory(repoPath);
    return {
      totalFiles: files.length,
      files,
    };
  }

  private async downloadAndProcessRepo(
    repoPath: string,
    base: string,
    deleteAfter: boolean,
    repoAuthor: string,
    repoName: string
  ): Promise<RepoCodeSummary> {
    const zipUrl = `${this.apiUrl}/zipball/${base}`;
    this.logStatus(`Downloading repository zip from ${zipUrl}`);

    try {
      await fs.mkdir(path.dirname(repoPath), { recursive: true });

      const response = await axios({
        method: "GET",
        url: zipUrl,
        responseType: "stream",
        headers: this.githubToken
          ? {
              Authorization: `token ${this.githubToken}`,
            }
          : undefined,
      });

      await pipeline(
        response.data as NodeJS.ReadableStream,
        unzipper.Extract({ path: repoPath })
      );

      this.logStatus(`Extracted repository to ${repoPath}`);

      const summary = await this.processExistingRepo(repoPath);

      if (deleteAfter) {
        await fs.rm(repoPath, { recursive: true, force: true });
        this.logStatus(`Deleted the extracted repository folder: ${repoPath}`);
      }

      // Save all code to a single file
      const outputFile = path.join(
        path.dirname(repoPath),
        `${repoAuthor}-${repoName}__all_code.txt`
      );
      let fileContent = "";
      for (const file of summary.files) {
        fileContent += `Filename: ${file.filename}\n${file.content}\n\n`;
      }
      await fs.writeFile(outputFile, fileContent, "utf-8");
      this.logStatus(`All code has been saved to ${outputFile}`);

      return summary;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logStatus(`Failed to process repository: ${errorMessage}`);
      throw new GitRepoFetcherError(
        `Failed to process repository: ${errorMessage}`
      );
    }
  }
}
