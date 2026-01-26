import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
        email: user.email,
        created_at: user.created_at
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