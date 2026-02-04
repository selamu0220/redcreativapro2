'use client';

import React, { useState } from 'react';
import { Play, Volume2, AlertCircle, CheckCircle } from 'lucide-react';

interface AudioDiagnosticProps {
  language?: 'en' | 'es' | 'fr' | 'de';
}

export function AudioDiagnostic({ language = 'es' }: AudioDiagnosticProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testTexts = {
    en: 'Hello, this is a test of the voice guide system.',
    es: 'Hola, esta es una prueba del sistema de guía de voz.',
    fr: 'Bonjour, ceci est un test du système de guide vocal.',
    de: 'Hallo, dies ist ein Test des Sprachführungssystems.'
  };

  const labels = {
    en: {
      title: 'Audio Diagnostic Tool',
      testButton: 'Test Audio Generation',
      playButton: 'Play Test Audio',
      testing: 'Generating audio...',
      playing: 'Playing...',
      success: 'Audio generated successfully!',
      error: 'Error:',
      instructions: 'Click the button below to test audio generation and playback.'
    },
    es: {
      title: 'Herramienta de Diagnóstico de Audio',
      testButton: 'Probar Generación de Audio',
      playButton: 'Reproducir Audio de Prueba',
      testing: 'Generando audio...',
      playing: 'Reproduciendo...',
      success: '¡Audio generado exitosamente!',
      error: 'Error:',
      instructions: 'Haz clic en el botón de abajo para probar la generación y reproducción de audio.'
    },
    fr: {
      title: 'Outil de Diagnostic Audio',
      testButton: 'Tester la Génération Audio',
      playButton: 'Lire l\'Audio de Test',
      testing: 'Génération audio...',
      playing: 'Lecture...',
      success: 'Audio généré avec succès!',
      error: 'Erreur:',
      instructions: 'Cliquez sur le bouton ci-dessous pour tester la génération et la lecture audio.'
    },
    de: {
      title: 'Audio-Diagnosetool',
      testButton: 'Audio-Generierung Testen',
      playButton: 'Test-Audio Abspielen',
      testing: 'Audio wird generiert...',
      playing: 'Wird abgespielt...',
      success: 'Audio erfolgreich generiert!',
      error: 'Fehler:',
      instructions: 'Klicken Sie auf die Schaltfläche unten, um die Audio-Generierung und -Wiedergabe zu testen.'
    }
  };

  const currentLabels = labels[language];
  const testText = testTexts[language];

  const testConnection = async () => {
    setIsTestingConnection(true);
    setError(null);
    
    try {
      console.log('🔍 Testing ElevenLabs connection...');
      
      const response = await fetch('/api/voice-guide/test-connection');
      const data = await response.json();
      
      console.log('🔍 Connection test result:', data);
      setConnectionTest(data);
      
      if (!data.success) {
        setError(`Connection test failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('❌ Connection test error:', err);
      setError(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testAudioGeneration = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setAudioUrl(null);

    try {
      console.log('🎵 Testing audio generation with text:', testText);
      console.log('🔑 Using voice ID: EXAVITQu4vr4xnSDxMaL');
      
      const requestBody = {
        text: testText,
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        cache_key: `diagnostic_test_${Date.now()}`
      };
      
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch('/api/voice-guide/generate-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📥 Response data keys:', Object.keys(data));
      console.log('📥 Response data:', {
        ...data,
        audio_url: data.audio_url ? `${data.audio_url.substring(0, 50)}...` : 'No audio URL'
      });

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.audio_url) {
        setAudioUrl(data.audio_url);
        setSuccess(`${currentLabels.success} (${data.cached ? 'Cached' : 'Generated'})`);
        console.log('✅ Audio URL generated successfully');
        console.log('🎵 Audio format:', data.audio_url.split(';')[0]);
      } else {
        throw new Error('No audio URL received from server');
      }
    } catch (err) {
      console.error('❌ Audio generation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const playTestAudio = async () => {
    if (!audioUrl) return;

    setIsPlaying(true);
    setError(null);

    try {
      console.log('🔊 Attempting to play audio...');
      console.log('🎵 Audio URL format:', audioUrl.substring(0, 30) + '...');
      
      const audio = new Audio();
      
      // Set up comprehensive event listeners
      audio.onloadstart = () => console.log('📥 Audio loading started');
      audio.onloadeddata = () => console.log('📥 Audio data loaded');
      audio.oncanplay = () => console.log('✅ Audio can start playing');
      audio.oncanplaythrough = () => console.log('✅ Audio can play through');
      audio.onplay = () => console.log('▶️ Audio play started');
      audio.onplaying = () => console.log('▶️ Audio is playing');
      audio.onpause = () => console.log('⏸️ Audio paused');
      audio.onended = () => {
        console.log('⏹️ Audio playback ended');
        setIsPlaying(false);
      };
      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        console.error('❌ Audio error details:', {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState
        });
        setError(`Error playing audio: ${audio.error?.message || 'Unknown audio error'}`);
        setIsPlaying(false);
      };
      audio.onabort = () => {
        console.log('⚠️ Audio loading aborted');
        setIsPlaying(false);
      };
      audio.onstalled = () => console.log('⚠️ Audio loading stalled');
      audio.onsuspend = () => console.log('⚠️ Audio loading suspended');
      audio.onwaiting = () => console.log('⏳ Audio waiting for data');

      // Set the source and attempt to play
      audio.src = audioUrl;
      audio.load(); // Explicitly load the audio
      
      console.log('🎵 Audio element created, attempting to play...');
      await audio.play();
      console.log('✅ Audio play() called successfully');
    } catch (err) {
      console.error('❌ Audio play error:', err);
      setError(err instanceof Error ? err.message : 'Failed to play audio');
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="flex items-center space-x-2 mb-4">
        <Volume2 className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">{currentLabels.title}</h2>
      </div>

      <p className="text-gray-600 mb-6">{currentLabels.instructions}</p>

      <div className="space-y-4">
        {/* Test Connection Button */}
        <button
          onClick={testConnection}
          disabled={isTestingConnection}
          className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          <span>{isTestingConnection ? 'Probando conexión...' : 'Probar Conexión ElevenLabs'}</span>
        </button>

        {/* Test Generation Button */}
        <button
          onClick={testAudioGeneration}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>{isLoading ? currentLabels.testing : currentLabels.testButton}</span>
        </button>

        {/* Play Test Audio Button */}
        {audioUrl && (
          <button
            onClick={playTestAudio}
            disabled={isPlaying}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlaying ? currentLabels.playing : currentLabels.playButton}</span>
          </button>
        )}

        {/* Connection Test Results */}
        {connectionTest && (
          <div className={`p-3 border rounded-lg ${
            connectionTest.success 
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}>
            <div className="font-medium mb-2">
              Estado de la conexión: {connectionTest.success ? '✅ Exitosa' : '⚠️ Con problemas'}
            </div>
            <div className="text-sm space-y-1">
              <div>API Key: {connectionTest.tests?.apiKeyConfigured ? '✅' : '❌'}</div>
              <div>Acceso a voces: {connectionTest.tests?.voicesAccessible ? '✅' : '❌'}</div>
              <div>Generación de voz: {connectionTest.tests?.speechGeneration ? '✅' : '❌'}</div>
              {connectionTest.errors?.voices && (
                <div className="text-red-600">Error de voces: {connectionTest.errors.voices}</div>
              )}
              {connectionTest.errors?.speech && (
                <div className="text-red-600">Error de generación: {connectionTest.errors.speech}</div>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <span className="text-red-800 font-medium">{currentLabels.error}</span>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Test Text Display */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600 mb-1">Texto de prueba:</p>
          <p className="text-sm text-gray-800 italic">"{testText}"</p>
        </div>
      </div>
    </div>
  );
}

export default AudioDiagnostic;
