import authenticationAgent from "./authentication";
import bountyGuide from "./bountyGuide";
import githubGuide from "./githubGuide";
import { injectTransferTools } from "../utils";

authenticationAgent.downstreamAgents = [authenticationAgent];
bountyGuide.downstreamAgents = [bountyGuide, authenticationAgent];
githubGuide.downstreamAgents = [githubGuide, authenticationAgent];

const agents = injectTransferTools([
  //   authenticationAgent,
  bountyGuide,
  //   githubGuide,
]);

export default agents;
