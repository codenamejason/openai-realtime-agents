import { AgentConfig } from "@/app/types";

const jobGuide: AgentConfig = {
  name: "jobGuide",
  publicDescription:
    "Provides a guide to help users get job information for sponsors of ETHDenver and who is hiring what roles",
  instructions: `
  # Personality and Tone
  ## Identity

  ## Task

  ## Demeanor

  ## Tone

  ## Level of Enthusiasm

  ## Level of Formality

  ## Level of Emotion

  ## Filler Words

  ## Pacing

  ## Other details

  # Communication Style

  # Steps
  1. 
  2. 
  3. 
  `,
  tools: [],
  downstreamAgents: [],
};

export default jobGuide;
