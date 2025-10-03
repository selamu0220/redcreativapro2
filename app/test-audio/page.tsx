'use client';

import { VoiceGuideProvider, useVoiceGuide } from '../components/voice-guide/VoiceGuideProvider';
import { Button } from '../components/ui/button';

function AudioTestContent() {
  const { playText, pauseAudio, stopAudio, isPlaying, currentText } = useVoiceGuide();

  const testAudio = () => {
    console.log('🔊 Button clicked - Testing audio...');
    console.log('🎵 Current state:', { isPlaying, currentText });
    
    playText('Hola, esta es una prueba del sistema de audio. Si puedes escuchar esto, el sistema funciona correctamente.')
      .then(() => {
        console.log('✅ Audio test completed successfully');
      })
      .catch((error) => {
        console.error('❌ Audio test failed:', error);
      });
  };

  const handleSimpleTest = () => {
    console.log('🎯 Simple test button clicked!');
    alert('Button works! Now testing audio...');
    testAudio();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Prueba de Sistema de Audio
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Haz clic en el botón para probar el sistema de audio:
            </p>
            
            <Button
              onClick={handleSimpleTest}
              className="mr-4"
            >
              Probar Audio (Con Alert)
            </Button>
            
            <button
              onClick={testAudio}
              disabled={isPlaying}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                isPlaying 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPlaying ? 'Reproduciendo...' : 'Probar Audio Directo'}
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={pauseAudio}
              disabled={!isPlaying}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300"
            >
              Pausar
            </button>
            
            <button
              onClick={stopAudio}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Detener
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Estado del Sistema:</h3>
            <p><strong>Reproduciendo:</strong> {isPlaying ? 'Sí' : 'No'}</p>
            <p><strong>Texto actual:</strong> {currentText || 'Ninguno'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AudioTestPage() {
  return (
    <VoiceGuideProvider>
      <AudioTestContent />
    </VoiceGuideProvider>
  );
}