import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Get user data from github
 * @param owner - The owner of the repository
 * @param repo - The repository name
 * @returns The user data
 */
export async function POST(req: Request) {
  const { github_username } = await req.json();
  const userDataResponse = await octokit.request(
    `GET /users/${github_username}`,
    {
      headers: {
        // "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        accept: "application/vnd.github.v3+json",
      },
    }
  );

  const reposUrl = userDataResponse.data.repos_url;

  const reposResponse = await octokit.request(`GET ${reposUrl}`, {
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
      accept: "application/vnd.github.v3+json",
    },
  });

  const repos = reposResponse.data;

  return repos;
}
