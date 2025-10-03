'use client';

import React, { useState, useEffect } from 'react';
import { useVoiceGuide } from '../../../app/components/voice-guide/VoiceGuideProvider';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Settings
} from 'lucide-react';
import { Button } from '../ui/button';

interface AudioPlayerProps {
  className?: string;
  position?: 'bottom-left' | 'bottom-right' | 'bottom-center';
}

export function AudioPlayer({ 
  className = '', 
  position = 'bottom-center' 
}: AudioPlayerProps) {
  const {
    currentHotspot,
    currentTutorial,
    isPlaying,
    isLoading,
    currentAudio,
    playbackSpeed,
    volume,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setPlaybackSpeed,
    setVolume,
    availableVoices,
    userPreferences,
    updateUserPreferences
  } = useVoiceGuide();

  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  // Update audio time
  useEffect(() => {
    if (currentAudio) {
      const updateTime = () => {
        setCurrentTime(currentAudio.currentTime);
        setDuration(currentAudio.duration || 0);
      };

      currentAudio.addEventListener('timeupdate', updateTime);
      currentAudio.addEventListener('loadedmetadata', updateTime);

      return () => {
        currentAudio.removeEventListener('timeupdate', updateTime);
        currentAudio.removeEventListener('loadedmetadata', updateTime);
      };
    }
  }, [currentAudio]);

  // Show controls when audio is active
  useEffect(() => {
    setShowControls(!!currentAudio || isPlaying);
  }, [currentAudio, isPlaying]);

  // Handle play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  // Handle stop
  const handleStop = () => {
    stopAudio();
    setShowControls(false);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  // Handle speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    updateUserPreferences({ voice_speed: speed });
  };

  // Handle voice change
  const handleVoiceChange = (voiceId: string) => {
    updateUserPreferences({ voice_id: voiceId });
  };

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Position classes
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (!showControls) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      {/* Main Player */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-80">
        {/* Current Track Info */}
        {currentHotspot && (
          <div className="mb-3">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {currentHotspot.title}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {currentTutorial?.title}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {duration > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <Button
            onClick={handleStop}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </Button>

          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            variant="default"
            size="icon"
            className="rounded-full p-3 h-12 w-12"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleMuteToggle}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          
          <span className="text-xs text-gray-500 w-8 text-right">
            {Math.round(volume * 100)}
          </span>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Playback Speed */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Playback Speed
              </label>
              <div className="flex gap-1">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`
                      px-2 py-1 text-xs rounded transition-colors
                      ${
                        playbackSpeed === speed
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }
                    `}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            {availableVoices.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice
                </label>
                <select
                  value={userPreferences?.voice_id || ''}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name} ({voice.category})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-2 text-center">
        <div className="inline-block bg-gray-900 text-white text-xs px-2 py-1 rounded">
          Space: Play/Pause • Esc: Stop
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;