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
      name: "authenticateUser",
      description: "",
      parameters: {
        type: "object",
        properties: {
          firstName: {
            type: "string",
            description: "The user's first name",
          },
          lastName: {
            type: "string",
            description: "The user's last name",
          },
          email: {
            type: "string",
            description: "The user's email address",
          },
          walletAddress: {
            type: "string",
            description: "The user's wallet address",
          },
          githubUsername: {
            type: "string",
            description: "The user's Github username",
          },
        },
        required: ["email", "walletAddress", "githubUsername"],
      },
    },
  ],
};

export default authentication;
