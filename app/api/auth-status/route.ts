import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
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
        email: user.emailAddresses[0]?.emailAddress,
        emailVerified: true, // Clerk handles this
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
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