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

/** Deletes a given agent from the database and its respective collections */
export const deleteAgent = onCall(async (request) => {
  try {
    const agentId = request.data;
    const agentDoc = getFirestore().collection(CollectionId.Agents).doc(agentId);

    // TODO: delete subcollections
    await agentDoc.delete();
    return { result: "Success" };
  } catch (error) {
    console.error(error);
    return { result: "Error" };
  }
});
