import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateSupabaseUser } from '@/app/lib/auth/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName, preferences } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 });
    }

    const profile = await createOrUpdateSupabaseUser(email, {
      id: userId,
      full_name: fullName,
      preferences: preferences || {}
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error syncing user profile:', error);
    return NextResponse.json({ 
      error: 'Error syncing user profile', 
      details: error.message 
    }, { status: 500 });
  }
}
