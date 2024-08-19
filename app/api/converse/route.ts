import { getNextSteps, transcribeAudio } from "@/app/utils";
import { createOrUpdateRecording, getUser } from "@/lib/firebase/firestore/firebaseSDK";

import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest) {
  try {
    // const auth = await getUser(req);

    // if (!auth) {
    //   return NextResponse.json(
    //     { error: "User not authenticated" },
    //     { status: 401 }
    //   );
    // }

    const { url, recordingId } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PYANNOTE_SK}`,
        'Content-Type': 'application/json'
      },
      body: `{"voiceprints":[{"voiceprint":"uQi+Pegegj72ie29ftQDvg8SKr7mVSO+AOLcvgYoyr69NdE9GR/WvTw1Hj6a9OG+KdZHviFFOb7x6da9qYNxPjMFx73U8Xe6vAOWPsUKBz7ZN56+x/S6vhOm5j5Qcm++lKSpPlyzSr0KhiY+Obh5PX6yk7xc0uq9hpg7vtZYJL5Egp2+TEHEPo/o1b7QvrS+1b8WvpWdk77fOY49k57BvFk9Aj50kA0/QayVvKliPL+gghS9ADyKPtqtqr48JRQ8PHoSPunxxj3xHxg+q7iRPQ9/nz2aXEQ+lFbTvvB+ZL4KJfY9m2ucPH8TYD4k+zs+/wvjvgSo3Dyji8i9sQwgPWbfPr7ALIc+CaOdvXwkF77+tbI9iT6TPldsjj36cEu+XGikPa+DeD7B9oK+kpmUPjsEtb46d3s9GxUTvfMYKL7DWyq+lwLwvckxpj1EyNW8ZGupPQp4Hb5T9i6+hwNuPZFdxL2vAcG8LM8wvnn+ML50M1M+R/tiPr/Zkr4pEVK+4ONEPYKhCT0PGus+x6hVvt+3Gz2cGZc9xwiwvlbowT7IQS4+nJTFvOFinD3l/KQ+RBosPob2y76RQ52+mqeNPaeZbL5d2vA9gakGvemhG769dDI+VR2ZvjlLFj7fVEc+3s2xPTbBRj4JRKm8r7/xvXcwDD/3fwg/AYGsvgQRAT7mU2m+6cGJvSS/gj6Hyfe9ceCovl9WlT7JMZa+xaafPlQndj6RyQ091qNXPQDfML7hxR49kcL5vf2J9ztWD6++BmpivkcKVj56QKs9fJ/Fvt34f765Niq/4u21PvrA3D2ad4Q+2tlePplwOj92DI88/N+2Pn//t7494XS+YyuGvnWZCj9FkA2+GAgwvs3m8b7f08O9hsycvfZH8D23LP69F2R7O1kDLL7WPMy+LNKWPbot9zzHTZM+PRcyvrZ5vT4p/m8+ZktHvn3pIL5HDl++84xxPsCTAj9UWC2+ABQPvs6Etb1Wshu9kEXoPbfqPT69fYQ9N4KsvonVnj7DzjG8x8FpPpQYn77RqTM7xeUCP3Oq1D57UBS+f2QYP3yRoD0JTbY8yQh7vf2cOz7MLDo+ucvwPJdWfb6kPSI+EfCyvCp3mT51Z4Y+SwsrPXf0fj5sJJ+9p1pUvbRFTD7J+WK8QEVNvPF5Nb1oaiK+Uk45vanHTT3Uzai++a40PnCSkL4cLIu+RoI5PhNXBb/DKLm+V+ENPrdQu73950M+d9X3vF/Xhz7Bojm9z/GBPjERKzsv+lE490mBPnLtNz7P9dw9xMfQPZR8bD4sCHq9ROoZPtlPtT5BsUo+ikGrPgBJn75abfU9fBWuvhKLgb5qpGk+lJEuvpaNDr6u/JU7ORpKPg==","label":"ascendAi"}],"url":"${url}","webhook":"https://ff74-103-72-212-196.ngrok-free.app/api/whisper2"}`
    };

    console.log('url', url);


    const [pyannoteResponse, deepgramResponse] = await Promise.all([
      fetch('https://api.pyannote.ai/v1/identify', options)
        .then(response => response.json())
        .catch(err => {
          console.error('Fetch error:', err);
          throw err;
        }),
      transcribeAudio({ url })
    ]);

    if (!deepgramResponse) {
      return NextResponse.json(
        { error: "result couldn't be found" },
        { status: 400 }
      );
    }

    // const suggestion = await getNextSteps({ convo: deepgramResponse?.transcribes! });

    console.log('transcriptions', deepgramResponse.transcribes);

    await createOrUpdateRecording({
      // userId: auth?.uid ?? "1",
      userId: "experiment",
      recordingId,
      transcript: deepgramResponse.transcribes!,
      summary: deepgramResponse.gpt_res!,
      // suggestion: suggestion?.suggestion ?? "",
      voiceIdentifyId: pyannoteResponse?.jobId ?? "",


    });

    console.log("Transcription result:", deepgramResponse); // Log the result to see its structure

    return NextResponse.json(deepgramResponse, { status: 200 });
  } catch (error: any) {
    console.error("Error transcribing audio:", error); // Log the error for debugging
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
