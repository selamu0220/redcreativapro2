import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { renderVideo, stitchFrames } from '@remotion/renderer';
import fs from 'fs/promises';
import path from 'path';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || 'sk_0ab9405b37b6b3870119b6300c24e0a44fd29732a179a79e',
});

const SCRIPT = `¿Qué hace a RedCreativa Pro diferente? 

No somos solo una herramienta. Somos una comunidad de creadores que construyen juntos.

Aquí no hay ventas agresivas. Hay personas reales compartiendo lo que aprenden cada día.

¿Quieres aprender IA, automatización, marketing? Únete a más de mil creadores que ya están construyendo el futuro.

RedCreativa Pro. Creando juntos.`;

const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';

async function generateAudio(): Promise<string> {
  console.log('🎙️ Generando audio con ElevenLabs...');
  
  const audio = await elevenlabs.textToSpeech.convert(VOICE_ID, {
    text: SCRIPT,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  const audioDir = path.join(process.cwd(), 'public', 'audio');
  await fs.mkdir(audioDir, { recursive: true });
  
  const audioPath = path.join(audioDir, 'redcreativa-pro-intro.mp3');
  await fs.writeFile(audioPath, Buffer.from(audio));
  
  console.log(`✅ Audio guardado: ${audioPath}`);
  return audioPath;
}

async function getAudioDuration(audioPath: string): Promise<number> {
  const mp3Duration = (await import('mp3-duration')).default;
  return await mp3Duration(audioPath);
}

export async function renderRedCreativaProVideo() {
  console.log('\n🎬 INICIANDO GENERACIÓN DE VIDEO PROFESIONAL');
  console.log('==========================================\n');
  
  const audioPath = await generateAudio();
  const audioDuration = await getAudioDuration(audioPath);
  
  console.log(`⏱️ Duración del audio: ${audioDuration.toFixed(2)} segundos\n`);

  const outputPath = path.join(process.cwd(), 'public', 'videos', 'redcreativa-pro-intro.mp4');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  console.log('🎥 Renderizando video profesional con Remotion...');

  await renderVideo({
    entryPoint: path.join(process.cwd(), 'app', 'remotion', 'compositions', 'RedCreativaPro.tsx'),
    compositionId: 'redcreativa-pro-main',
    output: outputPath,
    props: {
      audioPath: '/audio/redcreativa-pro-intro.mp3',
      script: SCRIPT,
    },
    codec: 'h264',
    pixelFormat: 'yuv420p',
    crf: 18,
    overwrite: true,
    concurrency: 1,
  });

  console.log('\n✅ VIDEO GENERADO EXITOSAMENTE!');
  console.log(`📁 Ubicación: ${outputPath}`);
  console.log(`🎬 Listo para publicar en Instagram!\n`);

  return outputPath;
}

if (require.main === module) {
  renderRedCreativaProVideo()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
