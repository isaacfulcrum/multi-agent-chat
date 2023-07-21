import { httpsCallable } from "firebase/functions";

import { firebaseFunctions } from "@/chat/firebase";
import { ConceptVectorStoreRequest, QueryConceptRequest } from "./type";

// ********************************************************************************
// == Write =======================================================================
export const storeConceptVectors = async ({ agentId, concepts }: ConceptVectorStoreRequest) =>
  httpsCallable(firebaseFunctions, "storeConceptVectors")({ agentId, concepts });

// == Read ========================================================================
export const queryConceptVector = async ({ agentId, conceptEmbedding }: QueryConceptRequest) =>
  httpsCallable(firebaseFunctions, "queryConceptVector")({ agentId, conceptEmbedding });
