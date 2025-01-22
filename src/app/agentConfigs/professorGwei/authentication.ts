import { AgentConfig } from "@/app/types";

/**
 * Typed agent definitions in the style of AgentConfigSet from ../types
 */
const authentication: AgentConfig = {
  name: "authentication",
  publicDescription: "",
  instructions: "",
  tools: [
    {
      type: "function",
      function: {
        name: "getGithubData",
        description: "Get the user's Github data",
        parameters: {
          type: "object",
          properties: {
            github_username: {
              type: "string",
              description: "The user's Github username",
            },
          },
        },
      },
    },
  ],
};

export default authentication;
