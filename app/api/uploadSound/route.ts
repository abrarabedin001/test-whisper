import { uploadFile2 } from '@/lib/firebase/firestore/firebaseSDK';
import { NextRequest, NextResponse } from 'next/server';


export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {

  const formData = await request.formData() as any; // TypeScript workaround to access the raw request
  const file = formData.get('file') as File;

  https://firebasestorage.googleapis.com/v0/b/transcription-d9c70.appspot.com/o/some-child?alt=media&token=ec8035a9-1a15-42c8-ad57-3d4d090130f4

  await uploadFile2(file);
  return NextResponse.json({ status: 'received' }, { status: 200 });


}