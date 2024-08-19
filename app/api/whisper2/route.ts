
import { whisper2 } from '@/lib/firebase/firestore/firebaseSDK'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { jobId, status, output, message } = await request.json()
  console.log(jobId, status, output, message)
  await whisper2(jobId ?? '1', status ?? '', output ?? '', message ?? '')
  return NextResponse.json({ status: 'received' }, { status: 200 })
}
