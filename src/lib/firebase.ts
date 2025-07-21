
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log the config to the console for easy debugging
console.log("Firebase Config:", firebaseConfig);


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const createUserProfile = async (user: User) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  try {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp(),
    }, { merge: true }); // Use merge: true to avoid overwriting data if it already exists
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};


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
