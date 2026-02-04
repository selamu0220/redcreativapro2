'use client';

import React from 'react';
import { VoiceGuideProvider, useVoiceGuide } from '../components/voice-guide/VoiceGuideProvider';
import { Play, Pause, Square } from 'lucide-react';

function TestVoiceGuideContent() {
  const { playText, isPlaying, pauseAudio, resumeAudio, stopAudio, isPaused } = useVoiceGuide();

  const testTexts = [
    "Hola, bienvenido a Red Creativa Pro. Esta es una prueba de la guía de voz.",
    "El Escritor IA te ayuda a crear contenido de alta calidad usando inteligencia artificial.",
    "Puedes generar artículos, blogs, emails y mucho más con solo unos clics.",
    "La guía de voz está funcionando correctamente con Web Speech API como respaldo."
  ];

  const handlePlayTest = async (text: string) => {
    try {
      await playText(text);
    } catch (error) {
      console.error('Error playing text:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Prueba de Guía de Voz
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Estado del Audio
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPlaying ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isPlaying ? 'Reproduciendo' : 'Detenido'}
            </div>
            {isPaused && (
              <div className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Pausado
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {isPlaying && (
              <button
                onClick={isPaused ? resumeAudio : pauseAudio}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Reanudar' : 'Pausar'}
              </button>
            )}
            
            {isPlaying && (
              <button
                onClick={stopAudio}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                <Square className="w-4 h-4" />
                Detener
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Textos de Prueba
          </h2>
          <div className="space-y-4">
            {testTexts.map((text, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {text}
                </p>
                <button
                  onClick={() => handlePlayTest(text)}
                  disabled={isPlaying}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  Reproducir Texto {index + 1}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
            Instrucciones de Prueba
          </h3>
          <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
            <li>• Haz clic en cualquier botón "Reproducir Texto" para probar la síntesis de voz</li>
            <li>• Si ElevenLabs no está configurado, se usará Web Speech API automáticamente</li>
            <li>• Usa los controles de pausa/reanudar/detener para controlar la reproducción</li>
            <li>• Presiona F1 en cualquier página para abrir la guía de voz global</li>
            <li>• Presiona Ctrl+H para reproducir la introducción de la página actual</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function TestVoiceGuidePage() {
  return (
    <VoiceGuideProvider>
      <TestVoiceGuideContent />
    </VoiceGuideProvider>
  );
}
