import { NextRequest, NextResponse } from 'next/server';


export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
 
  const req = await request.formData() as any; // TypeScript workaround to access the raw request
  console.log('req', req);
  return NextResponse.json({ status: 'received' }, { status: 200 });

}