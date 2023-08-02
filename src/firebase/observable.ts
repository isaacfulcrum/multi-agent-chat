import { Observable, from } from "rxjs";
import { DocumentData, DocumentReference, DocumentSnapshot, getDoc, getDocs, Query, QuerySnapshot, onSnapshot } from "firebase/firestore";

// ****************************************************************************
// == Query => Observable ===================================================
/** Returns an observable that provides realtime updates of the query */
export const fromQuery = (query: Query) =>
  new Observable<QuerySnapshot>((subscriber) => ({
    unsubscribe: onSnapshot(query, {} /*none*/, subscriber),
  }));

/** Returns an observable that provides a single snapshot of the query */
export const fromQueryOnce = (query: Query): Observable<QuerySnapshot> => from(getDocs(query));

// == DocumentRef => Observable ===================================================
export const fromDocumentRefOnce = <T = DocumentData>(ref: DocumentReference<T>): Observable<DocumentSnapshot<T>> => from(getDoc(ref));
