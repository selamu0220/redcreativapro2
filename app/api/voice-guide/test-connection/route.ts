import { NextRequest, NextResponse } from 'next/server';
import { getElevenLabsClient } from '../../../lib/elevenlabs-client';

export async function GET() {
  try {
    console.log('🔍 Testing ElevenLabs connection...');
    
    const client = getElevenLabsClient();
    
    // Test 1: Check if API key is configured
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'ElevenLabs API key not configured',
        tests: {
          apiKeyConfigured: false,
          voicesAccessible: false,
          speechGeneration: false
        }
      }, { status: 500 });
    }
    
    console.log('✅ API Key configured:', apiKey.substring(0, 8) + '...');
    
    // Test 2: Try to get voices
    let voicesTest = false;
    let voicesError = null;
    try {
      const voices = await client.getVoices();
      voicesTest = voices && voices.length > 0;
      console.log('✅ Voices retrieved:', voices?.length || 0);
    } catch (error) {
      voicesError = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Voices test failed:', voicesError);
    }
    
    // Test 3: Try to generate a small audio sample
    let speechTest = false;
    let speechError = null;
    let audioUrl = null;
    try {
      const audioBuffer = await client.generateSpeech(
        'Hola, esta es una prueba de audio.',
        'EXAVITQu4vr4xnSDxMaL'
      );
      
      if (audioBuffer && audioBuffer.byteLength > 0) {
        speechTest = true;
        audioUrl = client.createAudioUrl(audioBuffer);
        console.log('✅ Speech generation successful, buffer size:', audioBuffer.byteLength);
      }
    } catch (error) {
      speechError = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Speech generation failed:', speechError);
    }
    
    const allTestsPassed = voicesTest && speechTest;
    
    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed ? 'All tests passed' : 'Some tests failed',
      tests: {
        apiKeyConfigured: true,
        voicesAccessible: voicesTest,
        speechGeneration: speechTest
      },
      errors: {
        voices: voicesError,
        speech: speechError
      },
      audioUrl: audioUrl
    });
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tests: {
        apiKeyConfigured: !!process.env.ELEVENLABS_API_KEY,
        voicesAccessible: false,
        speechGeneration: false
      }
    }, { status: 500 });
  }
}