import { httpsCallable } from "firebase/functions";

import { firebaseFunctions } from "@/chat/firebase";
import { ConceptVectorStoreRequest } from "./type";

// ********************************************************************************
// == Write =====================================================================
export const storeConceptVectors = async ({ agentId, concepts }: ConceptVectorStoreRequest) =>
  httpsCallable(firebaseFunctions, "storeConceptVectors")({ agentId, concepts });
