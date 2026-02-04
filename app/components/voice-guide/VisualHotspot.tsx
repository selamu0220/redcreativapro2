'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Eye, Info } from 'lucide-react';
import { useVoiceGuide } from './VoiceGuideProvider';
import { Hotspot } from '@/app/types/voice-guide';

interface VisualHotspotProps {
  hotspot: Hotspot;
  isActive?: boolean;
  showVisualGuide?: boolean;
  onHotspotClick?: (hotspot: Hotspot) => void;
  className?: string;
}

export default function VisualHotspot({ 
  hotspot, 
  isActive = false, 
  showVisualGuide = true,
  onHotspotClick,
  className = ''
}: VisualHotspotProps) {
  const { 
    isPlaying, 
    currentHotspot,
    playHotspotExplanation,
    isGenerating
  } = useVoiceGuide();

  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const hotspotRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isCurrentHotspot = currentHotspot?.id === hotspot.id;
  const isPlayingThis = isCurrentHotspot && isPlaying;
  const isGeneratingThis = isCurrentHotspot && isGenerating;

  // Calculate tooltip position
  useEffect(() => {
    if (showTooltip && hotspotRef.current && tooltipRef.current) {
      const hotspotRect = hotspotRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = hotspotRect.left + hotspotRect.width / 2 - tooltipRect.width / 2;
      let y = hotspotRect.top - tooltipRect.height - 10;

      // Adjust if tooltip goes off screen
      if (x < 10) x = 10;
      if (x + tooltipRect.width > viewportWidth - 10) {
        x = viewportWidth - tooltipRect.width - 10;
      }
      if (y < 10) {
        y = hotspotRect.bottom + 10;
      }

      setTooltipPosition({ x, y });
    }
  }, [showTooltip, isHovered]);

  const handleClick = () => {
    if (onHotspotClick) {
      onHotspotClick(hotspot);
    } else {
      playHotspotExplanation(hotspot.id);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setTimeout(() => setShowTooltip(true), 300);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
  };

  // Don't render if visual guide is disabled
  if (!showVisualGuide) return null;

  return (
    <>
      {/* Visual Hotspot Indicator */}
      <div
        ref={hotspotRef}
        className={`
          absolute z-30 cursor-pointer transition-all duration-300
          ${className}
          ${isActive ? 'scale-110' : 'scale-100'}
        `}
        style={{
          left: `${hotspot.position?.x || 0}%`,
          top: `${hotspot.position?.y || 0}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`Audio explanation for ${hotspot.label}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Pulsing Background */}
        <div className={`
          absolute inset-0 rounded-full transition-all duration-500
          ${isPlayingThis 
            ? 'bg-green-500 animate-pulse scale-150' 
            : isGeneratingThis
            ? 'bg-yellow-500 animate-spin scale-125'
            : isHovered
            ? 'bg-blue-500 scale-125'
            : 'bg-blue-400 scale-100'
          }
          opacity-30
        `} />
        
        {/* Outer Ring */}
        <div className={`
          relative w-8 h-8 rounded-full border-2 transition-all duration-300
          ${isPlayingThis 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : isGeneratingThis
            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
            : isHovered
            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
            : 'border-blue-500 bg-white dark:bg-gray-800'
          }
          shadow-lg hover:shadow-xl
        `}>
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isGeneratingThis ? (
              <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            ) : isPlayingThis ? (
              <Volume2 className="w-4 h-4 text-green-600 animate-pulse" />
            ) : (
              <Play className="w-3 h-3 text-blue-600 ml-0.5" />
            )}
          </div>
        </div>

        {/* Ripple Effect */}
        {(isPlayingThis || isHovered) && (
          <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75" />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y
          }}
        >
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              <span className="font-medium">{hotspot.label}</span>
            </div>
            {hotspot.description && (
              <p className="text-xs opacity-90 leading-relaxed">
                {hotspot.description}
              </p>
            )}
            <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
              <Eye className="w-3 h-3" />
              <span>Click para escuchar explicación</span>
            </div>
            
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
            </div>
          </div>
        </div>
      )}

      {/* Highlight Overlay for Target Element */}
      {isActive && hotspot.targetElement && (
        <div 
          className="absolute pointer-events-none z-20 border-2 border-blue-500 rounded-lg bg-blue-500/10 animate-pulse"
          style={{
            left: `${(hotspot.position?.x || 0) - 2}%`,
            top: `${(hotspot.position?.y || 0) - 2}%`,
            width: '4%',
            height: '4%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
    </>
  );
}
