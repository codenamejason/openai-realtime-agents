import { AgentConfig } from "@/app/types";

const speakerGuide: AgentConfig = {
  name: "speakerGuide",
  publicDescription:
    "Provides a guide to help users get speaker information for ETHDenver and when they are speaking",
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

export default speakerGuide;
