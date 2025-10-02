'use client';

import React, { useState, useEffect } from 'react';
import { useVoiceGuide } from './VoiceGuideProvider';
import { Volume2, VolumeX, Play, Pause, HelpCircle, Minimize2, Maximize2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getPageScript } from '../../config/voice-guide-scripts';

interface FloatingVoiceButtonProps {
  className?: string;
}

const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({ className = '' }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const { isPlaying, playText, stopAudio, pauseAudio, resumeAudio } = useVoiceGuide();
  const pathname = usePathname();
  
  const currentPageScript = getPageScript(pathname);

  // Auto-hide after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setIsVisible(true);
      timeout = setTimeout(() => {
        if (isMinimized && !isPlaying) {
          setIsVisible(false);
        }
      }, 10000); // Hide after 10 seconds of inactivity
    };

    const handleActivity = () => {
      resetTimeout();
    };

    // Listen for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    resetTimeout();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isMinimized, isPlaying]);

  const handleQuickHelp = () => {
    if (currentPageScript) {
      playText(currentPageScript.intro);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  if (!isVisible) {
    return (
      <div 
        className="fixed bottom-4 right-4 z-50 opacity-30 hover:opacity-100 transition-opacity duration-300"
        onMouseEnter={() => setIsVisible(true)}
      >
        <button
          className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
          title="Mostrar guía de voz"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${className}`}>
      {isMinimized ? (
        // Botón minimizado
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setIsMinimized(false)}
            className="w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
            title="Abrir guía de voz (F1)"
          >
            {isPlaying ? (
              <VolumeX className="w-6 h-6 animate-pulse" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>
          
          {isPlaying && (
            <button
              onClick={toggleAudio}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-800 text-white rounded-full shadow-md flex items-center justify-center transition-all duration-300"
              title={isPlaying ? "Pausar" : "Reanudar"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      ) : (
        // Panel expandido
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-80 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-orange-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Guía de Voz</h3>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Minimizar"
            >
              <Minimize2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {currentPageScript?.title || 'Página Actual'}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleQuickHelp}
                className="flex items-center gap-1 px-3 py-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-lg text-sm transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Ayuda Rápida
              </button>
              
              {isPlaying ? (
                <button
                  onClick={stopAudio}
                  className="flex items-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm transition-colors"
                >
                  <VolumeX className="w-4 h-4" />
                  Detener
                </button>
              ) : (
                <button
                  onClick={toggleAudio}
                  className="flex items-center gap-1 px-3 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg text-sm transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Reproducir
                </button>
              )}
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
              Presiona <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">F1</kbd> para abrir/cerrar
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingVoiceButton;