'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Settings, X } from 'lucide-react';
import { useVoiceGuide } from './VoiceGuideProvider';

interface VisualGuideIndicatorProps {
  isVisible?: boolean;
  onToggleVisibility?: (visible: boolean) => void;
}

export default function VisualGuideIndicator({ 
  isVisible = true, 
  onToggleVisibility 
}: VisualGuideIndicatorProps) {
  const { 
    isPlaying, 
    currentAudio, 
    currentText,
    volume,
    playbackSpeed,
    setVolume,
    setPlaybackSpeed,
    pauseAudio,
    resumeAudio,
    stopAudio
  } = useVoiceGuide();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  // Auto-collapse when audio stops
  useEffect(() => {
    if (!isPlaying && !currentAudio) {
      setIsExpanded(false);
      setShowTranscript(false);
    }
  }, [isPlaying, currentAudio]);

  // Don't render if not visible
  if (!isVisible) return null;

  const handleToggleAudio = () => {
    if (audioEnabled) {
      if (isPlaying) {
        pauseAudio();
      } else if (currentAudio) {
        resumeAudio();
      }
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleClose = () => {
    stopAudio();
    setIsExpanded(false);
    setShowSettings(false);
    setShowTranscript(false);
    onToggleVisibility?.(false);
  };

  return (
    <>
      {/* Floating Indicator */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 w-64 mb-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Configuración de Audio</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Volume Control */}
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Volumen</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="text-xs text-gray-500 mt-1">{Math.round(volume * 100)}%</div>
            </div>

            {/* Playback Speed */}
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Velocidad</label>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="w-full text-xs border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x (Normal)</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            {/* Transcript Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Mostrar transcripción</span>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`w-8 h-4 rounded-full transition-colors ${
                  showTranscript ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                } relative`}
              >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                  showTranscript ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        )}

        {/* Transcript Panel */}
        {showTranscript && currentText && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 w-80 mb-2 max-h-32 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Transcripción</h3>
              <button
                onClick={() => setShowTranscript(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {currentText}
            </p>
          </div>
        )}

        {/* Main Indicator */}
        <div className={`bg-white dark:bg-gray-800 rounded-full shadow-lg border transition-all duration-300 ${
          isExpanded ? 'rounded-lg px-4 py-3' : 'p-3'
        }`}>
          {isExpanded ? (
            /* Expanded View */
            <div className="flex items-center gap-3 min-w-0">
              {/* Audio Status */}
              <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                isPlaying ? 'bg-green-500 animate-pulse' : 
                currentAudio ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
              
              {/* Current Text Preview */}
              {currentText && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-32">
                    {currentText.substring(0, 50)}...
                  </p>
                </div>
              )}
              
              {/* Controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Play/Pause Button */}
                <button
                  onClick={handleToggleAudio}
                  className={`p-1.5 rounded-full transition-colors ${
                    audioEnabled 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
                  }`}
                  title={audioEnabled ? (isPlaying ? 'Pausar' : 'Reproducir') : 'Audio desactivado'}
                >
                  {audioEnabled ? (
                    isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />
                  ) : (
                    <VolumeX className="w-3 h-3" />
                  )}
                </button>
                
                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
                  title="Configuración"
                >
                  <Settings className="w-3 h-3" />
                </button>
                
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
                  title="Cerrar guía visual"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed View */
            <button
              onClick={() => setIsExpanded(true)}
              className={`flex items-center justify-center transition-colors ${
                isPlaying ? 'text-green-500' : 
                currentAudio ? 'text-yellow-500' : 'text-gray-500'
              } hover:text-blue-500`}
              title="Abrir guía visual de audio"
            >
              {audioEnabled ? (
                <Volume2 className={`w-5 h-5 ${
                  isPlaying ? 'animate-pulse' : ''
                }`} />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Pulsing Animation Overlay for Active Audio */}
      {isPlaying && audioEnabled && (
        <div className="fixed bottom-6 right-6 z-40 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-blue-500 opacity-20 animate-ping" />
        </div>
      )}
    </>
  );
}
