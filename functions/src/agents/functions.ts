import { onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

import { Agent } from "./type";
import { CollectionId } from "../type";

// ****************************************************************************

/** Stores a given agent in the database */
export const createAgent = onCall<Agent>(async (request) => {
  try {
    const agent = request.data;
    const conceptDoc = getFirestore().collection(CollectionId.Agents).doc();
    await conceptDoc.set(agent);
    return { result: conceptDoc.id };
  } catch (error) {
    console.error(error);
    return { result: "Error" };
  }
});

/** Get all agents from the database */
export const getAgents = onCall(async () => {
  try {
    const conceptDoc = getFirestore().collection(CollectionId.Agents);
    const snapshot = await conceptDoc.get();
    const agents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { result: agents };
  } catch (error) {
    console.error(error);
    return { result: "Error" };
  }
});
