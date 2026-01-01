import { NextRequest, NextResponse } from 'next/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    const user = await getUser();
    const authenticated = await isAuthenticated();

    if (!authenticated || !user) {
      return NextResponse.json({
        error: 'No active session',
        hasSession: false
      }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      hasSession: true,
      user: {
        id: user.id,
        email: user.email,
        hasEmail: true,
        createdAt: new Date().toISOString(),
        userMetadata: {}
      },
      message: 'User authenticated via Kinde'
    })

  } catch (error) {
    console.error('Error in current-user:', error)
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}