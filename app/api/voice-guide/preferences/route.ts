import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Safe Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching preferences:', error);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    // Return default preferences if none exist
    const defaultPreferences = {
      user_id: userId,
      preferred_language: 'en',
      voice_id: 'EXAVITQu4vr4xnSDxMaL', // Default ElevenLabs voice
      voice_speed: 1.0,
      voice_volume: 0.8,
      auto_play: true,
      show_hotspots: true
    };

    return NextResponse.json({ 
      preferences: preferences || defaultPreferences 
    });
  } catch (error) {
    console.error('Error in preferences GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const { 
      user_id, 
      preferred_language, 
      voice_id, 
      voice_speed, 
      voice_volume, 
      auto_play, 
      show_hotspots 
    } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id,
        preferred_language: preferred_language || 'en',
        voice_id: voice_id || 'EXAVITQu4vr4xnSDxMaL',
        voice_speed: voice_speed || 1.0,
        voice_volume: voice_volume || 0.8,
        auto_play: auto_play !== undefined ? auto_play : true,
        show_hotspots: show_hotspots !== undefined ? show_hotspots : true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating preferences:', error);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    return NextResponse.json({ preferences: data });
  } catch (error) {
    console.error('Error in preferences POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}