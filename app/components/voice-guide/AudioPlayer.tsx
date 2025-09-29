'use client';

import React, { useState, useEffect } from 'react';
import { useVoiceGuide } from './VoiceGuideProvider';
import { UserPreferences, SupportedLanguage } from '../../types/voice-guide';
import { Play, Pause, Square, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';

interface AudioPlayerProps {
  userPreferences: UserPreferences | null;
  language: SupportedLanguage;
}

export function AudioPlayer({ userPreferences, language }: AudioPlayerProps) {
  const {
    isPlaying,
    currentText,
    pauseAudio,
    stopAudio,
    setVolume,
    setPlaybackSpeed,
    playText
  } = useVoiceGuide();

  const [volume, setVolumeState] = useState(userPreferences?.voice_volume || 0.8);
  const [speed, setSpeedState] = useState(userPreferences?.voice_speed || 1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  useEffect(() => {
    if (userPreferences) {
      setVolumeState(userPreferences.voice_volume);
      setSpeedState(userPreferences.voice_speed);
    }
  }, [userPreferences]);

  const handleVolumeChange = (newVolume: number) => {
    setVolumeState(newVolume);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeedState(newSpeed);
    setPlaybackSpeed(newSpeed);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolumeState(previousVolume);
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolumeState(0);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else if (currentText) {
      // Resume or replay current text
      playText(currentText);
    }
  };

  const getLabels = () => {
    switch (language) {
      case 'es':
        return {
          title: 'Reproductor de Audio',
          noAudio: 'No hay audio reproduciéndose',
          volume: 'Volumen',
          speed: 'Velocidad',
          play: 'Reproducir',
          pause: 'Pausar',
          stop: 'Detener',
          mute: 'Silenciar',
          unmute: 'Activar sonido'
        };
      case 'fr':
        return {
          title: 'Lecteur Audio',
          noAudio: 'Aucun audio en cours',
          volume: 'Volume',
          speed: 'Vitesse',
          play: 'Jouer',
          pause: 'Pause',
          stop: 'Arrêter',
          mute: 'Muet',
          unmute: 'Son activé'
        };
      case 'de':
        return {
          title: 'Audio-Player',
          noAudio: 'Kein Audio wird abgespielt',
          volume: 'Lautstärke',
          speed: 'Geschwindigkeit',
          play: 'Abspielen',
          pause: 'Pause',
          stop: 'Stoppen',
          mute: 'Stumm',
          unmute: 'Ton an'
        };
      default:
        return {
          title: 'Audio Player',
          noAudio: 'No audio playing',
          volume: 'Volume',
          speed: 'Speed',
          play: 'Play',
          pause: 'Pause',
          stop: 'Stop',
          mute: 'Mute',
          unmute: 'Unmute'
        };
    }
  };

  const labels = getLabels();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <Volume2 className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">{labels.title}</h3>
      </div>

      {/* Current Text Display */}
      <div className="bg-gray-50 rounded-lg p-3 min-h-[60px] flex items-center">
        {currentText ? (
          <p className="text-sm text-gray-700 line-clamp-3">{currentText}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">{labels.noAudio}</p>
        )}
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={handlePlayPause}
          disabled={!currentText}
          className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title={isPlaying ? labels.pause : labels.play}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <button
          onClick={stopAudio}
          disabled={!currentText}
          className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          title={labels.stop}
        >
          <Square className="w-4 h-4" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{labels.volume}</label>
          <button
            onClick={toggleMute}
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
            title={isMuted ? labels.unmute : labels.mute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-xs text-gray-600 w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{labels.speed}</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-xs text-gray-600 w-8 text-right">
            {speed.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Speed Presets */}
      <div className="flex space-x-2">
        {[0.75, 1.0, 1.25, 1.5].map((presetSpeed) => (
          <button
            key={presetSpeed}
            onClick={() => handleSpeedChange(presetSpeed)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              Math.abs(speed - presetSpeed) < 0.05
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {presetSpeed}x
          </button>
        ))}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}