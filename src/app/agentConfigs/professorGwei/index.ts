import authenticationAgent from "./authentication";
import bountyGuide from "./bountyGuide";
import githubGuide from "./githubGuide";
import { injectTransferTools } from "../utils";

authenticationAgent.downstreamAgents = [authenticationAgent];
bountyGuide.downstreamAgents = [githubGuide, authenticationAgent];
githubGuide.downstreamAgents = [bountyGuide, authenticationAgent];

const agents = injectTransferTools([
  //   authenticationAgent,
  bountyGuide,
  githubGuide,
]);

export default agents;
