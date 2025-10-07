import { NextRequest, NextResponse } from 'next/server';
import { getElevenLabsClient } from '../../../lib/elevenlabs-client';
import { createClient } from '@supabase/supabase-js';

// Simple in-memory cache for development (replace with Redis/DB in production)
const audioCache = new Map<string, { audioUrl: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Safe Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_url' && supabaseServiceKey !== 'your_supabase_service_role_key') {
  try {
    // Validar URL
    new URL(supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client during build:', error);
    supabase = null;
  }
} else {
  console.warn('Supabase environment variables not configured or using placeholder values');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice_id, voice_settings, cache_key } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log('🎵 Generating speech for:', { text: text.substring(0, 50) + '...', voice_id });

    // Check if audio is already cached
    if (cache_key) {
      const cached = audioCache.get(cache_key);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('✅ Using cached audio');
        return NextResponse.json({ 
          audio_url: cached.audioUrl,
          cached: true 
        });
      }
    }

    // Generate speech using ElevenLabs
    const client = getElevenLabsClient();
    const audioBuffer = await client.generateSpeech(
      text,
      voice_id || 'EXAVITQu4vr4xnSDxMaL',
      voice_settings
    );

    // Convert ArrayBuffer to base64 data URL
    const uint8Array = new Uint8Array(audioBuffer);
    const base64Audio = Buffer.from(uint8Array).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    // Cache the audio if cache_key is provided
    if (cache_key) {
      audioCache.set(cache_key, {
        audioUrl,
        timestamp: Date.now()
      });
      console.log('💾 Audio cached with key:', cache_key);
    }

    console.log('✅ Speech generated successfully, size:', audioBuffer.byteLength, 'bytes');
    return NextResponse.json({ 
      audio_url: audioUrl,
      cached: false 
    });
  } catch (error) {
    console.error('❌ Error generating speech:', error);
    return NextResponse.json({ 
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cacheKey = searchParams.get('cache_key');

    if (!cacheKey) {
      return NextResponse.json({ error: 'Cache key is required' }, { status: 400 });
    }

    const { data: cachedAudio, error } = await supabase
      .from('audio_cache')
      .select('audio_url, created_at')
      .eq('cache_key', cacheKey)
      .single();

    if (error || !cachedAudio) {
      return NextResponse.json({ error: 'Audio not found in cache' }, { status: 404 });
    }

    return NextResponse.json({ 
      audio_url: cachedAudio.audio_url,
      created_at: cachedAudio.created_at
    });
  } catch (error) {
    console.error('Error fetching cached audio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}