import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || 'sk_0ab9405b37b6b3870119b6300c24e0a44fd29732a179a79e',
});

export interface VideoScript {
  text: string;
  sceneImages?: string[];
  duration?: number;
}

export async function generateSpeech(
  text: string,
  voiceId: string = 'JBFqnCBsd6RMkjVDRZzb',
  options?: {
    modelId?: string;
    outputFormat?: string;
  }
): Promise<ArrayBuffer> {
  const audio = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    modelId: options?.modelId || 'eleven_multilingual_v2',
    outputFormat: options?.outputFormat || 'mp3_44100_128',
  });

  return audio;
}

export async function saveAudioToFile(
  audio: ArrayBuffer,
  filename: string
): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const outputDir = path.join(process.cwd(), 'public', 'audio');
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (e) {
    // Directory might already exist
  }
  
  const filepath = path.join(outputDir, filename);
  await fs.writeFile(filepath, Buffer.from(audio));
  
  return filepath;
}

export async function generateAudioForScript(
  script: VideoScript,
  filename: string
): Promise<{ audioPath: string; duration: number }> {
  const audio = await generateSpeech(script.text);
  const audioPath = await saveAudioToFile(audio, filename);
  
  const duration = await getAudioDuration(audioPath);
  
  return { audioPath, duration };
}

async function getAudioDuration(audioPath: string): Promise<number> {
  const mp3Duration = (await import('mp3-duration')).default;
  const duration = await mp3Duration(audioPath);
  return duration;
}

export { elevenlabs };
