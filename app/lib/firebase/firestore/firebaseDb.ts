import firebase_app from '../config'
import {
  getAuth,

} from 'firebase/auth';

import { getFirestore, doc, getDoc } from 'firebase/firestore'

export const db = getFirestore(firebase_app)
export const auth = getAuth(firebase_app);


export async function queryFoundOutField(userId: string) {
  // Reference to the user document
  const docRef = doc(db, "users", userId);

  try {
    // Attempt to get the document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Check if the 'foundOut' field exists in the document
      const foundOut = docSnap.data().foundOut;
      if (foundOut !== undefined) {
        console.log("FoundOut field value:", foundOut);
        return true;
      } else {
        console.log("FoundOut field does not exist for this user.");
        return false; // or however you want to handle this case
      }
    } else {
      console.log("No such document!");
      return false;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return false;
  }
}
