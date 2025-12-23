'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
// Types
interface Tutorial {
  id: string;
  title: string;
  description: string;
  language: string;
  category: string;
  difficulty_level: string;
  estimated_duration: number;
  is_active: boolean;
  hotspots?: Hotspot[];
  voice_scripts?: VoiceScript[];
}

interface Hotspot {
  id: string;
  tutorial_id: string;
  element_selector: string;
  position_x: number;
  position_y: number;
  title: string;
  description: string;
  voice_script_id?: string;
  order_index: number;
  is_active: boolean;
}

interface VoiceScript {
  id: string;
  tutorial_id: string;
  hotspot_id?: string;
  script_text: string;
  language: string;
  voice_id: string;
  audio_url?: string;
}

interface UserPreferences {
  user_id: string;
  preferred_language: string;
  voice_id: string;
  voice_speed: number;
  voice_volume: number;
  auto_play: boolean;
  show_hotspots: boolean;
}

interface TutorialProgress {
  user_id: string;
  tutorial_id: string;
  current_hotspot_id?: string;
  completed: boolean;
  progress_percentage: number;
  last_accessed_at: string;
}

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  preview_url?: string;
  labels: Record<string, any>;
  settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

// Context State Interface
interface VoiceGuideContextType {
  // State
  currentTutorial: Tutorial | null;
  currentHotspot: Hotspot | null;
  userPreferences: UserPreferences | null;
  tutorialProgress: TutorialProgress | null;
  availableVoices: Voice[];
  isPlaying: boolean;
  isLoading: boolean;
  showHotspots: boolean;
  
  // Audio Control
  currentAudio: HTMLAudioElement | null;
  playbackSpeed: number;
  volume: number;
  
  // Actions
  loadTutorial: (tutorialId: string, language?: string) => Promise<void>;
  setCurrentHotspot: (hotspot: Hotspot | null) => void;
  playHotspotAudio: (hotspotId: string) => Promise<void>;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateProgress: (hotspotId?: string) => Promise<void>;
  toggleHotspots: () => void;
  loadVoices: () => Promise<void>;
  generateSpeech: (text: string, voiceId?: string) => Promise<string>;
}

const VoiceGuideContext = createContext<VoiceGuideContextType | undefined>(undefined);

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Provider Component
export function VoiceGuideProvider({ children }: { children: React.ReactNode }) {
  // State
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentHotspot, setCurrentHotspot] = useState<Hotspot | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [tutorialProgress, setTutorialProgress] = useState<TutorialProgress | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1.0);
  const [volume, setVolumeState] = useState(0.8);

  // Load user preferences on mount
  useEffect(() => {
    loadUserPreferences();
    loadVoices();
  }, []);

  // Load user preferences
  const loadUserPreferences = async () => {
    try {
      const userId = 'demo-user'; // Replace with actual user ID from auth
      const response = await fetch(`/api/voice-guide/preferences?user_id=${userId}`);
      const data = await response.json();
      
      if (data.preferences) {
        setUserPreferences(data.preferences);
        setPlaybackSpeedState(data.preferences.voice_speed);
        setVolumeState(data.preferences.voice_volume);
        setShowHotspots(data.preferences.show_hotspots);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  // Load tutorial
  const loadTutorial = useCallback(async (tutorialId: string, language = 'en') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/voice-guide/content?tutorial_id=${tutorialId}&language=${language}`);
      const data = await response.json();
      
      if (data.tutorial) {
        setCurrentTutorial(data.tutorial);
        // Load progress for this tutorial
        await loadTutorialProgress(tutorialId);
      }
    } catch (error) {
      console.error('Error loading tutorial:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load tutorial progress
  const loadTutorialProgress = async (tutorialId: string) => {
    try {
      const userId = 'demo-user'; // Replace with actual user ID
      const { data, error } = await supabase
        .from('tutorial_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('tutorial_id', tutorialId)
        .single();

      if (data) {
        setTutorialProgress(data);
      }
    } catch (error) {
      console.error('Error loading tutorial progress:', error);
    }
  };

  // Play hotspot audio
  const playHotspotAudio = useCallback(async (hotspotId: string) => {
    if (!currentTutorial) return;

    const hotspot = currentTutorial.hotspots?.find(h => h.id === hotspotId);
    if (!hotspot) return;

    const voiceScript = currentTutorial.voice_scripts?.find(vs => vs.hotspot_id === hotspotId);
    if (!voiceScript) return;

    setIsLoading(true);
    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      let audioUrl = voiceScript.audio_url;
      
      // Generate speech if no cached audio
      if (!audioUrl) {
        audioUrl = await generateSpeech(voiceScript.script_text, voiceScript.voice_id);
      }

      // Create and play audio
      const audio = new Audio(audioUrl);
      audio.playbackRate = playbackSpeed;
      audio.volume = volume;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      await audio.play();
      
      // Update progress
      await updateProgress(hotspotId);
    } catch (error) {
      console.error('Error playing hotspot audio:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentTutorial, currentAudio, playbackSpeed, volume]);

  // Audio controls
  const pauseAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
    }
  }, [currentAudio]);

  const resumeAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.play();
    }
  }, [currentAudio]);

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  }, [currentAudio]);

  // Set playback speed
  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(speed);
    if (currentAudio) {
      currentAudio.playbackRate = speed;
    }
  }, [currentAudio]);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (currentAudio) {
      currentAudio.volume = newVolume;
    }
  }, [currentAudio]);

  // Update user preferences
  const updateUserPreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    try {
      const userId = 'demo-user'; // Replace with actual user ID
      const response = await fetch('/api/voice-guide/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...preferences })
      });
      
      const data = await response.json();
      if (data.preferences) {
        setUserPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, []);

  // Update progress
  const updateProgress = useCallback(async (hotspotId?: string) => {
    if (!currentTutorial) return;

    try {
      const userId = 'demo-user'; // Replace with actual user ID
      const response = await fetch('/api/voice-guide/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          tutorial_id: currentTutorial.id,
          hotspot_id: hotspotId
        })
      });
      
      const data = await response.json();
      if (data.progress) {
        setTutorialProgress(data.progress);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [currentTutorial]);

  // Toggle hotspots visibility
  const toggleHotspots = useCallback(() => {
    setShowHotspots(prev => !prev);
  }, []);

  // Load available voices
  const loadVoices = useCallback(async () => {
    try {
      const response = await fetch('/api/voice-guide/voices');
      const data = await response.json();
      
      if (data.voices) {
        setAvailableVoices(data.voices);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  }, []);

  // Generate speech
  const generateSpeech = useCallback(async (text: string, voiceId?: string): Promise<string> => {
    try {
      const response = await fetch('/api/voice-guide/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice_id: voiceId || userPreferences?.voice_id || 'EXAVITQu4vr4xnSDxMaL',
          cache_key: `${text.substring(0, 50)}_${voiceId || 'default'}`
        })
      });
      
      const data = await response.json();
      return data.audio_url;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }, [userPreferences]);

  const contextValue: VoiceGuideContextType = {
    // State
    currentTutorial,
    currentHotspot,
    userPreferences,
    tutorialProgress,
    availableVoices,
    isPlaying,
    isLoading,
    showHotspots,
    currentAudio,
    playbackSpeed,
    volume,
    
    // Actions
    loadTutorial,
    setCurrentHotspot,
    playHotspotAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setPlaybackSpeed,
    setVolume,
    updateUserPreferences,
    updateProgress,
    toggleHotspots,
    loadVoices,
    generateSpeech
  };

  return (
    <VoiceGuideContext.Provider value={contextValue}>
      {children}
    </VoiceGuideContext.Provider>
  );
}

// Hook to use the context
export function useVoiceGuide() {
  const context = useContext(VoiceGuideContext);
  if (context === undefined) {
    throw new Error('useVoiceGuide must be used within a VoiceGuideProvider');
  }
  return context;
}

export default VoiceGuideContext;