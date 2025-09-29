'use client';

import React, { useEffect, useState } from 'react';
import { useVoiceGuide } from '../../../app/components/voice-guide/VoiceGuideProvider';
import { Hotspot as HotspotType } from '../../../app/types/voice-guide';
import Hotspot from './Hotspot';
import { Eye, EyeOff } from 'lucide-react';

interface HotspotsOverlayProps {
  className?: string;
}

export function HotspotsOverlay({ className = '' }: HotspotsOverlayProps) {
  const {
    currentTutorial,
    showHotspots,
    toggleHotspots,
    tutorialProgress
  } = useVoiceGuide();

  const [visibleHotspots, setVisibleHotspots] = useState<HotspotType[]>([]);

  // Filter and sort hotspots
  useEffect(() => {
    if (currentTutorial?.hotspots) {
      const activeHotspots = currentTutorial.hotspots
        .filter(hotspot => hotspot.is_active)
        .sort((a, b) => a.order_index - b.order_index);
      
      setVisibleHotspots(activeHotspots);
    } else {
      setVisibleHotspots([]);
    }
  }, [currentTutorial]);

  // Don't render if no tutorial is loaded
  if (!currentTutorial) {
    return null;
  }

  return (
    <div className={`hotspots-overlay ${className}`}>
      {/* Hotspots Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleHotspots}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg
            transition-all duration-200 hover:scale-105
            ${showHotspots
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-500 text-white hover:bg-gray-600'
            }
          `}
          title={showHotspots ? 'Hide hotspots' : 'Show hotspots'}
        >
          {showHotspots ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span className="text-sm font-medium">Hide Guide</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Show Guide</span>
            </>
          )}
        </button>
      </div>

      {/* Tutorial Info Panel */}
      {showHotspots && (
        <div className="fixed top-4 left-4 z-40 bg-white rounded-lg shadow-xl p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {currentTutorial.title}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {currentTutorial.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>⏱️ {currentTutorial.estimated_duration} min</span>
                <span>📊 {currentTutorial.difficulty_level}</span>
                <span>🎯 {visibleHotspots.length} steps</span>
              </div>
              
              {/* Progress Bar */}
              {tutorialProgress && tutorialProgress.length > 0 && (() => {
                const currentProgress = tutorialProgress.find((p: any) => p.tutorial_id === currentTutorial.id);
                const progressPercentage = currentProgress?.progress_percentage || 0;
                return (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Render Hotspots */}
      {visibleHotspots.map((hotspot: HotspotType) => (
        <Hotspot
          key={hotspot.id}
          id={hotspot.id}
          elementSelector={hotspot.element_selector}
          positionX={hotspot.position_x}
          positionY={hotspot.position_y}
          title={hotspot.title}
          description={hotspot.description}
          orderIndex={hotspot.order_index}
          isActive={hotspot.is_active}
        />
      ))}

      {/* Hotspot Legend */}
      {showHotspots && visibleHotspots.length > 0 && (
        <div className="fixed bottom-4 left-4 z-40 bg-white rounded-lg shadow-xl p-3 max-w-xs">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">
            Guide Steps
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {visibleHotspots.slice(0, 5).map((hotspot: HotspotType) => (
              <div
                key={hotspot.id}
                className="flex items-center gap-2 text-xs text-gray-600"
              >
                <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {hotspot.order_index}
                </div>
                <span className="truncate">{hotspot.title}</span>
              </div>
            ))}
            {visibleHotspots.length > 5 && (
              <div className="text-xs text-gray-500 text-center pt-1">
                +{visibleHotspots.length - 5} more steps
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {showHotspots && (
        <div className="fixed bottom-4 right-4 z-40 bg-gray-900 text-white rounded-lg p-2 text-xs">
          <div className="font-semibold mb-1">Shortcuts</div>
          <div>Space: Play/Pause</div>
          <div>H: Toggle hotspots</div>
          <div>Esc: Stop audio</div>
        </div>
      )}
    </div>
  );
}

export default HotspotsOverlay;