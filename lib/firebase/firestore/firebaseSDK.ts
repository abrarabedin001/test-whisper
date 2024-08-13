// import { uploadFile } from '@/lib/firebase/firestore/firebaseSDK';
import * as admin from 'firebase-admin'
import { NextRequest } from 'next/server'
import * as path from 'path';
import { getDownloadURL, getStorage, ref, uploadBytes, } from "firebase/storage";
import { collection, doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import * as os from 'os';
import * as fs from 'fs';
import firebase_app from '../config';
const { createClient } = require("@deepgram/sdk");

const db2 = getFirestore(firebase_app);

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
)

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}
const db = admin.firestore()


export async function whisper(jobId: string, status: string, output: any, message: string) {
  try {


    const whisperRef = db.collection('whispers').doc(jobId ?? "trying")
    await whisperRef.set({ jobId, status, output, updatedAt: new Date(), message })

    const re2f = doc(db2, "experiment", "1");
    await updateDoc(re2f, {
      endTime: new Date(),
      jobId, status, output, updatedAt: new Date(), message
    });
    console.log('Whisper sent successfully.')
  } catch (error) {
    console.error('Error in updating daily tracking:', error)
    throw error
  }
  return { msg: 'No message needed' }
}


export async function uploadFile2(file: any) {
  try {
    console.log('file', file);
    const re2f = doc(db2, "experiment", "1");
    await setDoc(re2f, {
      startTime: new Date(),
    });
    const storage = getStorage(firebase_app);
    const storageRef = ref(storage, 'some-child');
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    const snapshot = await uploadBytes(storageRef, file).then((snapshot) => {
      console.log('Uploaded an array!');
      console.log(snapshot);
    });

    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PYANNOTE_SK}`,
        'Content-Type': 'application/json'
      },
      body: `{"voiceprints":[{"voiceprint":"34021ae0-d203-448a-a4d9-09eb432df824","label":"abrar"}],"url":"${downloadURL}","webhook":"https://test-whisper.vercel.app/api/whisper"}`
    };

    const [fetchResponse, deepgramResponse] = await Promise.all([
      fetch('https://api.pyannote.ai/v1/identify', options)
        .then(response => response.json())
        .catch(err => {
          console.error('Fetch error:', err);
          throw err;
        }),
      deepgram.listen.prerecorded.transcribeUrl(
        {
          url: `${downloadURL}`,
        },
        {
          model: "nova-2",
          smart_format: true,
        }
      ).catch((err: any) => {
        console.error('Deepgram error:', err);
        throw err;
      })
    ]);

    // Handle the results individually
    console.log('Fetch response:', fetchResponse);
    const { result, error } = deepgramResponse;

    await updateDoc(re2f, {
      result: result,
    });








  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}


