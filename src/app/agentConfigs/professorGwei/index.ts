import authenticationAgent from "./authentication";
import { injectTransferTools } from "../utils";

authenticationAgent.downstreamAgents = [authenticationAgent];

const agents = injectTransferTools([authenticationAgent]);

export default agents;
