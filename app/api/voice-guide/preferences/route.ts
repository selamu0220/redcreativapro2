import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Default preferences
const DEFAULT_PREFERENCES = {
  preferred_language: 'es',
  voice_id: 'EXAVITQu4vr4xnSDxMaL',
  voice_speed: 1.0,
  voice_volume: 0.8,
  auto_play: true,
  show_hotspots: true
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // In a real app, you would fetch from Vercel KV or similar
    // For now, return defaults as Supabase is removed
    return NextResponse.json({
      preferences: { ...DEFAULT_PREFERENCES, user_id: userId }
    });
  } catch (error) {
    console.error('Error in preferences GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const body = await request.json();

    // Mock save logic (use KV in production)
    console.log(`[VOICE-GUIDE] Preferences updated for user ${userId}:`, body);

    return NextResponse.json({
      preferences: { ...DEFAULT_PREFERENCES, ...body, user_id: userId, updated_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error in preferences POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
