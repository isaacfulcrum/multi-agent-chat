import { map } from "rxjs";
import { collection, DocumentData, DocumentSnapshot, doc, getFirestore } from "firebase/firestore";

import { Agent } from "@/agent/type";
import { fromDocumentRefOnce, fromQuery, fromQueryOnce } from "@/firebase/observable";

// ********************************************************************************
/* Observables of agents */
const agentsRef = collection(getFirestore(), "agents");
const snapshotToAgent = (doc: DocumentSnapshot<DocumentData>): Agent => ({ id: doc.id, ...doc.data() } as Agent);

// -- List -----------------------------------------------------------------------
export const agents$ = fromQuery(agentsRef).pipe(map((snapshot) => snapshot.docs.map(snapshotToAgent)));
export const agentsOnce$ = fromQueryOnce(agentsRef).pipe(map((snapshot) => snapshot.docs.map(snapshotToAgent)));
// -- By id ----------------------------------------------------------------------
export const agentOnceById$ = (id: string) => fromDocumentRefOnce(doc(agentsRef, id)).pipe(map(snapshotToAgent));
