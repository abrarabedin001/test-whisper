import * as admin from 'firebase-admin'
import { NextRequest } from 'next/server'






export interface dailyTracking {
  success: number
  total: number
  successList: string[]
  createdAt: Date
  successArray: string[]
  id: string
}

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
)

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}



export async function whisper(jobId: string, status: string, output: any, message: string) {
  try {
    const db = admin.firestore()
    const whisperRef = db.collection('whispers').doc(jobId ?? "trying")
    await whisperRef.set({ jobId, status, output, updatedAt: new Date(), message })
    console.log('Whisper sent successfully.')
  } catch (error) {
    console.error('Error in updating daily tracking:', error)
    throw error
  }
  return { msg: 'No message needed' }
}

export async function updateUserSubscription(session: any, subscription: any) {
  const db = admin.firestore()
  const userRef = db.doc(`users/${session.metadata.userId}`)

  try {
    await userRef.update({
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),

      tierName: subscription.items.data[0].plan.nickname,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: subscription.cancel_at,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log('User updated successfully')
    return { result: 'User updated successfully' }
  } catch (error) {
    console.error('Error updating user:', error)
    return { error: error }
  }
}

export async function updateCustomerSubscription(subscription: any) {
  const db = admin.firestore()
  const usersRef = db.collection('users')
  const q = usersRef.where('stripeSubscriptionId', '==', subscription.id)
  if (subscription.Status == 'active') {
    try {
      const querySnapshot = await q.get()
      querySnapshot.forEach(async (docSnapshot) => {
        const userRef = docSnapshot.ref
        await userRef.update({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          tierName: subscription.items.data[0].plan.nickname,
          cancel_at_period_end: subscription.cancel_at_period_end,
          cancel_at: subscription.cancel_at,
          subscriptionSatus: subscription.status
        })
      })
      console.log('User(s) updated(two) successfully')
      return { result: 'User(s) updated(two) successfully' }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  } else {
    try {
      const querySnapshot = await q.get()
      querySnapshot.forEach(async (docSnapshot) => {
        const userRef = docSnapshot.ref
        await userRef.update({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          stripePriceId: subscription.items.data[0].price.id,

          updatedAt: admin.firestore.FieldValue.serverTimestamp(),

          subscriptionSatus: subscription.status
        })
      })
      console.log('User(s) updated(two) successfully')
      return { result: 'User(s) updated(two) successfully' }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

}

export async function updateUserStripeSuccess(subscription: any) {
  const db = admin.firestore()
  const usersRef = db.collection('users')
  const q = usersRef.where('stripeSubscriptionId', '==', subscription.id)

  try {
    const querySnapshot = await q.get()
    querySnapshot.forEach(async (docSnapshot) => {
      const userRef = docSnapshot.ref
      await userRef.update({
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        tierName: subscription.items.data[0].plan.nickname,
        cancel_at_period_end: subscription.cancel_at_period_end,
        cancel_at: subscription.cancel_at,
      })
    })
    console.log('User(s) updated(two) successfully')
    return { result: 'User(s) updated(two) successfully' }
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

export async function updateUserStripeFailure(invoice: any) {
  const db = admin.firestore()
  const usersRef = db.collection('users')
  const q = usersRef.where('stripeCustomerId', '==', invoice.customer)

  try {
    const querySnapshot = await q.get()
    querySnapshot.forEach(async (docSnapshot) => {
      const userRef = docSnapshot.ref
      await userRef.update({

        stripeCurrentPeriodEnd: new Date(
          invoice.period_end * 1000
        ),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),


      })
    })
    console.log('User(s) updated(two) successfully')
    return { result: 'User(s) updated(two) successfully' }
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

export async function findUserById(userId: string) {
  if (!userId) {
    console.log('No such user!')
    return null
  }
  const db = admin.firestore()
  const userRef = db.doc(`users/${userId}`)
  const docSnap = await userRef.get()

  if (docSnap.exists) {
    // console.log('User data:', docSnap.data())
    console.log('User data found')
    return docSnap.data()
  } else {
    console.log('No such user!')
    return null
  }
}

export async function deleteUserStripeSuccess(subscription: any) {
  const db = admin.firestore()
  const usersRef = db.collection('users')
  const q = usersRef.where('stripeSubscriptionId', '==', subscription.id)

  try {
    const querySnapshot = await q.get()
    querySnapshot.forEach(async (docSnapshot) => {
      const userRef = docSnapshot.ref
      await userRef.update({
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        tierName: null,
        cancel_at_period_end: null,
        cancel_at: null,
      })
    })
    console.log('User(s) updated(three) successfully')
    return { result: 'User(s) updated(three) successfully' }
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

export async function getUser(req: NextRequest) {
  try {
    const firebaseToken = req.headers.get('authorization')?.split(' ')[1]

    if (!firebaseToken) {
      console.log('No Firebase token provided.')
      return null
    }

    const decodedToken = await admin.auth().verifyIdToken(firebaseToken)
    console.log('Decoded Firebase token:', decodedToken)
    return decodedToken
  } catch (error) {
    return null
  }
}

export const createUser = async function (
  uid: string,
  email: string,
  macAdresses: string
) {
  console.log('Checking for user with UID:', uid)
  const db = admin.firestore()
  const userRef = db.collection('users').doc(uid) // Specify the collection and document ID

  try {
    // Check if the user already exists
    const userSnap = await userRef.get()
    if (userSnap.exists) {
      // If the user exists, log and do nothing
      console.log(`User with UID: ${uid} already exists.`)
    } else {
      // If the user does not exist, create a new user document
      await userRef.set({
        uid,
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
        email,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        macAdresses,
      })
      console.log('User created with UID: ', uid)
    }
  } catch (e) {
    console.error('Error accessing user: ', e)
  }
}

// export const checkSignInUser = async function (userUID: string, mac: string) {
//   const db = admin.firestore()
//   console.log('Processing sign in for user with UID:', userUID)

//   let error: { code?: string } = { code: 'no error' }
//   let user = null
//   let msg = null

//   try {
//     const usersRef = db.collection('users')
//     const checkUserSnap = await usersRef.where('uid', '==', userUID).get()

//     if (!checkUserSnap.empty) {
//       const userData = checkUserSnap.docs[0].data()
//       const macAdresses = userData.macAdresses
//       user = userData
//       if (macAdresses) {
//         const macCheck = mac === macAdresses
//         if (!macCheck) {
//           error = { code: 'auth/invalid-mac-address' }
//           msg = { code: 'auth/invalid-mac-address' }
//           console.log(error.code)
//           return { user, error }
//         }
//         return { user, error }
//       } else {
//         await usersRef.doc(userUID).set({ macAdresses: mac }, { merge: true })
//         user = { ...userData, macAdresses: mac }
//         return { user, error }
//       }
//     } else {
//       console.log('No user found with UID:', userUID)
//       error = { code: 'auth/user-not-found' }
//       msg = { code: 'auth/user-not-found' }
//     }
//   } catch (err) {
//     console.error('Error processing sign in: ', err)
//     error = err as { code?: string }
//     msg = err
//   }

//   return { user, error }
// }

export const checkSignInUser = async function (userUID: string, mac: string) {
  const db = admin.firestore()
  console.log('Processing sign in for user with UID:', userUID)

  let error: { code?: string } = { code: 'no error' }
  let user = null

  try {
    const usersRef = db.collection('users')
    const checkUserSnap = await usersRef.where('uid', '==', userUID).get()

    if (!checkUserSnap.empty) {
      const userData = checkUserSnap.docs[0].data()
      let macAdress = userData.macAdress || []
      user = userData

      // Check if the provided MAC address matches one of the stored MAC addresses.
      if (macAdress.includes(mac)) {
        return { user, error } // MAC address matches, return user data and no error.
      } else {
        // MAC address does not match. If there are less than 2 MAC addresses stored, add the new one.
        if (macAdress.length < 2) {
          macAdress.push(mac)
          await usersRef.doc(userUID).set({ macAdress }, { merge: true })
          user = { ...userData, macAdress }
        } else {
          // If there are already 2 MAC addresses, set an error.
          error = { code: 'auth/invalid-mac-address' }
          console.log(error.code)
        }
        return { user, error }
      }
    } else {
      console.log('No user found with UID:', userUID)
      error = { code: 'auth/user-not-found' }
    }
  } catch (err) {
    console.error('Error processing sign in: ', err)
    error = err as { code?: string }
  }

  return { user, error }
}


export const updateDailyTrackingTotal = async function (
  userId: string,
  dailyTrackingId: string,
  totalToAdd = 0
) {
  try {
    const db = admin.firestore()
    const dailyTrackingDocRef = db.doc(
      `users/${userId}/dailyTracking/${dailyTrackingId}`
    )

    await db.runTransaction(async (transaction) => {
      const dailyTrackingDoc = await transaction.get(dailyTrackingDocRef)
      if (!dailyTrackingDoc.exists) {
        throw new Error('Document does not exist!')
      }
      const currentTotal = dailyTrackingDoc?.data()?.total || 0
      const newTotal = currentTotal + totalToAdd
      console.log('newTotal: ', newTotal)
      transaction.update(dailyTrackingDocRef, { total: newTotal })
    })

    console.log('Daily tracking updated successfully.')
  } catch (error) {
    console.error('Error in updating daily tracking:', error)
    throw error
  }
}


export const updateDailyTrackingTotal2 = async function (
  userId: string,
  dailyTrackingId: string,
  totalToAdd = 0
) {
  try {
    const db = admin.firestore()
    const dailyTrackingDocRef = db.doc(
      `users/${userId}/dailyTracking/${dailyTrackingId}`
    )

    await db.runTransaction(async (transaction) => {
      const dailyTrackingDoc = await transaction.get(dailyTrackingDocRef)
      if (!dailyTrackingDoc.exists) {
        throw new Error('Document does not exist!')
      }
      const currentTotal = dailyTrackingDoc?.data()?.total || 0
      const newTotal = currentTotal + 1
      console.log('newTotal: ', newTotal)
      transaction.update(dailyTrackingDocRef, { total: newTotal })
    })

    console.log('Daily tracking updated successfully.')
  } catch (error) {
    console.error('Error in updating daily tracking:', error)
    throw error
  }
}

export const updateDailyTrackingTotal3 = async function (
  userId: string,
  dailyTrackingId: string,
  totalToAdd = 0
) {
  try {
    const db = admin.firestore()
    const dailyTrackingDocRef = db.doc(
      `users/${userId}/dailyTracking/${dailyTrackingId}`
    )

    await db.runTransaction(async (transaction) => {
      const dailyTrackingDoc = await transaction.get(dailyTrackingDocRef)
      if (!dailyTrackingDoc.exists) {
        throw new Error('Document does not exist!')
      }
      const currentTotal = dailyTrackingDoc?.data()?.total || 0
      if (totalToAdd == 1 || totalToAdd == -1) {
        const newTotal = currentTotal + totalToAdd
        console.log('newTotal: ', newTotal)
        transaction.update(dailyTrackingDocRef, { total: newTotal })
      }

    })

    console.log('Daily tracking updated successfully.')
  } catch (error) {
    console.error('Error in updating daily tracking:', error)
    throw error
  }
}

export const updateDailyTrackingSuccess = async function (
  userId: string,
  dailyTrackingId: string,
  successString = '',
  time: string
) {
  try {
    const db = admin.firestore()
    const dailyTrackingDoc = db.doc(
      `users/${userId}/dailyTracking/${dailyTrackingId}`
    )

    await db.runTransaction(async (transaction) => {
      const docSnapshot = await transaction.get(dailyTrackingDoc)
      if (!docSnapshot.exists) {
        throw new Error('Document does not exist!')
      }

      const currentSuccess = docSnapshot?.data()?.success || 0
      const newSuccess = currentSuccess + 1

      const currentSuccessArray = docSnapshot?.data()?.successArray || []
      const newSuccessArray = [
        ...currentSuccessArray,
        { name: successString, time: time },
      ]

      transaction.update(dailyTrackingDoc, {
        success: newSuccess,
        successArray: newSuccessArray,
      })
    })

    console.log('Daily tracking updated successfully.')
  } catch (error) {
    console.error('Error in updating daily tracking:', error)
    throw error
  }
}

export const updateDailyTrackingSuccess2 = async function (
  userId: string,
  dailyTrackingId: string,
  successString = '',
  loginProfile = '',
  time: string
) {
  try {
    const db = admin.firestore()
    const dailyTrackingDoc = db.doc(
      `users/${userId}/dailyTracking/${dailyTrackingId}`
    )

    await db.runTransaction(async (transaction) => {
      const docSnapshot = await transaction.get(dailyTrackingDoc)
      if (!docSnapshot.exists) {
        throw new Error('Document does not exist!')
      }

      const currentSuccess = docSnapshot?.data()?.success || 0
      const newSuccess = currentSuccess + 1

      const currentSuccessArray = docSnapshot?.data()?.successArray || []
      const newSuccessArray = [
        ...currentSuccessArray,
        { name: successString, time: time, loginProfile: loginProfile },
      ]

      transaction.update(dailyTrackingDoc, {
        success: newSuccess,
        successArray: newSuccessArray,
      })
    })

    console.log('Daily tracking updated successfully.')
  } catch (error) {
    console.error('Error in updating daily tracking:', error)
    throw error
  }
}


export const tableDbInsert = async function (
  userId: string,
  name: string,
  dateTime: string
) {
  try {
    console.log('userId:', userId)
    const db = admin.firestore()
    const userDocRef = db.collection('users').doc(userId)
    const successArrayCollectionRef = userDocRef.collection('successArray')

    // Check if 'successArray' subcollection exists
    const successArraySnapshot = await successArrayCollectionRef.get()
    if (successArraySnapshot.empty) {
      console.log('No successArray subcollection found.')
    }

    let date = new Date(dateTime)

    // Convert the Date object to a Firestore Timestamp
    console.log('date:', date)
    let firestoreTimestamp = admin.firestore.Timestamp.fromDate(date)

    // If 'successArray' subcollection exists, add a new document
    const newDoc = {
      name: name,
      time: firestoreTimestamp,
    }

    await successArrayCollectionRef.add(newDoc)

    console.log('Daily tracking updated successfully.')
  } catch (error) {
    console.error('Error in updating daily tracking:', error)
    throw error
  }
}

export const tableDbInsert2 = async function (
  userId: string,
  name: string,
  dateTime: string,
  loginProfile: string
) {
  try {
    console.log('userId:', userId)
    const db = admin.firestore()
    const userDocRef = db.collection('users').doc(userId)
    const successArrayCollectionRef = userDocRef.collection('successArray')

    // Check if 'successArray' subcollection exists
    const successArraySnapshot = await successArrayCollectionRef.get()
    if (successArraySnapshot.empty) {
      console.log('No successArray subcollection found unique.')
    }

    let date = new Date(dateTime)

    // Convert the Date object to a Firestore Timestamp
    console.log('date:', date)
    let firestoreTimestamp = admin.firestore.Timestamp.fromDate(date)

    // If 'successArray' subcollection exists, add a new document
    const newDoc = {
      name: name,
      loginProfile: loginProfile ? loginProfile : null,
      time: firestoreTimestamp,
    }


    await successArrayCollectionRef.add(newDoc)

    console.log('Daily tracking updated successfully.')
  } catch (error) {
    console.error('Error in updating daily tracking:', error)
    throw error
  }
}

export const tableDbBatchInsert = async function (
  userId: string,
  names: { name: string }[],
  dateTime: string
) {
  try {
    console.log('names:', names)
    console.log('userId:', userId)
    const db = admin.firestore()
    const userDocRef = db.collection('users').doc(userId)
    const successArrayCollectionRef = userDocRef.collection('successArray')

    // Check if 'successArray' subcollection exists
    const successArraySnapshot = await successArrayCollectionRef.get()
    if (successArraySnapshot.empty) {
      console.log('No successArray subcollection found.')
    }

    let date = new Date(dateTime)

    // Convert the Date object to a Firestore Timestamp
    console.log('date:', date)
    let firestoreTimestamp = admin.firestore.Timestamp.fromDate(date)

    // Create a batch
    let batch = db.batch();

    // For each name in the names array, add a new document to the batch
    names.forEach((name) => {
      console.log('name:', name)
      const newDoc = {
        name: name.name,
        time: firestoreTimestamp,
      }
      const newDocRef = successArrayCollectionRef.doc();
      batch.set(newDocRef, newDoc);
    });

    // Commit the batch
    await batch.commit();

    console.log('Daily tracking updated successfully.')
  } catch (error) {
    console.error('Error in updating daily tracking:', error)
    throw error
  }
}

export const tableDbFetch = async function (
  userId: string,
  offset: number,
  limit: number
) {
  try {
    console.log('userId:', userId)
    const db = admin.firestore()
    const userDocRef = db.collection('users').doc(userId)
    const successArrayCollectionRef = userDocRef.collection('successArray')

    // Check if 'successArray' subcollection exists
    const successArraySnapshot = await successArrayCollectionRef.get()
    if (successArraySnapshot.empty) {
      console.log('No successArray subcollection found.')
      return
    }

    // Fetch documents with pagination
    const querySnapshot = await successArrayCollectionRef
      .orderBy('time') // assuming 'time' is the field you want to sort by
      .startAfter(offset)
      .limit(limit)
      .get()

    const documents = querySnapshot.docs.map((doc) => doc.data())

    console.log('Fetched documents:', documents)
    return documents
  } catch (error) {
    console.error('Error in fetching documents:', error)
    throw error
  }
}

export const tableDbFilterNamesInDb = async function (
  userId: string,
  names: { name: string }[]
) {
  try {
    console.log('names:', names)
    console.log('userId:', userId)
    const db = admin.firestore()
    const userDocRef = db.collection('users').doc(userId)
    const successArrayCollectionRef = userDocRef.collection('successArray')

    // Fetch all documents from 'successArray' subcollection
    const successArraySnapshot = await successArrayCollectionRef.get()

    // If 'successArray' subcollection is empty, return an empty array
    if (successArraySnapshot.empty) {
      console.log('No successArray subcollection found.')
      return
    }

    // Get all names from the fetched documents
    const dbNames = successArraySnapshot.docs.map(doc => doc.data().name)

    // Filter the names array based on whether the name is in dbNames
    const filteredNames = names.filter(nameObj => !dbNames.includes(nameObj.name))

    console.log('Filtered names:', filteredNames)
    return filteredNames
  } catch (error) {
    console.error('Error in filtering names:', error)
    throw error
  }
}

export const tableDbDeleteSingleFromBanList = async function (id: string, name: string) {
  if (!name) {
    console.log('Name parameter is required.')
    return
  }

  try {
    console.log('Deleting name:', name)
    const db = admin.firestore()
    const banListCollectionRef = db.collection(`users/${id}/successArray`)
    const querySnapshot = await banListCollectionRef
      .where('name', '==', name)
      .get()

    if (querySnapshot.empty) {
      console.log('No matching document found.')
      return
    }
    console.log('querySnapshot:', querySnapshot)

    // Delete all matching documents (assuming names are unique, this should only be one document)
    querySnapshot.forEach(async (doc) => {
      await banListCollectionRef.doc(doc.id).delete()
    })

    console.log('Document(s) deleted successfully.')
  } catch (error: any) {
    console.error('Error while deleting from banList:', error)
    throw new Error(`Failed to delete from banList: ${error.message}`)
  }
}

export const tableDbDeleteAllFromBanList = async function (id: string) {
  try {
    const db = admin.firestore()
    const banListCollectionRef = db.collection(`users/${id}/successArray`)

    // Get all documents in the banList collection
    const querySnapshot = await banListCollectionRef.get()

    if (querySnapshot.empty) {
      console.log('No documents found in banList.')
      return
    }

    // Batch delete all documents
    const batch = db.batch()
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    console.log('All documents deleted successfully from banList.')
  } catch (error: any) {
    console.error('Error while deleting all from banList:', error)
    throw new Error(`Failed to delete all from banList: ${error.message}`)
  }
}

export const tableDbGetTableSize = async function (id: string) {
  try {
    const db = admin.firestore()
    const banListCollectionRef = db.collection(`users/${id}/successArray`)

    // Get all documents in the banList collection
    const querySnapshot = await banListCollectionRef.get()

    // The number of documents in the banList collection
    const count = querySnapshot.size
    console.log('TableSize: ', count)

    // Assuming you have some mechanism to communicate back to the event (e.g., WebSocket, HTTP response)
    // Here, simply returning the count
    return count
  } catch (error: any) {
    console.error('Error while getting table size:', error)
    throw new Error(`Failed to get table size: ${error.message}`)
  }
}



export const tableDbRetrieveDataFromDatabase = async function (
  userId: string,
) {
  try {
    console.log('userId:', userId)
    const db = admin.firestore()
    const userDocRef = db.collection('users').doc(userId)
    const successArrayCollectionRef = userDocRef.collection('successArray')

    // Check if 'successArray' subcollection exists
    const successArraySnapshot = await successArrayCollectionRef.get()
    if (successArraySnapshot.empty) {
      console.log('No successArray subcollection found.')
      return
    }

    // Fetch documents with pagination
    const querySnapshot = await successArrayCollectionRef
      .orderBy('time') // assuming 'time' is the field you want to sort by=
      .limit(4000)
      .get()

    const documents = querySnapshot.docs.map((doc) => doc.data())

    console.log('Fetched documents:', documents)
    return documents
  } catch (error) {
    console.error('Error in fetching documents:', error)
    throw error
  }
}


export const initializeDailyTracking = async function (
  userId: string,
  currentDate: Date
) {
  const db = admin.firestore()
  try {
    const dailyTrackingCol = db.collection(`users/${userId}/dailyTracking`)
    const startOfToday = admin.firestore.Timestamp.fromDate(currentDate)
    const endOfToday = admin.firestore.Timestamp.fromDate(
      new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    )

    const q = dailyTrackingCol
      .where('createdAt', '>=', startOfToday)
      .where('createdAt', '<', endOfToday)

    const querySnapshot = await q.get()

    if (!querySnapshot.empty) {
      console.log('User has daily tracking data for today.')
      const doc = querySnapshot.docs[0]
      return {
        ...doc.data(),
        id: doc.id,
      }
    }

    const newTracking = {
      createdAt: startOfToday,
      success: 0,
      total: 0,
      successArray: [],
    }

    const docRef = await dailyTrackingCol.add(newTracking)
    console.log('Daily tracking initialized for today.')

    return {
      ...newTracking,
      id: docRef.id,
    }
  } catch (error) {
    console.error('Error in ensuring daily tracking:', error)

    throw error
  }
}

// import { getFirestore } from 'firebase-admin/firestore';

export async function getCurrentUser(user_id: string) {
  if (user_id) {
    const db = admin.firestore()
    const usersRef = db.collection('users')
    const snapshot = await usersRef.where('uid', '==', user_id).get()
    console.log('snapshot', snapshot)
    if (!snapshot.empty) {
      return snapshot.docs[0].data()
    }
  }
  return null
}

const tierLimits = {
  'Starter Yearly': 75,
  'Pro Yearly': 375,
  'Star Yearly': 9999,
  'Starter Monthly': 75,
  'Pro Monthly': 375,
  'Star Monthly': 9999,
  'Free Tier': 10,
}

export async function getDailyTrackingData(userId: string) {
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  try {
    const db = admin.firestore()
    const dailyTrackingCol = db.collection(`users/${userId}/dailyTracking`)
    const q = dailyTrackingCol
      .where('createdAt', '>=', currentDate)
      .where(
        'createdAt',
        '<',
        new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
      )

    const querySnapshot = await q.get()
    const userDetails = await findUserById(userId) // Make sure findUserById uses Firebase Admin SDK
    if (!userDetails) {
      console.error('User details not found')
      return null
    }

    const userTier = userDetails.tierName

    if (!querySnapshot.empty) {
      const dailyTrackingDoc = querySnapshot.docs[0]
      const dailyTrackingData = dailyTrackingDoc.data()
      return {
        success: dailyTrackingData.success,
        total: dailyTrackingData.total,
        totalSuccessArray: dailyTrackingData.successArray,
        tier: tierLimits[userTier as keyof typeof tierLimits],
      }
    } else {
      console.log('No daily tracking data found for today.')
      return null
    }
  } catch (error) {
    console.error('Error in fetching daily tracking data:', error)
    throw error
  }
}

export async function checkIfLimitExceeded(userId: string) {
  try {
    console.log('Checking limit for user:', userId)

    const db = admin.firestore()
    const usersRef = db.collection('users')
    const q = usersRef.where('uid', '==', userId)

    const updateUsers = async () => {
      try {
        const querySnapshot = await q.get()
        querySnapshot.forEach(async (doc) => {
          try {
            await doc.ref.update({ usingOld: true })
            console.log(`Document with userId ${userId} updated successfully`)
          } catch (error) {
            console.error('Error updating document: ', error)
          }
        })
      } catch (error) {
        console.error('Error getting documents: ', error)
      }
    }

    updateUsers()

    const userDetails = await getCurrentUser(userId) // This function should use Firebase Admin SDK

    console.log('userDetails', userDetails)
    if (!userDetails) {
      console.error('User details not found')
      return { result: true, message: 'User details not found', tierName: null }
    }

    const createdAt = userDetails.createdAt.toDate()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const freeTeirLimitExceded = sevenDaysAgo >= createdAt
    const freeTierName = 'Free Tier'
    const freeTierLimitDm = 10 // Limit for free tier users
    const dailyTrackingData = await getDailyTrackingData(userId) // This function should also use Firebase Admin SDK

    if (userDetails.tierName != null) {
      if (new Date() <= userDetails.stripeCurrentPeriodEnd.toDate()) {
        console.log('subscription is still valid')
        if (!dailyTrackingData) {
          console.log('No daily tracking data available')
          return {
            result: false,
            message: 'No daily tracking data available',
            tierName: userDetails.tierName,
          }
        } else {
          let successLimit =
            tierLimits[userDetails.tierName as keyof typeof tierLimits]
          if (dailyTrackingData.success >= successLimit) {
            return {
              result: true,
              message: 'Daily limit exceeded',
              tierName: null,
            }
          } else {
            return {
              result: false,
              message: 'Limit not exceeded',
              tierName: userDetails.tierName,
            }
          }
        }
      } else {
        console.log('subscription period is not valid')
        return {
          result: true,
          message: 'Subscription period is not valid!',
          tierName: null,
        }
      }
    } else {
      console.log('user tier is null')

      if (!freeTeirLimitExceded) {
        if (!dailyTrackingData) {
          console.log('No daily tracking data available')
          return {
            result: false,
            message: 'No daily tracking data available',
            tierName: freeTierName,
          }
        }

        if (dailyTrackingData.success < freeTierLimitDm) {
          console.log('Free tier period is going on')
          return {
            result: false,
            message: 'Your Free tier is going on ',
            tierName: freeTierName,
          }
        }
      }

      return {
        result: true,
        message: 'You are not subscribed!',
        tierName: null,
      }
    }
  } catch (error) {
    console.error('Error in checking limit:', error)
    return { result: true, message: 'Error in checking limit', tierName: null }
  }
}

export async function getDailyTrackingData_v2(
  userId: string,
  currentDate: Date
) {
  // const currentDate = new Date()
  // currentDate.setHours(0, 0, 0, 0)

  try {
    const db = admin.firestore()
    const dailyTrackingCol = db.collection(`users/${userId}/dailyTracking`)
    const q = dailyTrackingCol
      .where('createdAt', '>=', currentDate)
      .where(
        'createdAt',
        '<',
        new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
      )

    const querySnapshot = await q.get()
    const userDetails = await findUserById(userId) // Make sure findUserById uses Firebase Admin SDK
    if (!userDetails) {
      console.error('User details not found')
      return null
    }

    const userTier = userDetails.tierName

    if (!querySnapshot.empty) {
      const dailyTrackingDoc = querySnapshot.docs[0]
      const dailyTrackingData = dailyTrackingDoc.data()
      return {
        success: dailyTrackingData.success,
        total: dailyTrackingData.total,
        totalSuccessArray: dailyTrackingData.successArray,
        tier: tierLimits[userTier as keyof typeof tierLimits],
      }
    } else {
      console.log('No daily tracking data found for today.')
      return null
    }
  } catch (error) {
    console.error('Error in fetching daily tracking data:', error)
    throw error
  }
}

export async function checkIfLimitExceeded_v2(
  userId: string,
  currentDate: Date
) {
  try {
    currentDate = new Date(currentDate)
    console.log('Checking limit for user:', userId)

    console.log('currentDate', currentDate)

    const userDetails = await getCurrentUser(userId) // This function should use Firebase Admin SDK

    console.log('userDetailssda sdasd', userDetails)
    if (!userDetails) {
      console.error('User details not found')
      return { result: true, message: 'User details not found', tierName: null }
    }

    const createdAt = userDetails.createdAt.toDate()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const freeTeirLimitExceded = sevenDaysAgo >= createdAt
    const freeTierName = 'Free Tier'
    const freeTierLimitDm = 10 // Limit for free tier users
    const dailyTrackingData = await getDailyTrackingData_v2(userId, currentDate) // This function should also use Firebase Admin SDK

    if (userDetails.tierName != null) {
      if (new Date() <= userDetails.stripeCurrentPeriodEnd.toDate()) {
        console.log('subscription is still valid')
        if (!dailyTrackingData) {
          console.log('No daily tracking data available')
          return {
            result: false,
            message: 'No daily tracking data available',
            tierName: userDetails.tierName,
          }
        } else {
          let successLimit =
            tierLimits[userDetails.tierName as keyof typeof tierLimits]
          if (dailyTrackingData.success >= successLimit) {
            return {
              result: true,
              message: 'Daily limit exceeded',
              tierName: userDetails.tierName,
            }
          } else {
            return {
              result: false,
              message: 'Limit not exceeded',
              tierName: userDetails.tierName,
            }
          }
        }
      } else {
        console.log('subscription period is not valid')
        return {
          result: true,
          message: 'Subscription period is not valid!',
          tierName: null,
        }
      }
    } else {
      console.log('user tier is null')

      if (!freeTeirLimitExceded) {
        if (!dailyTrackingData) {
          console.log('No daily tracking data available')
          return {
            result: false,
            message: 'No daily tracking data available',
            tierName: freeTierName,
          }
        }

        if (dailyTrackingData.success < freeTierLimitDm) {
          console.log('Free tier period is going on')
          return {
            result: false,
            message: 'Your Free tier is going on ',
            tierName: freeTierName,
          }
        }
      }

      return {
        result: true,
        message: 'You are not subscribed!',
        tierName: null,
      }
    }
  } catch (error) {
    console.error('Error in checking limit:', error)
    return { result: true, message: 'Error in checking limit', tierName: null }
  }
}

async function queryFoundOutFieldAdmin(userId: string) {
  const db = admin.firestore()
  const userRef = db.collection('users').doc(userId) // Reference to the user document

  try {
    const userSnap = await userRef.get() // Attempt to get the document

    if (userSnap.exists) {
      // Document exists
      const userData = userSnap.data() // Extract document data
      if (userData) {
        if ('foundOut' in userData) {
          // 'foundOut' field exists
          console.log('FoundOut field value:', userData.foundOut)
          return true // Return the value of 'foundOut' field
        } else {
          // 'foundOut' field does not exist
          console.log('FoundOut field does not exist for this user.')
          return false
        }
      }
    } else {
      // Document does not exist
      console.log('No such user document!')
      return null
    }
  } catch (error) {
    console.error("Error querying 'foundOut' field with Admin SDK:", error)
    return null
  }
}

export async function updateFoundOutField(
  userId: string,
  foundOutValue: { type: string }
) {
  const db = admin.firestore()
  const userRef = db.collection('users').doc(userId) // Reference to the user document

  try {
    // Update the 'foundOut' field for the specified user
    await userRef.set(
      {
        foundOut: foundOutValue.type,
      },
      { merge: true }
    ) // Using merge: true to not overwrite the entire document

    console.log(`Successfully updated 'foundOut' field for user ${userId}`)
    return true
  } catch (error) {
    console.error("Error updating 'foundOut' field with Admin SDK:", error)
    return false
  }
}


export async function updateVersionField(
  userId: string,
  version: string
) {
  const db = admin.firestore()


  const userRef = db.collection('users').doc(userId) // Reference to the user document
  const user = await userRef.get()
  const userData = user.data()
  const userVersion = userData?.version


  const versionRef = db.collection('version').doc('DqLpOiBJODi4fG7QbcRM') // Reference to the user document
  const versionOne = await versionRef.get()
  const versionData = versionOne.data()
  const versionVersion = versionData?.version

  console.log(versionData)
  console.log(userVersion)
  console.log(version)



  if (userVersion != versionVersion) {
    try {
      // Update the 'foundOut' field for the specified user
      await userRef.set(
        {
          version: version,
        },
        { merge: true }
      ) // Using merge: true to not overwrite the entire document

      console.log(`Successfully updated 'version' field for user ${userId}`)
      return true
    } catch (error) {
      console.error("Error updating 'version' field with Admin SDK:", error)
      return false
    }
  }
  console.log('version is same')
  return true

}
