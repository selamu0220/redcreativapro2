import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    const user = await getUser();
    const authenticated = await isAuthenticated();

    if (!authenticated || !user) {
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
        email: user.email,
        created_at: new Date().toISOString()
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