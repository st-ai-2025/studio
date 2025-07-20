import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// If you want to use the local emulators, you can uncomment the following lines
// and set the environment variables in a .env.local file.
// if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
//   if (process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST) {
//     connectAuthEmulator(auth, `http://${process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST}`);
//   }
//   if (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST) {
//     connectFirestoreEmulator(db, ...process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST.split(":"));
//   }
// }

export { app, auth, db, googleProvider };
