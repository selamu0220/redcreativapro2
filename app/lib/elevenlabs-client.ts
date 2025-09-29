import { ElevenLabsVoiceSettings, ElevenLabsResponse, VoiceModel } from '../types/voice-guide';

const ELEVENLABS_API_KEY = 'sk_79d9be1773370f81499e7a424aeb84bb0964368a19140b48';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export class ElevenLabsClient {
  private static instance: ElevenLabsClient;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || ELEVENLABS_API_KEY;
    this.baseUrl = ELEVENLABS_BASE_URL;
  }

  /**
   * Get singleton instance of ElevenLabsClient
   */
  static getInstance(apiKey?: string): ElevenLabsClient {
    if (!ElevenLabsClient.instance) {
      ElevenLabsClient.instance = new ElevenLabsClient(apiKey);
    }
    return ElevenLabsClient.instance;
  }

  /**
   * Generate speech from text using ElevenLabs API
   */
  async generateSpeech(
    text: string,
    voiceId: string,
    settings?: ElevenLabsVoiceSettings
  ): Promise<ArrayBuffer> {
    const url = `${this.baseUrl}/text-to-speech/${voiceId}`;
    
    const defaultSettings: ElevenLabsVoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    };

    const voiceSettings = { ...defaultSettings, ...settings };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<VoiceModel[]> {
    const url = `${this.baseUrl}/voices`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const data: ElevenLabsResponse = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  /**
   * Get voice details by ID
   */
  async getVoiceById(voiceId: string): Promise<VoiceModel> {
    const url = `${this.baseUrl}/voices/${voiceId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching voice details:', error);
      throw error;
    }
  }

  /**
   * Convert ArrayBuffer to Blob for audio playback
   */
  createAudioBlob(audioBuffer: ArrayBuffer): Blob {
    return new Blob([audioBuffer], { type: 'audio/mpeg' });
  }

  /**
   * Create audio URL from ArrayBuffer
   */
  createAudioUrl(audioBuffer: ArrayBuffer): string {
    const blob = this.createAudioBlob(audioBuffer);
    return URL.createObjectURL(blob);
  }
}

// Export singleton instance
export const elevenLabsClient = new ElevenLabsClient();

// Export function to get client instance
export function getElevenLabsClient(): ElevenLabsClient {
  return elevenLabsClient;
}