import { renderVideo } from '@remotion/renderer';
import path from 'path';
import fs from 'fs/promises';
import { generateAudioForScript, VideoScript } from '../lib/elevenlabs/elevenlabs-service';

const COMPOSITION_ID = 'instagram-short';

interface RenderOptions {
  script: VideoScript;
  outputName: string;
  voiceId?: string;
}

export async function renderInstagramVideo({
  script,
  outputName,
  voiceId = 'JBFqnCBsd6RMkjVDRZzb',
}: RenderOptions): Promise<string> {
  console.log('🎬 Generando audio con ElevenLabs...');
  
  const audioFilename = `${outputName}-${Date.now()}.mp3`;
  const { audioPath, duration } = await generateAudioForScript(script, audioFilename);
  
  console.log(`✅ Audio generado: ${audioPath}`);
  console.log(`⏱️ Duración del audio: ${duration.toFixed(2)}s`);

  const remotionProjectPath = path.join(process.cwd(), 'app', 'remotion');
  const compositionDir = path.join(remotionProjectPath, 'compositions');
  
  const entryPointPath = path.join(compositionDir, 'InstagramShort.tsx');
  
  const outputPath = path.join(process.cwd(), 'public', 'videos', `${outputName}.mp4`);
  
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  
  const props = {
    audioPath: `/audio/${audioFilename}`,
    title: script.text.substring(0, 50) + (script.text.length > 50 ? '...' : ''),
    subtitle: undefined,
    backgroundImage: undefined,
    logoPath: undefined,
  };

  console.log('🎥 Renderizando video con Remotion...');
  
  await renderVideo({
    entryPoint: entryPointPath,
    compositionId: COMPOSITION_ID,
    output: outputPath,
    props,
    codec: 'h264',
    pixelFormat: 'yuv420p',
   crf: 23,
    overwrite: true,
  });

  console.log(`✅ Video generado: ${outputPath}`);
  
  await fs.unlink(audioPath).catch(() => {});
  
  return outputPath;
}

export async function renderMultipleVideos(
  videos: RenderOptions[]
): Promise<string[]> {
  const results: string[] = [];
  
  for (const video of videos) {
    const output = await renderInstagramVideo(video);
    results.push(output);
  }
  
  return results;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
用法: node render-video.js <output-name> "<text-to-speech>"
 
示例:
  node render-video.js myvideo "Hola mundo, esto es una prueba"
  node render-video.js video1 "Este es mi primer video generado automaticamente"
    `);
    process.exit(1);
  }
  
  const outputName = args[0];
  const text = args.slice(1).join(' ');
  
  renderInstagramVideo({
    script: { text },
    outputName,
  })
    .then((output) => {
      console.log(`\n🎉 Video listo: ${output}`);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
