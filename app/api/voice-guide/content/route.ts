import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with fallback values for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase configuration missing');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const tutorialId = searchParams.get('tutorial_id');
    const language = searchParams.get('language') || 'en';

    if (!tutorialId) {
      return NextResponse.json({ error: 'Tutorial ID is required' }, { status: 400 });
    }

    // Get tutorial with hotspots and voice scripts
    const { data: tutorial, error: tutorialError } = await supabase
      .from('tutorials')
      .select(`
        *,
        hotspots (*),
        voice_scripts (*)
      `)
      .eq('id', tutorialId)
      .eq('language', language)
      .single();

    if (tutorialError) {
      console.error('Error fetching tutorial:', tutorialError);
      return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
    }

    return NextResponse.json({ tutorial });
  } catch (error) {
    console.error('Error in voice-guide content API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase configuration missing');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const { tutorial_id, hotspot_id, user_id } = body;

    if (!tutorial_id || !user_id) {
      return NextResponse.json({ error: 'Tutorial ID and User ID are required' }, { status: 400 });
    }

    // Update or create tutorial progress
    const { data, error } = await supabase
      .from('tutorial_progress')
      .upsert({
        user_id,
        tutorial_id,
        current_hotspot_id: hotspot_id,
        completed: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,tutorial_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating tutorial progress:', error);
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }

    return NextResponse.json({ progress: data });
  } catch (error) {
    console.error('Error in voice-guide content POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}