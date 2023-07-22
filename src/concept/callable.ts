import { firebaseFunctions } from "@/chat/firebase";

import { httpsCallable } from "firebase/functions";
import { Concept } from "./type";

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

/** Stores concepts in Firestore */
export const setConcepts = async (concepts: Concept[]) => {
  try {
    const storeData = httpsCallable(firebaseFunctions, "storeMemories");
    await storeData(concepts);
  } catch (error) {
    console.error("Error setting memories: ", error);
  }
};
