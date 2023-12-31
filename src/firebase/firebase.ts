import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseFunctions = getFunctions(app);

// Initialize Cloud Firestore and get a reference to the service
export const firestore = getFirestore(app);

/* NOTE: we only use the emulator in development mode and if the host */
if (process.env.NODE_ENV === "development") {
  try {
    connectFunctionsEmulator(firebaseFunctions, "127.0.0.1", 5001);
    connectFirestoreEmulator(firestore, "localhost", 8080);
  } catch (error) {
    console.error("Error connecting to firebase emulator: ", error);
  }
}
