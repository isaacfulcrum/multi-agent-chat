import { httpsCallable } from "firebase/functions";

import { firebaseFunctions } from "@/chat/firebase";
import { createAgentRequest } from "./type";

// ********************************************************************************
/** Sends a request to the server to create a new agent */
export const createAgent = async (agentRequest: createAgentRequest) => {
  const storeData = httpsCallable(firebaseFunctions, "createAgent");
  await storeData(agentRequest);
};
