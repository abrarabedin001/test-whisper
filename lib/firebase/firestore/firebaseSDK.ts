// import { uploadFile } from '@/lib/firebase/firestore/firebaseSDK';
import * as admin from 'firebase-admin'
import { NextRequest } from 'next/server'
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes, } from "firebase/storage";
import { doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';

import firebase_app from '../config';


type transcript = { text: string; start: number; end: number; }[];

type voiceIdentificationType = { speaker: string; start: number; end: number; }[];


import { create } from 'domain';
import { getNextSteps } from '@/app/utils';
const { createClient } = require("@deepgram/sdk");

const db2 = getFirestore();

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
)

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}
const db = admin.firestore()

const storage = getStorage(firebase_app);


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

export async function whisper2(jobId: string, status: string, output: { identification: voiceIdentificationType }, message: string) {
  try {

    await AddRecordingTranscript({ userId: "1", voiceIdentifyId: jobId, voiceIdentificationArray: output.identification });
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
      body: `{"voiceprints":[{"voiceprint":"uQi+Pegegj72ie29ftQDvg8SKr7mVSO+AOLcvgYoyr69NdE9GR/WvTw1Hj6a9OG+KdZHviFFOb7x6da9qYNxPjMFx73U8Xe6vAOWPsUKBz7ZN56+x/S6vhOm5j5Qcm++lKSpPlyzSr0KhiY+Obh5PX6yk7xc0uq9hpg7vtZYJL5Egp2+TEHEPo/o1b7QvrS+1b8WvpWdk77fOY49k57BvFk9Aj50kA0/QayVvKliPL+gghS9ADyKPtqtqr48JRQ8PHoSPunxxj3xHxg+q7iRPQ9/nz2aXEQ+lFbTvvB+ZL4KJfY9m2ucPH8TYD4k+zs+/wvjvgSo3Dyji8i9sQwgPWbfPr7ALIc+CaOdvXwkF77+tbI9iT6TPldsjj36cEu+XGikPa+DeD7B9oK+kpmUPjsEtb46d3s9GxUTvfMYKL7DWyq+lwLwvckxpj1EyNW8ZGupPQp4Hb5T9i6+hwNuPZFdxL2vAcG8LM8wvnn+ML50M1M+R/tiPr/Zkr4pEVK+4ONEPYKhCT0PGus+x6hVvt+3Gz2cGZc9xwiwvlbowT7IQS4+nJTFvOFinD3l/KQ+RBosPob2y76RQ52+mqeNPaeZbL5d2vA9gakGvemhG769dDI+VR2ZvjlLFj7fVEc+3s2xPTbBRj4JRKm8r7/xvXcwDD/3fwg/AYGsvgQRAT7mU2m+6cGJvSS/gj6Hyfe9ceCovl9WlT7JMZa+xaafPlQndj6RyQ091qNXPQDfML7hxR49kcL5vf2J9ztWD6++BmpivkcKVj56QKs9fJ/Fvt34f765Niq/4u21PvrA3D2ad4Q+2tlePplwOj92DI88/N+2Pn//t7494XS+YyuGvnWZCj9FkA2+GAgwvs3m8b7f08O9hsycvfZH8D23LP69F2R7O1kDLL7WPMy+LNKWPbot9zzHTZM+PRcyvrZ5vT4p/m8+ZktHvn3pIL5HDl++84xxPsCTAj9UWC2+ABQPvs6Etb1Wshu9kEXoPbfqPT69fYQ9N4KsvonVnj7DzjG8x8FpPpQYn77RqTM7xeUCP3Oq1D57UBS+f2QYP3yRoD0JTbY8yQh7vf2cOz7MLDo+ucvwPJdWfb6kPSI+EfCyvCp3mT51Z4Y+SwsrPXf0fj5sJJ+9p1pUvbRFTD7J+WK8QEVNvPF5Nb1oaiK+Uk45vanHTT3Uzai++a40PnCSkL4cLIu+RoI5PhNXBb/DKLm+V+ENPrdQu73950M+d9X3vF/Xhz7Bojm9z/GBPjERKzsv+lE490mBPnLtNz7P9dw9xMfQPZR8bD4sCHq9ROoZPtlPtT5BsUo+ikGrPgBJn75abfU9fBWuvhKLgb5qpGk+lJEuvpaNDr6u/JU7ORpKPg==","label":"ascendAi"}],"url":"${url}","webhook":"https://4ab4-103-72-212-207.ngrok-free.app/api/whisper"}`
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






export async function getUser(req: NextRequest) {
  try {
    const firebaseToken = req.headers.get("authorization")?.split(" ")[1];
    if (!firebaseToken) {
      console.log("No Firebase token provided.");
      return null;
    }

    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

export async function createOrUpdateRecording(params: {
  userId: string;
  recordingId: string;
  transcript: { text: string; start: number; end: number; }[];
  summary: string;
  // suggestion: string;
  voiceIdentifyId: string;
}) {
  const db = admin.firestore();
  const docRef = db.doc(
    `user/${params.userId}/recording/${params.recordingId}/`
  );

  try {
    const doc = await docRef.get();
    console.log('Checking if doc exists:', doc.exists)

    if (!doc.exists) {
      console.log('Doc did not exist:')
      await docRef.set({
        conversation: [
          {
            transcript: params.transcript,
            summary: params.summary,
            // suggestion: params.suggestion,
            voiceIdentifyId: params.voiceIdentifyId,
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
      });
      return { result: "Conversation Cceated successfully" };
    }

    const docData = doc.data();
    // console.log("Document data:", docData);

    docData?.conversation.push({
      transcript: params.transcript,
      summary: params.summary,
      // suggestion: params.suggestion,
      voiceIdentifyId: params.voiceIdentifyId,
      updatedAt: new Date(),
    });

    await docRef.update({
      conversation: docData?.conversation
    });

    return { result: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: error };
  }
}

export async function AddRecordingTranscript(params: {
  userId: string;
  voiceIdentifyId: string;
  voiceIdentificationArray: voiceIdentificationType;
}) {
  const db = admin.firestore();
  const docRef = db.doc(
    `user/experiment/recording/helloAbrar/`
  );

  try {
    const doc = await docRef.get();
    console.log('Checking if doc exists:', doc.exists)

    // if (!doc.exists) {
    //   console.log('Doc did not exist:')
    //   await docRef.set({
    //     conversation: [
    //       {
    //         transcript: params.transcript,
    //         summary: params.summary,
    //         // suggestion: params.suggestion,
    //         voiceIdentifyId: params.voiceIdentifyId,
    //         createdAt: new Date(),
    //       },
    //     ],
    //     createdAt: new Date(),
    //   });
    //   return { result: "Conversation Cceated successfully" };
    // }

    const docData = doc.data();
    // console.log("Document data:", docData);

    let conversation = docData?.conversation;

    let object = conversation.filter((item: any) => {
      return item.voiceIdentifyId === params.voiceIdentifyId;
    });

    console.log('Object:', object);

    let transcript = object[0].transcript;

    let rest = conversation.filter((item: any) => {
      return item.voiceIdentifyId !== params.voiceIdentifyId;
    });



    // await docRef.update({
    //   conversation: docData?.conversation
    // });

    let combinedSegments = combineSameSpeakerSegments(params.voiceIdentificationArray);
    let transcriptWithSpeakers = assignSpeakersToTranscription(combinedSegments, transcript);

    const suggestion = await getNextSteps({ convo: transcriptWithSpeakers });
    const newObject = {
      ...object[0],
      transcript: transcriptWithSpeakers,
      suggestion: suggestion?.suggestion,
      updatedAt: new Date(),
    }
    console.log('New Object:', newObject);

    rest.push(newObject);


    // docData?.conversation.push({
    //   transcript: params.transcript,
    //   summary: params.summary,
    //   suggestion: suggestion?.suggestion,
    //   voiceIdentifyId: params.voiceIdentifyId,
    //   updatedAt: new Date(),
    // });

    await docRef.set({ conversation: rest, createdAt: docData?.createdAt });

    return { result: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: error };
  }
}

export const deleteAudio = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error(error);
  }
}



export function combineSameSpeakerSegments(voiceIdentification: voiceIdentificationType) {
  let combined = [];

  for (let i = 0; i < voiceIdentification.length; i++) {
    const currentSegment = voiceIdentification[i];

    // If the combined array is empty, just add the current segment
    if (combined.length === 0) {
      combined.push({ ...currentSegment });
    } else {
      // Get the last segment in the combined array
      let lastSegment = combined[combined.length - 1];

      // If the current segment has the same speaker as the last combined segment
      if (lastSegment.speaker === currentSegment.speaker) {
        // Update the end time of the last combined segment to the current segment's end time
        lastSegment.end = currentSegment.end;
      } else {
        // Otherwise, add the current segment to the combined array
        combined.push({ ...currentSegment });
      }
    }
  }

  return combined;
}


export function assignSpeakersToTranscription(voiceIdentification: voiceIdentificationType, transcriptionSentences: transcript) {
  let transcriptWithSpeakers = "";

  transcriptionSentences.forEach(sentence => {
    let assignedSpeaker = null;

    // Find the most relevant speaker for this sentence
    for (let i = 0; i < voiceIdentification.length; i++) {
      let speaker = voiceIdentification[i];

      // Check if the sentence falls within the speaker's time range
      if (
        (sentence.start >= speaker.start && sentence.start <= speaker.end) ||
        (sentence.end >= speaker.start && sentence.end <= speaker.end) ||
        (sentence.start <= speaker.start && sentence.end >= speaker.end)
      ) {
        assignedSpeaker = speaker.speaker;
        break;
      }
    }

    // Assign the sentence to the identified speaker
    if (assignedSpeaker) {
      transcriptWithSpeakers += `${assignedSpeaker}: ${sentence.text}\n`;
    } else {
      // If no speaker is found (should not happen in a perfect case), handle it here
      transcriptWithSpeakers += `Unknown: ${sentence.text}\n`;
    }
  });

  return transcriptWithSpeakers;
}