import { firebaseFunctions } from "@/chat/firebase";

import { httpsCallable } from "firebase/functions";
import { createAgentRequest } from "./type";

// ********************************************************************************
export const createAgent = async (agentRequest: createAgentRequest) => {
  try {
    const storeData = httpsCallable(firebaseFunctions, "createAgent");
    await storeData(agentRequest);
  } catch (error) {
    console.error("Error setting memories: ", error);
  }
};
