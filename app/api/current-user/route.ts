import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // Kinde's isAuthenticated check is essentially "do we have a user?"
    const authenticated = !!user && !error;

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
