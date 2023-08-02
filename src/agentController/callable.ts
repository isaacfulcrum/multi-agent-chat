import { httpsCallable } from "firebase/functions";

import { firebaseFunctions } from "@/firebase";

import { CreateAgentRequest } from "./type";

// ********************************************************************************
/** Sends a request to the server to create a new agent */
export const createAgent = async (agentRequest: CreateAgentRequest) => {
  const storeData = httpsCallable(firebaseFunctions, "createAgent");
  await storeData(agentRequest);
};
