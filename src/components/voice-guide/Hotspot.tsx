'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useVoiceGuide } from '../../../app/components/voice-guide/VoiceGuideProvider';
import { Play, Pause, Volume2 } from 'lucide-react';

interface HotspotProps {
  id: string;
  elementSelector: string;
  positionX: number;
  positionY: number;
  title: string;
  description: string;
  orderIndex: number;
  isActive?: boolean;
  className?: string;
}

export function Hotspot({
  id,
  elementSelector,
  positionX,
  positionY,
  title,
  description,
  orderIndex,
  isActive = true,
  className = ''
}: HotspotProps) {
  const {
    currentHotspot,
    setCurrentHotspot,
    playHotspotAudio,
    isPlaying,
    isLoading,
    showHotspots
  } = useVoiceGuide();

  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [actualPosition, setActualPosition] = useState({ x: positionX, y: positionY });
  const hotspotRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate position based on target element
  useEffect(() => {
    const updatePosition = () => {
      if (elementSelector) {
        const targetElement = document.querySelector(elementSelector);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          setActualPosition({
            x: rect.left + scrollLeft + (rect.width * positionX / 100),
            y: rect.top + scrollTop + (rect.height * positionY / 100)
          });
        }
      } else {
        // Use absolute positioning if no selector
        setActualPosition({ x: positionX, y: positionY });
      }
    };

    updatePosition();
    
    // Update position on resize and scroll
    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [elementSelector, positionX, positionY]);

  // Handle hotspot click
  const handleClick = async () => {
    setCurrentHotspot({
      id,
      tutorial_id: '', // Will be set by context
      element_selector: elementSelector,
      position_x: positionX,
      position_y: positionY,
      title,
      description,
      order_index: orderIndex,
      is_active: isActive
    });

    try {
      await playHotspotAudio(id);
    } catch (error: any) {
      console.error('Error playing hotspot audio:', error);
    }
  };

  // Handle mouse events for tooltip
  const handleMouseEnter = () => {
    setIsHovered(true);
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500); // Show tooltip after 500ms
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  // Don't render if hotspots are hidden or inactive
  if (!showHotspots || !isActive) {
    return null;
  }

  const isCurrentHotspot = currentHotspot?.id === id;
  const isCurrentlyPlaying = isCurrentHotspot && isPlaying;

  return (
    <>
      {/* Hotspot Indicator */}
      <div
        ref={hotspotRef}
        className={`
          fixed z-50 cursor-pointer transform -translate-x-1/2 -translate-y-1/2
          transition-all duration-300 ease-in-out
          ${isHovered || isCurrentHotspot ? 'scale-110' : 'scale-100'}
          ${className}
        `}
        style={{
          left: `${actualPosition.x}px`,
          top: `${actualPosition.y}px`
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`Voice guide hotspot: ${title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Pulsing Ring Animation */}
        <div className="relative">
          {/* Outer pulsing ring */}
          <div
            className={`
              absolute inset-0 rounded-full border-2 border-blue-400
              animate-ping opacity-75
              ${isCurrentHotspot ? 'border-green-400' : 'border-blue-400'}
            `}
            style={{
              width: '32px',
              height: '32px',
              left: '-4px',
              top: '-4px'
            }}
          />
          
          {/* Main hotspot circle */}
          <div
            className={`
              relative w-6 h-6 rounded-full flex items-center justify-center
              transition-all duration-200 shadow-lg
              ${isCurrentHotspot
                ? 'bg-green-500 border-2 border-green-300'
                : 'bg-blue-500 border-2 border-blue-300'
              }
              ${isHovered ? 'shadow-xl' : 'shadow-lg'}
            `}
          >
            {/* Order number or play icon */}
            {isLoading && isCurrentHotspot ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : isCurrentlyPlaying ? (
              <Volume2 className="w-3 h-3 text-white" />
            ) : (
              <span className="text-xs font-bold text-white">
                {orderIndex}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed z-60 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl max-w-xs"
          style={{
            left: `${actualPosition.x + 20}px`,
            top: `${actualPosition.y - 10}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="font-semibold text-sm">{title}</div>
          {description && (
            <div className="text-xs text-gray-300 mt-1">{description}</div>
          )}
          <div className="text-xs text-blue-300 mt-1">
            Click to play audio guide
          </div>
          
          {/* Tooltip arrow */}
          <div
            className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
            style={{
              left: '12px',
              bottom: '-4px'
            }}
          />
        </div>
      )}
    </>
  );
}

export default Hotspot;