// ElevenLabs API Types
export interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface VoiceModel {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: ElevenLabsVoiceSettings;
  labels?: Record<string, string>;
}

export interface ElevenLabsResponse {
  voices: VoiceModel[];
}

// Voice Guide System Types
export interface UserPreferences {
  id?: string;
  user_id: string;
  preferred_language: string;
  language: string;
  voice_id: string;
  voice_speed: number;
  voice_volume: number;
  auto_play: boolean;
  show_hotspots: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  language: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes?: number;
  estimated_duration: number;
  metadata?: Record<string, any>;
  is_active: boolean;
  hotspots?: Hotspot[];
  voice_scripts?: VoiceScript[];
  created_at?: string;
  updated_at?: string;
}

export interface TutorialProgress {
  id: string;
  user_id: string;
  tutorial_id: string;
  completion_percentage: number;
  current_position: Record<string, any>;
  last_accessed: string;
  created_at: string;
}

export interface Hotspot {
  id: string;
  tutorial_id: string;
  element_selector: string;
  position_x: number;
  position_y: number;
  title: string;
  label?: string;
  description: string;
  targetElement?: string;
  position?: {
    x: number;
    y: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
  };
  position_data?: {
    x: number;
    y: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
  };
  trigger_type?: 'click' | 'hover' | 'auto';
  voice_script_id?: string;
  order_index: number;
  sort_order?: number;
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at?: string;
}

export interface VoiceScript {
  id: string;
  tutorial_id: string;
  hotspot_id?: string;
  language: SupportedLanguage;
  script_content: string;
  context_key: string;
  created_at: string;
  updated_at: string;
}

export interface AudioCache {
  id: string;
  script_id: string;
  voice_id: string;
  audio_url: string;
  file_size: number;
  duration_seconds: number;
  created_at: string;
  expires_at: string;
}

// UI Component Types
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  isLoading: boolean;
  error?: string;
}

export interface VoiceGuideState {
  isActive: boolean;
  currentTutorial?: Tutorial;
  currentHotspot?: Hotspot;
  audioPlayer: AudioPlayerState;
  userPreferences?: UserPreferences;
  availableVoices: VoiceModel[];
  isLoading: boolean;
  error?: string;
}

export interface HotspotIndicatorProps {
  hotspot: Hotspot;
  isActive: boolean;
  onClick: () => void;
  onHover?: () => void;
}

export interface AudioPlayerProps {
  audioUrl?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  autoPlay?: boolean;
  playbackSpeed?: number;
  volume?: number;
}

export interface VoiceGuideDashboardProps {
  tutorials: Tutorial[];
  userProgress: TutorialProgress[];
  onTutorialSelect: (tutorial: Tutorial) => void;
  onSettingsChange: (preferences: Partial<UserPreferences>) => void;
}

// Language Support
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
  voices: string[]; // Voice IDs that support this language
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    voices: ['21m00Tcm4TlvDq8ikWAM', 'AZnzlk1XvdvUeBnXmlld', 'EXAVITQu4vr4xnSDxMaL']
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    voices: ['VR6AewLTigWG4xSOukaG', 'ThT5KcBeYPX3keUQqHPh']
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    voices: ['XB0fDUnXU5powFXDhCwa', 'TxGEqnHWrfWFTfGW9XjX']
  },
  {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    voices: ['8b0d8c8e-7c1a-4b2c-9d3e-4f5g6h7i8j9k', 'yoZ06aMxZJJ28mfd3POQ']
  }
];

// API Response Types
export interface VoiceGuideApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateSpeechRequest {
  text: string;
  voice_id: string;
  language: SupportedLanguage;
  settings?: ElevenLabsVoiceSettings;
}

export interface GenerateSpeechResponse {
  audio_url: string;
  duration_seconds: number;
  file_size: number;
  cache_id?: string;
}

// Context Types
export interface VoiceGuideContextValue {
  state: VoiceGuideState;
  actions: {
    activateVoiceGuide: () => void;
    deactivateVoiceGuide: () => void;
    selectTutorial: (tutorial: Tutorial) => void;
    triggerHotspot: (hotspot: Hotspot) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
    playAudio: (audioUrl: string) => void;
    pauseAudio: () => void;
    setVolume: (volume: number) => void;
    setPlaybackSpeed: (speed: number) => void;
  };
}
