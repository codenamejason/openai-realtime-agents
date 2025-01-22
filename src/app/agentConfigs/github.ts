export const getGithubData = async (github_username: string) => {
  const response = await fetch("/api/github", {
    method: "POST",
    body: JSON.stringify({ github_username }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
