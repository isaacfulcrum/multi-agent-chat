import { Observable, from, map } from "rxjs";
import { collection, DocumentData, DocumentSnapshot, getDocs, Query, QuerySnapshot } from "firebase/firestore";

import { firestore } from "@/chat/firebase";
import { KnownConcept } from "./type";

// ********************************************************************************
// TODO: Relocate this functions to a more appropriate place
// == Query => Observable ===================================================
/** Returns an observable that provides a single snapshot of the query */
const fromQueryOnce = (query: Query): Observable<QuerySnapshot> => from(getDocs(query));

// == Concepts =====================================================================
/* Observables of agents */
const snapshotToConcept = (doc: DocumentSnapshot<DocumentData>): KnownConcept =>
  ({ conceptId: doc.id, ...doc.data() } as KnownConcept); /*by contract*/

// -- By id ----------------------------------------------------------------------
export const conceptsOnceById$ = (agentId: string) =>
  fromQueryOnce(collection(firestore, "agents", agentId, "concepts")).pipe(
    map((snapshot) => snapshot.docs.map(snapshotToConcept))
  );
