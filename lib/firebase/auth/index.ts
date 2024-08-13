
import firebase_app from '../config'
import { FirebaseError } from 'firebase/app'
import {
  signInWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,

  signOut,
  User,
  updateProfile,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
 
} from 'firebase/auth'

export const auth = getAuth(firebase_app)

import { db } from '../firestore/firebaseDb'
import {
  doc,
  getDoc,

} from 'firebase/firestore'

export async function signIn(email: string, password: string) {
  let result = null,
    error = null
  try {
    result = await signInWithEmailAndPassword(auth, email, password)
  } catch (e) {
    error = e as FirebaseError
  }
  return { result, error }
}
export async function signUp( email: string, password: string) {
  let result = null,
    error = null
  try {
    result = await createUserWithEmailAndPassword(auth, email, password)
  } catch (e) {
    error = e as FirebaseError
  }

  return { result, error }
}



export async function signOutUser(onSignOut: () => void) {
  await signOut(auth)
  onSignOut()
  console.log('User signed out')
}

export async function getCurrentUser() {
  await auth.currentUser?.reload()
  return auth.currentUser
}
export async function findUserById(userId: string) {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    console.log('User data:', docSnap.data());
    return docSnap.data();
  } else {
    console.log('No such user!');
    return null;
  }
}

export function subscribeToAuthChanges(
  onAuthStateChanged: (user: User | null) => void
) {
  // console.log("auth", auth.currentUser)
  return auth.onAuthStateChanged((user) => {
    onAuthStateChanged(user)
  })
}

export async function getUserCustomClaims() {
  let res = await auth.currentUser?.getIdToken(true)
  console.log(res)
  return res
}

export async function resetPassword(email: string) {
  let result = null,
    error = null;
  try {
    await sendPasswordResetEmail(auth, email);
    result = 'Password reset email sent!';
  } catch (e) {
    error = e as FirebaseError;
  }
  return { result, error };
}

const user1 = auth.currentUser;
export async function checkEmailInDatabase(email: string) {
  let result = 0
  try {
    console.log(email)
    await createUserWithEmailAndPassword(auth, email, '123456')
      .then(function (user) {
        if (user1 != null) {
          deleteUser(user1).then(() => {
            // User deleted.
            console.log("delete hoise")
          }).catch((error) => {
            // An error ocurred
            // ...
          });
        }
        // Email doesn't exist, you can handle this case
        console.log('Email does not exist');
        result = 0;
      })
      .catch(async function (error) {
        if (error.code === 'auth/email-already-in-use') {
  
          // Email already exists, handle this case
          result = 1;
          console.log('Email already exists');
        } else {
          // Handle other errors
          console.error(error.message);
        }
      });


  } catch (error) {
    console.error('Error checking email in database:', error);
    throw error as FirebaseError;
  }
  return { result };
}


