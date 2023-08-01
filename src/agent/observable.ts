import { Observable, from, map } from "rxjs";
import { collection, DocumentData, DocumentReference, DocumentSnapshot, doc, getDoc, getDocs, Query, QuerySnapshot, onSnapshot, getFirestore } from "firebase/firestore";

import { Agent } from "./type";

// ********************************************************************************
// TODO: Relocate this functions to a more appropriate place
// == Query => Observable ===================================================
/** Returns an observable that provides realtime updates of the query */
const fromQuery = (query: Query) =>
  new Observable<QuerySnapshot>((subscriber) => ({
    unsubscribe: onSnapshot(query, {} /*none*/, subscriber),
  }));

/** Returns an observable that provides a single snapshot of the query */
const fromQueryOnce = (query: Query): Observable<QuerySnapshot> => from(getDocs(query));

// == DocumentRef => Observable ===================================================
export const fromDocumentRefOnce = <T = DocumentData>(ref: DocumentReference<T>): Observable<DocumentSnapshot<T>> =>
  from(getDoc(ref));

// == Agents ====================================================================
/* Observables of agents */
const agentsRef = collection(getFirestore(), "agents");
const snapshotToAgent = (doc: DocumentSnapshot<DocumentData>): Agent =>
  ({ id: doc.id, ...doc.data() } as Agent); /*by contract*/

// -- List -----------------------------------------------------------------------
export const agents$ = fromQuery(agentsRef).pipe(map((snapshot) => snapshot.docs.map(snapshotToAgent)));
export const agentsOnce$ = fromQueryOnce(agentsRef).pipe(map((snapshot) => snapshot.docs.map(snapshotToAgent)));
// -- By id ----------------------------------------------------------------------
export const agentOnceById$ = (id: string) => fromDocumentRefOnce(doc(agentsRef, id)).pipe(map(snapshotToAgent));
