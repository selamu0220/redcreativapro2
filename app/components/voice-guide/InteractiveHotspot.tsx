'use client';

import React, { useState, useEffect } from 'react';
import { Hotspot, SupportedLanguage } from '../../types/voice-guide';
import { Volume2, VolumeX, Play, Pause, Loader2, Info } from 'lucide-react';
import { useVoiceGuide } from './VoiceGuideProvider';

interface InteractiveHotspotProps {
  hotspot: Hotspot;
  language: SupportedLanguage;
  isVisible: boolean;
  onExplain: (hotspot: Hotspot) => void;
}

export function InteractiveHotspot({
  hotspot,
  language,
  isVisible,
  onExplain
}: InteractiveHotspotProps) {
  const { isPlaying, currentAudio, generateSpeech, isGenerating } = useVoiceGuide();
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const getLabels = () => {
    switch (language) {
      case 'es':
        return {
          clickToExplain: 'Haz clic para explicar',
          explaining: 'Explicando...',
          playExplanation: 'Reproducir explicación',
          stopExplanation: 'Detener explicación'
        };
      case 'fr':
        return {
          clickToExplain: 'Cliquez pour expliquer',
          explaining: 'Explication...',
          playExplanation: 'Lire l\'explication',
          stopExplanation: 'Arrêter l\'explication'
        };
      case 'de':
        return {
          clickToExplain: 'Klicken für Erklärung',
          explaining: 'Erkläre...',
          playExplanation: 'Erklärung abspielen',
          stopExplanation: 'Erklärung stoppen'
        };
      default:
        return {
          clickToExplain: 'Click to explain',
          explaining: 'Explaining...',
          playExplanation: 'Play explanation',
          stopExplanation: 'Stop explanation'
        };
    }
  };

  const labels = getLabels();

  const handleClick = async () => {
    if (isGenerating) return;
    
    try {
      await onExplain(hotspot);
    } catch (error: any) {
      console.error('Error explaining hotspot:', error);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    setIsHovered(true);
    setShowTooltip(true);
    
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
  };

  if (!isVisible) {
    return null;
  }

  const isCurrentlyPlaying = isPlaying && currentAudio !== null;

  return (
    <>
      <div
        className={`absolute z-50 cursor-pointer transition-all duration-300 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
        style={{
          left: `${hotspot.position_x}%`,
          top: `${hotspot.position_y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={hotspot.title}
      >
        {/* Pulsing ring animation */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full animate-ping ${
            isCurrentlyPlaying ? 'bg-green-400' : 'bg-purple-400'
          } opacity-75`} />
          
          <div className={`absolute inset-0 rounded-full animate-pulse ${
            isCurrentlyPlaying ? 'bg-green-300' : 'bg-purple-300'
          } opacity-50`} />
          
          {/* Main hotspot button */}
          <div className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            isCurrentlyPlaying
              ? 'bg-green-500 hover:bg-green-600'
              : isHovered
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-purple-500 hover:bg-purple-600'
          } text-white`}>
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCurrentlyPlaying ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed z-[60] px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none transition-opacity duration-200"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="text-center">
            <div className="font-medium">{hotspot.title}</div>
            <div className="text-xs text-gray-300 mt-1">
              {isGenerating
                ? labels.explaining
                : isCurrentlyPlaying
                ? labels.stopExplanation
                : labels.clickToExplain
              }
            </div>
          </div>
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </>
  );
}

// Hotspot container component for managing multiple hotspots
interface HotspotsContainerProps {
  hotspots: Hotspot[];
  language: SupportedLanguage;
  isVisible: boolean;
  onExplainHotspot: (hotspot: Hotspot) => void;
}

export function HotspotsContainer({
  hotspots,
  language,
  isVisible,
  onExplainHotspot
}: HotspotsContainerProps) {
  if (!isVisible || hotspots.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {hotspots.map((hotspot) => (
        <div key={hotspot.id} className="pointer-events-auto">
          <InteractiveHotspot
            hotspot={hotspot}
            language={language}
            isVisible={isVisible}
            onExplain={onExplainHotspot}
          />
        </div>
      ))}
    </div>
  );
}