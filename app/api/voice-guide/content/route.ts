import { NextRequest, NextResponse } from 'next/server';
// Safe Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_url' && supabaseServiceKey !== 'your_supabase_service_role_key') {
  try {
    // Validar URL
    new URL(supabaseUrl);
    supabase = null; // Supabase removed
  } catch (error) {
    console.warn('Failed to initialize Supabase client during build:', error);
    supabase = null;
  }
} else {
  console.warn('Supabase environment variables not configured or using placeholder values');
}

export async function GET(request: NextRequest) {
  try {const { searchParams } = new URL(request.url);
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
  try {const body = await request.json();
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