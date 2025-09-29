import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '../../../lib/elevenlabs-client';

const elevenLabsClient = ElevenLabsClient.getInstance();

export async function GET(request: NextRequest) {
  try {
    const voices = await elevenLabsClient.getVoices();
    
    // Filter and format voices for the UI
    const formattedVoices = voices.map(voice => ({
      voice_id: voice.voice_id,
      name: voice.name,
      category: voice.category || 'generated',
      description: voice.description || '',
      preview_url: voice.preview_url || null,
      labels: voice.labels || {},
      settings: voice.settings || {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true
      }
    }));

    return NextResponse.json({ voices: formattedVoices });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch voices',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voice_id } = body;

    if (!voice_id) {
      return NextResponse.json({ error: 'Voice ID is required' }, { status: 400 });
    }

    const voiceDetails = await elevenLabsClient.getVoiceById(voice_id);
    
    if (!voiceDetails) {
      return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
    }

    return NextResponse.json({ voice: voiceDetails });
  } catch (error) {
    console.error('Error fetching voice details:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch voice details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}