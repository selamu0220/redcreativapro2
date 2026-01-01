import { NextRequest, NextResponse } from 'next/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    const user = await getUser();
    const authenticated = await isAuthenticated();

    if (!authenticated || !user) {
      return NextResponse.json({
        authenticated: false,
        message: 'No active session'
      })
    }

    return NextResponse.json({
      authenticated: true,
      session: true,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in auth-status:', error)
    return NextResponse.json({
      authenticated: false,
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}