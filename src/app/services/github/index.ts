export * from "../../types/github";
export * from "./repo-fetcher";
export * from "./git-connector";

// Example usage:
/*
import { GitConnector } from '@/services/github';

async function processHackathonSubmissions(submissions: string[]) {
  Initialize with GitHub token from environment
  const connector = new GitConnector(process.env.GITHUB_TOKEN);
  
  Process each repository
  for (const repoUrl of submissions) {
    try {
      await connector.addRepository(repoUrl);
      const summary = connector.getRepositorySummary(repoUrl);
      console.log(`Processed ${repoUrl}: ${summary?.totalFiles} files`);
    } catch (error) {
      console.error(`Failed to process ${repoUrl}:`, error);
    }
  }
  
  Get all repositories without dependencies
  const cleanSummaries = await connector.fetchAllWithoutDependencies();
  return cleanSummaries;
}

Alternative static method for batch processing
async function batchProcessRepositories(submissions: string[]) {
  const summaries = await GitConnector.processRepositories(
    submissions,
    process.env.GITHUB_TOKEN
  );
  return summaries;
}
*/
