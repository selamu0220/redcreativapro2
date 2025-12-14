import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
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
        email: user.emailAddresses[0]?.emailAddress,
        hasEmail: true,
        createdAt: user.createdAt,
        userMetadata: user.publicMetadata || {}
      },
      message: 'User authenticated via Clerk'
    })

  } catch (error) {
    console.error('Error in current-user:', error)
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}