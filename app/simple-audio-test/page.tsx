'use client';

import { useState } from 'react';

export default function SimpleAudioTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('Listo para probar');

  const testDirectAudio = async () => {
    alert('🔊 Iniciando prueba de audio...');
    setStatus('Generando audio...');
    setIsPlaying(true);

    try {
      // Test direct API call
      const response = await fetch('/api/voice-guide/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hola, esta es una prueba directa del sistema de audio.',
          voice_id: 'pNInz6obpgDQGcFmaJgB' // Default voice ID
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate speech');
      }

      setStatus('Reproduciendo audio...');
      alert('🎵 Audio generado, iniciando reproducción...');
      
      // Create and play audio
      const audio = new Audio(data.audio_url);
      
      audio.onended = () => {
        setIsPlaying(false);
        setStatus('Audio completado');
        alert('🎧 Audio terminado');
      };
      
      audio.onerror = (error: any) => {
        setIsPlaying(false);
        setStatus('Error reproduciendo audio');
        alert('❌ Error reproduciendo audio');
      };

      await audio.play();
      
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setIsPlaying(false);
      alert(`❌ Error: ${error.message}`);
    }
  };

  const testAlert = () => {
    alert('🎯 ¡Perfecto! Los botones funcionan correctamente. Ahora puedes probar el audio.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Prueba Directa de Audio
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Esta prueba llama directamente a la API sin usar el contexto:
            </p>
            
            <button
              onClick={testAlert}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 mr-4 mb-4"
            >
              Probar Alert
            </button>
            
            <button
              onClick={testDirectAudio}
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
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Estado:</h3>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Reproduciendo:</strong> {isPlaying ? 'Sí' : 'No'}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Instrucciones:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Primero haz clic en "Probar Alert" para verificar que los eventos funcionan</li>
              <li>Luego haz clic en "Probar Audio Directo" para probar el audio</li>
              <li>Abre la consola del navegador (F12) para ver los logs detallados</li>
              <li>Verifica que tu navegador tenga el volumen activado</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}