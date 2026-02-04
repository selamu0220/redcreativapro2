import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
        email: user.email,
        emailVerified: !!user.email_confirmed_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at
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
