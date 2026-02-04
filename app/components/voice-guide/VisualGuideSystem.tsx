'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useVoiceGuide } from './VoiceGuideProvider';
import { Hotspot } from '@/app/types/voice-guide';
import VisualGuideIndicator from './VisualGuideIndicator';
import VisualHotspot from './VisualHotspot';

interface VisualGuideSystemProps {
  tutorialId?: string;
  className?: string;
  autoShow?: boolean;
  hotspots?: Hotspot[];
}

export default function VisualGuideSystem({ 
  tutorialId,
  className = '',
  autoShow = true,
  hotspots: propHotspots
}: VisualGuideSystemProps) {
  const { 
    currentTutorial,
    hotspots: contextHotspots,
    currentHotspot,
    isPlaying,
    loadTutorial,
    playHotspotExplanation
  } = useVoiceGuide();

  const [isVisible, setIsVisible] = useState(autoShow);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [showAllHotspots, setShowAllHotspots] = useState(true);

  // Use provided hotspots or context hotspots
  const displayHotspots = propHotspots || contextHotspots;

  // Load tutorial if specified
  useEffect(() => {
    if (tutorialId && tutorialId !== currentTutorial?.id) {
      loadTutorial(tutorialId);
    }
  }, [tutorialId, currentTutorial?.id, loadTutorial]);

  // Update active hotspot when current hotspot changes
  useEffect(() => {
    if (currentHotspot) {
      setActiveHotspotId(currentHotspot.id);
    } else {
      setActiveHotspotId(null);
    }
  }, [currentHotspot]);

  // Auto-show when audio starts playing
  useEffect(() => {
    if (isPlaying && !isVisible) {
      setIsVisible(true);
    }
  }, [isPlaying, isVisible]);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    setActiveHotspotId(hotspot.id);
    playHotspotExplanation(hotspot.id);
  }, [playHotspotExplanation]);

  const handleToggleVisibility = useCallback((visible: boolean) => {
    setIsVisible(visible);
  }, []);

  const handleToggleHotspots = useCallback(() => {
    setShowAllHotspots(!showAllHotspots);
  }, [showAllHotspots]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when visual guide is visible
      if (!isVisible) return;

      // Prevent shortcuts when user is typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.key) {
        case 'v':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setIsVisible(!isVisible);
          }
          break;
        case 'h':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleToggleHotspots();
          }
          break;
        case 'Escape':
          setIsVisible(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleToggleHotspots]);

  // Don't render anything if not visible
  if (!isVisible) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
          title="Mostrar guía visual (Ctrl+V)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`visual-guide-system ${className}`}>
      {/* Visual Guide Indicator */}
      <VisualGuideIndicator 
        isVisible={isVisible}
        onToggleVisibility={handleToggleVisibility}
      />

      {/* Hotspots Overlay */}
      {showAllHotspots && displayHotspots && displayHotspots.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {displayHotspots.map((hotspot) => (
            <div key={hotspot.id} className="pointer-events-auto">
              <VisualHotspot
                hotspot={hotspot}
                isActive={activeHotspotId === hotspot.id}
                showVisualGuide={isVisible}
                onHotspotClick={handleHotspotClick}
              />
            </div>
          ))}
        </div>
      )}

      {/* Tutorial Info Panel */}
      {currentTutorial && isVisible && (
        <div className="fixed top-6 left-6 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">{currentTutorial.title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleHotspots}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  showAllHotspots 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
                title="Mostrar/ocultar hotspots"
              >
                Hotspots
              </button>
            </div>
          </div>
          
          {currentTutorial.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {currentTutorial.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{displayHotspots?.length || 0} puntos de explicación</span>
            <span className="text-blue-500">Ctrl+V para ocultar</span>
          </div>
        </div>
      )}

      {/* Accessibility Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isPlaying && currentHotspot && (
          <span>Reproduciendo explicación para {currentHotspot.label}</span>
        )}
      </div>

      {/* Help Overlay */}
      {isVisible && !currentTutorial && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-6 max-w-md text-center">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="font-semibold text-lg mb-2">Guía Visual de Audio</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Explora la interfaz con explicaciones de audio interactivas.
            </p>
          </div>
          
          <div className="text-left space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0" />
              <span>Puntos azules: Explicaciones disponibles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 animate-pulse" />
              <span>Verde pulsante: Audio reproduciéndose</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+V</kbd>
              <span>Mostrar/ocultar guía</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+H</kbd>
              <span>Mostrar/ocultar hotspots</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
