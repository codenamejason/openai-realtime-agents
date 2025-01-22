// import authenticationAgent from "./authentication";
import bountyGuide from "./bountyGuide";
import { injectTransferTools } from "../utils";

// authenticationAgent.downstreamAgents = [bountyGuide];
// bountyGuide.downstreamAgents = [authenticationAgent];

const agents = injectTransferTools([
  //   authenticationAgent,
  bountyGuide,
]);

export default agents;
