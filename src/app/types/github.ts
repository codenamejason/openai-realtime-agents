export interface RepoContent {
  path: string;
  content: string;
  type: "file" | "directory";
  size?: number;
  sha: string;
}

export interface RepoMetadata {
  owner: string;
  repo: string;
  branch: string;
  fullName: string;
}

export interface ChunkedContent {
  path: string;
  content: string;
  chunkIndex: number;
  totalChunks: number;
}

export interface RepoAnalysisResult {
  chunks: ChunkedContent[];
  metadata: RepoMetadata;
}

export interface GitHubError {
  status: number;
  message: string;
  documentation_url?: string;
}

export interface FileMetadata {
  filename: string;
  downloadUrl: string;
  content: string;
}

export interface RepoCodeSummary {
  totalFiles: number;
  files: FileMetadata[];
}

export interface RepoMetadata {
  owner: string;
  repo: string;
  branch: string;
  fullName: string;
}

export interface GitHubApiResponse {
  type: "file" | "dir";
  name: string;
  path: string;
  download_url: string | null;
  content?: string;
}

export class GitRepoFetcherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitRepoFetcherError";
  }
}
