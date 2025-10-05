import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, message, category } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'User ID and message are required' },
        { status: 400 }
      );
    }

    console.log('💬 Saving suggestion from user:', userId);

    // Initialize Supabase client at runtime
    const supabase = getSupabaseClient();

    // Insert suggestion into database
    const { data, error } = await supabase
      .from('suggestions')
      .insert({
        user_id: userId,
        message: message.trim(),
        category: category || 'general'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving suggestion:', error);
      return NextResponse.json(
        { error: 'Failed to save suggestion' },
        { status: 500 }
      );
    }

    console.log('✅ Suggestion saved successfully:', data.id);

    return NextResponse.json({
      success: true,
      message: 'Suggestion sent successfully',
      suggestionId: data.id
    });

  } catch (error) {
    console.error('❌ Error saving suggestion:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save suggestion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client at runtime
    const supabase = getSupabaseClient();

    // Get user's suggestions
    const { data: suggestions, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching suggestions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      suggestions: suggestions || []
    });

  } catch (error) {
    console.error('❌ Error fetching suggestions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}