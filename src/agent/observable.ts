import { Observable } from "rxjs";
import { onSnapshot, collection, QuerySnapshot } from "firebase/firestore";

import { firestore } from "@/chat/firebase";

// ********************************************************************************
/** gets the list of all current agents in the database */
export const firestoreAgents$ = new Observable<QuerySnapshot>((subscriber) => ({
  unsubscribe: onSnapshot(collection(firestore, "agents"), {} /*none*/, subscriber),
}));
