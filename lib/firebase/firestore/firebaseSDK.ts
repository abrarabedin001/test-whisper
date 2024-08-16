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

    const re2f = db.collection("experiment").doc("1");
    await re2f.update({ jobId, status, output, message, endTime: new Date() });

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

    });

    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PYANNOTE_SK}`,
        'Content-Type': 'application/json'
      },
      body: `{"voiceprints":[{"voiceprint":"uQi+Pegegj72ie29ftQDvg8SKr7mVSO+AOLcvgYoyr69NdE9GR/WvTw1Hj6a9OG+KdZHviFFOb7x6da9qYNxPjMFx73U8Xe6vAOWPsUKBz7ZN56+x/S6vhOm5j5Qcm++lKSpPlyzSr0KhiY+Obh5PX6yk7xc0uq9hpg7vtZYJL5Egp2+TEHEPo/o1b7QvrS+1b8WvpWdk77fOY49k57BvFk9Aj50kA0/QayVvKliPL+gghS9ADyKPtqtqr48JRQ8PHoSPunxxj3xHxg+q7iRPQ9/nz2aXEQ+lFbTvvB+ZL4KJfY9m2ucPH8TYD4k+zs+/wvjvgSo3Dyji8i9sQwgPWbfPr7ALIc+CaOdvXwkF77+tbI9iT6TPldsjj36cEu+XGikPa+DeD7B9oK+kpmUPjsEtb46d3s9GxUTvfMYKL7DWyq+lwLwvckxpj1EyNW8ZGupPQp4Hb5T9i6+hwNuPZFdxL2vAcG8LM8wvnn+ML50M1M+R/tiPr/Zkr4pEVK+4ONEPYKhCT0PGus+x6hVvt+3Gz2cGZc9xwiwvlbowT7IQS4+nJTFvOFinD3l/KQ+RBosPob2y76RQ52+mqeNPaeZbL5d2vA9gakGvemhG769dDI+VR2ZvjlLFj7fVEc+3s2xPTbBRj4JRKm8r7/xvXcwDD/3fwg/AYGsvgQRAT7mU2m+6cGJvSS/gj6Hyfe9ceCovl9WlT7JMZa+xaafPlQndj6RyQ091qNXPQDfML7hxR49kcL5vf2J9ztWD6++BmpivkcKVj56QKs9fJ/Fvt34f765Niq/4u21PvrA3D2ad4Q+2tlePplwOj92DI88/N+2Pn//t7494XS+YyuGvnWZCj9FkA2+GAgwvs3m8b7f08O9hsycvfZH8D23LP69F2R7O1kDLL7WPMy+LNKWPbot9zzHTZM+PRcyvrZ5vT4p/m8+ZktHvn3pIL5HDl++84xxPsCTAj9UWC2+ABQPvs6Etb1Wshu9kEXoPbfqPT69fYQ9N4KsvonVnj7DzjG8x8FpPpQYn77RqTM7xeUCP3Oq1D57UBS+f2QYP3yRoD0JTbY8yQh7vf2cOz7MLDo+ucvwPJdWfb6kPSI+EfCyvCp3mT51Z4Y+SwsrPXf0fj5sJJ+9p1pUvbRFTD7J+WK8QEVNvPF5Nb1oaiK+Uk45vanHTT3Uzai++a40PnCSkL4cLIu+RoI5PhNXBb/DKLm+V+ENPrdQu73950M+d9X3vF/Xhz7Bojm9z/GBPjERKzsv+lE490mBPnLtNz7P9dw9xMfQPZR8bD4sCHq9ROoZPtlPtT5BsUo+ikGrPgBJn75abfU9fBWuvhKLgb5qpGk+lJEuvpaNDr6u/JU7ORpKPg==","label":"ascendAi"}],"url":"${downloadURL}","webhook":"https://test-whisper.vercel.app/api/whisper"}`
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
      midTime: new Date(),
    });


  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
// uploadUrl


export async function uploadUrl(url: any) {
  try {
    console.log('url', url);
    const re2f = doc(db2, "experiment", "1");
    await setDoc(re2f, {
      startTime: new Date(),
    });

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PYANNOTE_SK}`,
        'Content-Type': 'application/json'
      },
      body: `{"voiceprints":[{"voiceprint":"uQi+Pegegj72ie29ftQDvg8SKr7mVSO+AOLcvgYoyr69NdE9GR/WvTw1Hj6a9OG+KdZHviFFOb7x6da9qYNxPjMFx73U8Xe6vAOWPsUKBz7ZN56+x/S6vhOm5j5Qcm++lKSpPlyzSr0KhiY+Obh5PX6yk7xc0uq9hpg7vtZYJL5Egp2+TEHEPo/o1b7QvrS+1b8WvpWdk77fOY49k57BvFk9Aj50kA0/QayVvKliPL+gghS9ADyKPtqtqr48JRQ8PHoSPunxxj3xHxg+q7iRPQ9/nz2aXEQ+lFbTvvB+ZL4KJfY9m2ucPH8TYD4k+zs+/wvjvgSo3Dyji8i9sQwgPWbfPr7ALIc+CaOdvXwkF77+tbI9iT6TPldsjj36cEu+XGikPa+DeD7B9oK+kpmUPjsEtb46d3s9GxUTvfMYKL7DWyq+lwLwvckxpj1EyNW8ZGupPQp4Hb5T9i6+hwNuPZFdxL2vAcG8LM8wvnn+ML50M1M+R/tiPr/Zkr4pEVK+4ONEPYKhCT0PGus+x6hVvt+3Gz2cGZc9xwiwvlbowT7IQS4+nJTFvOFinD3l/KQ+RBosPob2y76RQ52+mqeNPaeZbL5d2vA9gakGvemhG769dDI+VR2ZvjlLFj7fVEc+3s2xPTbBRj4JRKm8r7/xvXcwDD/3fwg/AYGsvgQRAT7mU2m+6cGJvSS/gj6Hyfe9ceCovl9WlT7JMZa+xaafPlQndj6RyQ091qNXPQDfML7hxR49kcL5vf2J9ztWD6++BmpivkcKVj56QKs9fJ/Fvt34f765Niq/4u21PvrA3D2ad4Q+2tlePplwOj92DI88/N+2Pn//t7494XS+YyuGvnWZCj9FkA2+GAgwvs3m8b7f08O9hsycvfZH8D23LP69F2R7O1kDLL7WPMy+LNKWPbot9zzHTZM+PRcyvrZ5vT4p/m8+ZktHvn3pIL5HDl++84xxPsCTAj9UWC2+ABQPvs6Etb1Wshu9kEXoPbfqPT69fYQ9N4KsvonVnj7DzjG8x8FpPpQYn77RqTM7xeUCP3Oq1D57UBS+f2QYP3yRoD0JTbY8yQh7vf2cOz7MLDo+ucvwPJdWfb6kPSI+EfCyvCp3mT51Z4Y+SwsrPXf0fj5sJJ+9p1pUvbRFTD7J+WK8QEVNvPF5Nb1oaiK+Uk45vanHTT3Uzai++a40PnCSkL4cLIu+RoI5PhNXBb/DKLm+V+ENPrdQu73950M+d9X3vF/Xhz7Bojm9z/GBPjERKzsv+lE490mBPnLtNz7P9dw9xMfQPZR8bD4sCHq9ROoZPtlPtT5BsUo+ikGrPgBJn75abfU9fBWuvhKLgb5qpGk+lJEuvpaNDr6u/JU7ORpKPg==","label":"ascendAi"}],"url":"${url}","webhook":"https://test-whisper.vercel.app/api/whisper"}`
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
          url: `${url}`,
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
      midTime: new Date(),
    });


  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}


