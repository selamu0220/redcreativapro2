import { NextResponse } from 'next/server';

export async function GET() {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const sk = process.env.CLERK_SECRET_KEY;
  
  return NextResponse.json({
    hasPk: !!pk,
    pkPrefix: pk?.substring(0, 8),
    pkSuffix: pk?.substring(pk.length - 4),
    hasSk: !!sk,
    skPrefix: sk?.substring(0, 8),
    nodeEnv: process.env.NODE_ENV
  });
}
