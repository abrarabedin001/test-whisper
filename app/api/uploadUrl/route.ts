import { uploadUrl } from '@/lib/firebase/firestore/firebaseSDK';
import { NextRequest, NextResponse } from 'next/server';



export async function POST(request: NextRequest) {

  const {url} = await request.json() ; // TypeScript workaround to access the raw request


  https://firebasestorage.googleapis.com/v0/b/transcription-d9c70.appspot.com/o/some-child?alt=media&token=ec8035a9-1a15-42c8-ad57-3d4d090130f4

  await uploadUrl(url);
  return NextResponse.json({ status: 'received' }, { status: 200 });


}