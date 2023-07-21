import { httpsCallable } from "firebase/functions";

import { firebaseFunctions } from "@/chat/firebase";

// ********************************************************************************
export const createIndex = async () => httpsCallable(firebaseFunctions, "createIndex");

export const upsert = async () => httpsCallable(firebaseFunctions, "upsert");
