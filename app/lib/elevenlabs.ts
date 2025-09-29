/**
 * ElevenLabs API Client for Text-to-Speech functionality
 * Handles voice generation, caching, and voice management
 */

export interface Voice {
  voice_id: string;
  name: string;
  samples: null;
  category: string;
  fine_tuning: {
    language: string;
    is_allowed_to_fine_tune: boolean;
    finetuning_state: string;
    verification_attempts: null;
    verification_failures: [];
    verification_attempts_count: number;
    slice_ids: null;
    manual_verification: null;
    manual_verification_requested: boolean;
  };
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: null;
  sharing: null;
  high_quality_base_model_ids: string[];
  safety_control: null;
  voice_verification: {
    requires_verification: boolean;
    is_verified: boolean;
    verification_failures: [];
    verification_attempts_count: number;
    language: null;
    verification_attempts: null;
  };
  permission_on_resource: null;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface GenerateSpeechRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  output_format?: string;
}

export interface GenerateSpeechResponse {
  audio_url: string;
  duration_seconds?: number;
  file_size?: number;
}

class ElevenLabsClient {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get all available voices from ElevenLabs
   */
  async getVoices(): Promise<Voice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  /**
   * Generate speech from text using specified voice
   */
  async generateSpeech({
    text,
    voice_id,
    model_id = 'eleven_multilingual_v2',
    voice_settings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    },
    output_format = 'mp3_44100_128',
  }: GenerateSpeechRequest): Promise<ArrayBuffer> {
    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings,
          output_format,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  /**
   * Get voice by ID
   */
  async getVoice(voiceId: string): Promise<Voice> {
    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching voice:', error);
      throw error;
    }
  }

  /**
   * Get user subscription info and usage
   */
  async getUserInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  /**
   * Convert ArrayBuffer to base64 data URL for audio playback
   */
  arrayBufferToDataUrl(buffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:${mimeType};base64,${base64}`;
  }
}

// Default voice configurations for different languages
export const DEFAULT_VOICES = {
  en: 'pNInz6obpgDQGcFmaJgB', // Adam - English
  es: 'VR6AewLTigWG4xSOukaG', // Arnold - Spanish
  fr: 'CYw3kZ02Hs0563khs1Fj', // Antoni - French
  de: 'ErXwobaYiN019PkySvjV', // Antoni - German
  it: 'XrExE9yKIg1WjnnlVkGX', // Domi - Italian
  pt: 'TxGEqnHWrfWFTfGW9XjX', // Josh - Portuguese
};

// Create and export a singleton instance
let elevenLabsClient: ElevenLabsClient | null = null;

export function getElevenLabsClient(): ElevenLabsClient {
  if (!elevenLabsClient) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    elevenLabsClient = new ElevenLabsClient(apiKey);
  }
  return elevenLabsClient;
}

export { ElevenLabsClient };
export default ElevenLabsClient;