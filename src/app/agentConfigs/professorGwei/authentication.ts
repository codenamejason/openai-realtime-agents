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
            description: "The caller's first name",
          },
          lastName: {
            type: "string",
            description: "The caller's last name",
          },
          email: {
            type: "string",
            description: "The caller's email address",
          },
          walletAddress: {
            type: "string",
            description: "The caller's wallet address",
          },
        },
        required: ["email", "walletAddress"],
      },
    },
  ],
};

export default authentication;
