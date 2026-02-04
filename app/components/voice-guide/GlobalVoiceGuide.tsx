'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useVoiceGuide } from './VoiceGuideProvider';
import { getPageScript, getQuickTips, getQuickHelp } from '../../config/voice-guide-scripts';
import { Volume2, VolumeX, Play, Pause, HelpCircle, X, Keyboard, Lightbulb, Info } from 'lucide-react';


interface GlobalVoiceGuideProps {
  className?: string;
}

export function GlobalVoiceGuide({ className = '' }: GlobalVoiceGuideProps) {
  const pathname = usePathname();
  const { playText, isPlaying, pauseAudio, resumeAudio, isPaused, stopAudio } = useVoiceGuide();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showQuickTips, setShowQuickTips] = useState(false);

  const currentScript = getPageScript(pathname);
  const quickTips = getQuickTips(pathname);
  const quickHelp = getQuickHelp(pathname);

  // Reproducir introducción de la página
  const playPageIntro = useCallback(async () => {
    await playText(currentScript.intro);
  }, [playText, currentScript.intro]);

  // Reproducir explicación de sección específica
  const playSection = useCallback(async (sectionIndex: number) => {
    if (currentScript.sections[sectionIndex]) {
      setCurrentSection(sectionIndex);
      await playText(currentScript.sections[sectionIndex]);
    }
  }, [playText, currentScript.sections]);

  // Reproducir tutorial completo
  const playFullTutorial = useCallback(async () => {
    let fullText = `${currentScript.intro} `;
    fullText += currentScript.sections.join(' ');
    await playText(fullText);
  }, [playText, currentScript]);

  const playQuickHelp = useCallback(() => {
    if (quickHelp) {
      playText(quickHelp);
    }
  }, [quickHelp, playText]);

  const playRandomTip = useCallback(() => {
    if (quickTips && quickTips.length > 0) {
      const randomTip = quickTips[Math.floor(Math.random() * quickTips.length)];
      playText(randomTip);
    }
  }, [quickTips, playText]);

  // Manejar atajos de teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // F1 - Abrir/cerrar guía de voz
      if (event.key === 'F1') {
        event.preventDefault();
        setIsExpanded(prev => !prev);
      }
      
      // Ctrl + H - Reproducir introducción
      if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        playPageIntro();
      }
      
      // Ctrl + Shift + H - Mostrar atajos de teclado
      if (event.ctrlKey && event.shiftKey && event.key === 'H') {
        event.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
      
      // Escape - Detener audio
      if (event.key === 'Escape' && isPlaying) {
        event.preventDefault();
        stopAudio();
      }
      
      // F2 - Ayuda rápida
      if (event.key === 'F2') {
        event.preventDefault();
        playQuickHelp();
      }
      
      // F3 - Consejo aleatorio
      if (event.key === 'F3') {
        event.preventDefault();
        playRandomTip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playPageIntro, isPlaying, stopAudio, playQuickHelp, playRandomTip]);

  return (
    <>
      {/* Botón flotante principal */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="flex flex-col items-end gap-2">
          {/* Panel expandido */}
          {isExpanded && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-80 mb-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Guía de Voz - {currentScript.title}
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Controles de audio */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={playPageIntro}
                  disabled={isPlaying}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
                >
                  <Play className="w-3 h-3" />
                  Introducción
                </button>
                
                <button
                  onClick={playFullTutorial}
                  disabled={isPlaying}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-sm"
                >
                  <Play className="w-3 h-3" />
                  Tutorial Completo
                </button>
                
                {isPlaying && (
                  <button
                    onClick={isPaused ? resumeAudio : pauseAudio}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
                  >
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    {isPaused ? 'Reanudar' : 'Pausar'}
                  </button>
                )}
                
                {isPlaying && (
                  <button
                    onClick={stopAudio}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                  >
                    <VolumeX className="w-3 h-3" />
                    Detener
                  </button>
                )}
              </div>
              
              {/* Secciones */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Explicaciones por sección:</h4>
                {currentScript.sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => playSection(index)}
                    disabled={isPlaying}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      currentSection === index
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    } disabled:opacity-50`}
                  >
                    {index + 1}. {section.substring(0, 50)}...
                  </button>
                ))}
              </div>
              
              {/* Atajos de teclado */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setShowKeyboardShortcuts(prev => !prev)}
                    className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <Keyboard className="w-3 h-3" />
                    Atajos
                  </button>
                  
                  <button
                    onClick={() => setShowQuickTips(prev => !prev)}
                    className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                  >
                    <Lightbulb className="w-3 h-3" />
                    Consejos
                  </button>
                  
                  <button
                    onClick={playQuickHelp}
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <Info className="w-3 h-3" />
                    Ayuda
                  </button>
                </div>
                
                {showKeyboardShortcuts && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">F1</kbd> - Abrir/cerrar guía</div>
                    <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Ctrl+H</kbd> - Reproducir introducción</div>
                    <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">F2</kbd> - Ayuda rápida</div>
                    <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">F3</kbd> - Consejo aleatorio</div>
                    <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Esc</kbd> - Detener audio</div>
                  </div>
                )}
                
                {showQuickTips && quickTips && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                    <div className="space-y-1">
                      {quickTips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-1">
                          <button
                            onClick={() => playText(tip)}
                            className="p-0.5 rounded bg-yellow-200 hover:bg-yellow-300 transition-colors flex-shrink-0"
                          >
                            <Play className="w-2 h-2" />
                          </button>
                          <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Botón principal */}
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
              isPlaying
                ? 'bg-green-500 hover:bg-green-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white hover:scale-105`}
            title="Guía de Voz (F1)"
          >
            {isPlaying ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <HelpCircle className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default GlobalVoiceGuide;
