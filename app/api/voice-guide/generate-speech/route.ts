import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getElevenLabsClient } from '../../../lib/elevenlabs-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice_id, voice_settings, cache_key } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Check if audio is already cached
    if (cache_key) {
      const { data: cachedAudio } = await supabase
        .from('audio_cache')
        .select('audio_url')
        .eq('cache_key', cache_key)
        .single();

      if (cachedAudio?.audio_url) {
        return NextResponse.json({ 
          audio_url: cachedAudio.audio_url,
          cached: true 
        });
      }
    }

    // Generate speech using ElevenLabs
    const client = getElevenLabsClient();
    const audioBuffer = await client.generateSpeech(
      text,
      voice_id || 'EXAVITQu4vr4xnSDxMaL'
    );

    // Convert ArrayBuffer to base64 data URL
    const uint8Array = new Uint8Array(audioBuffer);
    const base64Audio = Buffer.from(uint8Array).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    // Cache the audio if cache_key is provided
    if (cache_key) {
      await supabase
        .from('audio_cache')
        .upsert({
          cache_key,
          audio_url: audioUrl,
          text_hash: Buffer.from(text).toString('base64'),
          voice_id: voice_id || 'EXAVITQu4vr4xnSDxMaL',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'cache_key'
        });
    }

    return NextResponse.json({ 
      audio_url: audioUrl,
      cached: false 
    });
  } catch (error) {
    console.error('Error generating speech:', error);
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