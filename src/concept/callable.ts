import { firebaseFunctions } from "@/chat/firebase";

import { httpsCallable } from "firebase/functions";
import { Concept, ConceptDescriptionStorageRequest } from "./type";

/** Retrieves concepts from Firestore */
export const getConcepts = async () => {
  try {
    const getData = httpsCallable(firebaseFunctions, "getMemories");
    const response = (await getData()) as any;
    return response.data.result;
  } catch (error) {
    console.error("Error getting memories: ", error);
  }
};

/** Stores the description of the {@link Concept}s for the given agent */
export const conceptDescriptionStore = async (req: ConceptDescriptionStorageRequest) =>
  httpsCallable(firebaseFunctions, "conceptDescriptionStore")(req);
