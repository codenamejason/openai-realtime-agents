import { RepoCodeSummary } from "../../types/github.js";
import { GitRepoFetcher } from "./repo-fetcher";

export class GitConnector {
  private repositories: Map<string, RepoCodeSummary>;

  constructor(private readonly githubToken?: string) {
    this.repositories = new Map();
  }

  private cleanRepoUrl(repoUrl: string): string {
    // Remove /tree/{branch} from URL if present
    return repoUrl.replace(/\/tree\/[^/]+/, "");
  }

  async addRepository(repoUrl: string): Promise<void> {
    const cleanUrl = this.cleanRepoUrl(repoUrl);
    console.log(`Cleaned repository URL: ${cleanUrl}`);

    const fetcher = new GitRepoFetcher(cleanUrl, this.githubToken);

    // Use the temp directory from environment variables or default
    const localDir = process.env.TEMP_DIR || "./temp";
    const repoSummary = await fetcher.fetchAndProcessRepoZip(
      localDir,
      "main",
      false
    );

    this.repositories.set(repoUrl, repoSummary);
    console.log(`Added repository: ${repoUrl}`);
  }

  getRepositorySummary(repoUrl: string): RepoCodeSummary | undefined {
    return this.repositories.get(repoUrl);
  }

  listAllRepositories(): string[] {
    return Array.from(this.repositories.keys());
  }

  async fetchAllWithoutDependencies(): Promise<Map<string, RepoCodeSummary>> {
    const summaries = new Map<string, RepoCodeSummary>();

    for (const [repoUrl, summary] of this.repositories.entries()) {
      // Filter out dependency files
      const filteredFiles = summary.files.filter(
        (file) =>
          !["requirements.txt", "package.json", "yarn.lock"].includes(
            file.filename
          )
      );

      summaries.set(repoUrl, {
        totalFiles: filteredFiles.length,
        files: filteredFiles,
      });
    }

    return summaries;
  }

  // Example usage of how to process multiple repositories
  static async processRepositories(
    repoUrls: string[],
    githubToken?: string
  ): Promise<Map<string, RepoCodeSummary>> {
    const connector = new GitConnector(githubToken);

    // Process repositories sequentially to avoid rate limiting
    for (const url of repoUrls) {
      try {
        await connector.addRepository(url);
        console.log(`Successfully processed repository: ${url}`);
      } catch (error) {
        console.error(`Failed to process repository ${url}:`, error);
      }
    }

    return connector.repositories;
  }
}
