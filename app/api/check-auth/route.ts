import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        hasSession: false,
        message: 'No active session'
      }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      hasSession: true,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        created_at: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error in check-auth:', error);
    return NextResponse.json({
      authenticated: false,
      hasSession: false,
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}