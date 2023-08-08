import { httpsCallable } from "firebase/functions";

import { firebaseFunctions } from "@/firebase";
import { AgentIdentifier } from "@/agent/type";

import { CreateAgentRequest } from "./type";

// ********************************************************************************
/** Sends a request to the server to create a new agent */
export const createAgent = async (agentRequest: CreateAgentRequest) => {
  const storeData = httpsCallable(firebaseFunctions, "createAgent");
  await storeData(agentRequest);
};

/** Sends a request to the server to delete an agent */
export const deleteAgent = (agentId: AgentIdentifier) => httpsCallable(firebaseFunctions, "deleteAgent")(agentId);
