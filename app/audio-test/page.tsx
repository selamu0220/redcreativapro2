'use client';

import React from 'react';
import AudioDiagnostic from '../components/voice-guide/AudioDiagnostic';
import { ProtectedRoute } from '../components/ProtectedRoute';

export default function AudioTestPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Diagnóstico del Sistema de Audio
            </h1>
            <p className="text-gray-600">
              Herramienta para diagnosticar problemas con el sistema de voz ElevenLabs
            </p>
          </div>
          
          <AudioDiagnostic language="es" />
          
          <div className="mt-8 max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información de Diagnóstico
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">API Key:</span>
                  <span className="text-gray-900 font-mono">
                    {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? 
                      `${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY.substring(0, 8)}...` : 
                      'No configurada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Navegador:</span>
                  <span className="text-gray-900">
                    {typeof window !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Audio Support:</span>
                  <span className="text-gray-900">
                    {typeof window !== 'undefined' && 'Audio' in window ? '✅ Soportado' : '❌ No soportado'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}