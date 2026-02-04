'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { VoiceModel, UserPreferences, Tutorial, Hotspot } from '../../types/voice-guide';

interface VoiceGuideContextType {
  // Audio State
  currentAudio: HTMLAudioElement | null;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  currentText: string;
  audioQueue: string[];
  volume: number;
  playbackSpeed: number;
  
  // Voice Settings
  availableVoices: VoiceModel[];
  selectedVoice: VoiceModel | null;
  
  // Tutorial State
  currentTutorial: Tutorial | null;
  currentHotspot: Hotspot | null;
  hotspots: Hotspot[];
  tutorials: Tutorial[];
  tutorialProgress: any[];
  userPreferences: UserPreferences | null;
  showHotspots: boolean;
  
  // Actions
  playText: (text: string) => Promise<void>;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  loadVoices: () => Promise<void>;
  selectVoice: (voice: VoiceModel) => void;
  loadTutorial: (tutorialId: string) => Promise<void>;
  playHotspotExplanation: (hotspotId: string) => Promise<void>;
  playHotspotAudio: (hotspotId: string) => Promise<void>;
  generateSpeech: (text: string) => Promise<string>;
  resetTutorialProgress: (tutorialId?: string) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  toggleHotspots: () => void;
  setCurrentHotspot: (hotspot: Hotspot | null) => void;
}

const VoiceGuideContext = createContext<VoiceGuideContextType | undefined>(undefined);

export function useVoiceGuide() {
  const context = useContext(VoiceGuideContext);
  if (context === undefined) {
    throw new Error('useVoiceGuide must be used within a VoiceGuideProvider');
  }
  return context;
}

interface VoiceGuideProviderProps {
  children: ReactNode;
}

export function VoiceGuideProvider({ children }: VoiceGuideProviderProps) {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [volume, setVolumeState] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState<VoiceModel[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceModel | null>(null);
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentHotspot, setCurrentHotspot] = useState<Hotspot | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [tutorialProgress, setTutorialProgress] = useState<any[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);

  const generateSpeech = useCallback(async (
    text: string, 
    options?: { voiceId?: string; cacheKey?: string }
  ): Promise<string> => {
    try {
      console.log('🎵 Generating speech with ElevenLabs...', { text: text.substring(0, 50) + '...', voiceId: options?.voiceId || selectedVoice?.voice_id });
      
      // Try ElevenLabs API first
      const response = await fetch('/api/voice-guide/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice_id: options?.voiceId || selectedVoice?.voice_id || 'EXAVITQu4vr4xnSDxMaL',
          cache_key: options?.cacheKey
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('❌ ElevenLabs API error:', data.error);
        throw new Error(data.error || 'Failed to generate speech');
      }

      console.log('✅ ElevenLabs speech generated successfully');
      return data.audio_url;
    } catch (error) {
      console.error('❌ ElevenLabs API completely failed:', error);
      // Only fallback to Web Speech API as last resort
      console.warn('⚠️ Falling back to Web Speech API (this will sound robotic)');
      return 'web-speech-api';
    }
  }, [selectedVoice]);

  const playText = useCallback(async (text: string, voiceId?: string) => {
    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      setCurrentText(text);
      setIsPlaying(true);

      // Generate cache key based on text and voice
      const cacheKey = `${voiceId || selectedVoice?.voice_id || 'default'}_${btoa(text).slice(0, 20)}`;
      
      const audioUrl = await generateSpeech(text, { voiceId, cacheKey });
      
      // Check if we should use Web Speech API fallback
      if (audioUrl === 'web-speech-api') {
        // Use Web Speech API
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'es-ES';
          utterance.rate = playbackSpeed;
          utterance.volume = volume;
          
          utterance.onend = () => {
            setIsPlaying(false);
            setCurrentText('');
            
            // Play next in queue if available
            if (audioQueue.length > 0) {
              const nextText = audioQueue[0];
              setAudioQueue(prev => prev.slice(1));
              playText(nextText, voiceId);
            }
          };
          
          utterance.onerror = () => {
            setIsPlaying(false);
            setCurrentText('');
            console.error('Error with Web Speech API');
          };
          
          speechSynthesis.speak(utterance);
          setCurrentAudio(null); // No audio element for Web Speech API
        } else {
          throw new Error('Web Speech API not supported');
        }
      } else {
        // Use ElevenLabs audio
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentText('');
          
          // Play next in queue if available
          if (audioQueue.length > 0) {
            const nextText = audioQueue[0];
            setAudioQueue(prev => prev.slice(1));
            playText(nextText, voiceId);
          }
        };

        audio.onerror = () => {
          setIsPlaying(false);
          setCurrentText('');
          console.error('Error playing audio');
        };

        await audio.play();
      }
    } catch (error) {
      console.error('Error playing text:', error);
      setIsPlaying(false);
      setCurrentText('');
    }
  }, [currentAudio, selectedVoice, audioQueue, generateSpeech, playbackSpeed, volume]);

  const pauseAudio = useCallback(() => {
    if (currentAudio && isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else if (isPlaying && 'speechSynthesis' in window) {
      // Pause Web Speech API
      speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, [currentAudio, isPlaying]);

  const resumeAudio = useCallback(() => {
    if (currentAudio && isPaused) {
      currentAudio.play();
      setIsPlaying(true);
      setIsPaused(false);
    } else if (isPaused && 'speechSynthesis' in window) {
      // Resume Web Speech API
      speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, [currentAudio, isPaused]);

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } else if ('speechSynthesis' in window) {
      // Stop Web Speech API
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentText('');
    setAudioQueue([]);
  }, [currentAudio]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (currentAudio) {
      currentAudio.volume = clampedVolume;
    }
  }, [currentAudio]);

  const setPlaybackSpeed = useCallback((speed: number) => {
    const clampedSpeed = Math.max(0.5, Math.min(2, speed));
    setPlaybackSpeedState(clampedSpeed);
    if (currentAudio) {
      currentAudio.playbackRate = clampedSpeed;
    }
  }, [currentAudio]);

  const loadVoices = useCallback(async () => {
    try {
      const response = await fetch('/api/voice-guide/voices');
      const data = await response.json();
      
      if (response.ok && data.voices) {
        setAvailableVoices(data.voices);
        
        // Set default voice if none selected
        if (!selectedVoice && data.voices.length > 0) {
          setSelectedVoice(data.voices[0]);
        }
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  }, [selectedVoice]);

  const selectVoice = useCallback((voice: VoiceModel) => {
    setSelectedVoice(voice);
  }, []);

  const loadTutorial = useCallback(async (tutorialId: string) => {
    try {
      setIsGenerating(true);
      const response = await fetch(`/api/voice-guide/tutorials/${tutorialId}`);
      const data = await response.json();
      
      if (response.ok && data.tutorial) {
        setCurrentTutorial(data.tutorial);
        setHotspots(data.tutorial.hotspots || []);
      }
    } catch (error) {
      console.error('Error loading tutorial:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const playHotspotExplanation = useCallback(async (hotspotId: string) => {
    const hotspot = hotspots.find(h => h.id === hotspotId);
    if (hotspot && hotspot.description) {
      await playText(hotspot.description);
    }
  }, [hotspots, playText]);

  const resetTutorialProgress = useCallback((tutorialId?: string) => {
    if (tutorialId) {
      setTutorialProgress(prev => prev.filter((p: any) => p.tutorial_id !== tutorialId));
    } else {
      setTutorialProgress([]);
    }
  }, []);

  const updateUserPreferences = useCallback((preferences: Partial<UserPreferences>) => {
    setUserPreferences(prev => prev ? { ...prev, ...preferences } : preferences as UserPreferences);
  }, []);

  const toggleHotspots = useCallback(() => {
    setShowHotspots(prev => !prev);
  }, []);

  const playHotspotAudio = useCallback(async (hotspotId: string) => {
    const hotspot = hotspots.find(h => h.id === hotspotId);
    if (hotspot && hotspot.description) {
      await playText(hotspot.description);
    }
  }, [hotspots, playText]);

  const value: VoiceGuideContextType = {
    // Audio State
    currentAudio,
    isPlaying,
    isPaused,
    isLoading,
    isGenerating,
    currentText,
    audioQueue,
    volume,
    playbackSpeed,
    
    // Voice Settings
    availableVoices,
    selectedVoice,
    
    // Tutorial State
    currentTutorial,
    currentHotspot,
    hotspots,
    tutorials,
    tutorialProgress,
    userPreferences,
    showHotspots,
    
    // Actions
    playText,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setVolume,
    setPlaybackSpeed,
    loadVoices,
    selectVoice,
    setCurrentHotspot,
    loadTutorial,
    playHotspotExplanation,
    playHotspotAudio,
    generateSpeech,
    resetTutorialProgress,
    updateUserPreferences,
    toggleHotspots
  };

  return (
    <VoiceGuideContext.Provider value={value}>
      {children}
    </VoiceGuideContext.Provider>
  );
}
