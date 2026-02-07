import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { spawn } from 'child_process';
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

function createSlideshowWithFFmpeg(
  audioPath: string,
  outputPath: string,
  duration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-loop', '1',
      '-i', path.join(__dirname, 'assets', 'slide1.png'),
      '-loop', '1',
      '-i', path.join(__dirname, 'assets', 'slide2.png'),
      '-loop', '1',
      '-i', path.join(__dirname, 'assets', 'slide3.png'),
      '-loop', '1',
      '-i', path.join(__dirname, 'assets', 'slide4.png'),
      '-i', audioPath,
      '-filter_complex',
      `[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,trim=0:${duration / 4},setpts=PTS-STARTPTS[v0];
       [1:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,trim=${duration / 4}:${duration / 2},setpts=PTS-STARTPTS[v1];
       [2:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,trim=${duration / 2}:${duration * 3 / 4},setpts=PTS-STARTPTS[v2];
       [3:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,trim=${duration * 3 / 4}:${duration},setpts=PTS-STARTPTS[v3];
       [v0][v1][v2][v3]concat=n=4:v=1:a=0[outv]`,
      '-map', '[outv]',
      '-map', '4:a',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-t', duration.toString(),
      '-y',
      outputPath,
    ];

    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    ffmpeg.stdout.on('data', (data) => console.log(data.toString()));
    ffmpeg.stderr.on('data', (data) => console.log(data.toString()));

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}

async function createPlaceholderSlides() {
  const assetsDir = path.join(__dirname, 'assets');
  await fs.mkdir(assetsDir, { recursive: true });

  const slides = [
    { name: 'slide1.png', text: 'RedCreativa Pro', subtitle: 'Comunidad de creadores' },
    { name: 'slide2.png', text: 'No somos solo\nuna herramienta', subtitle: 'Somos una comunidad' },
    { name: 'slide3.png', text: 'Aprende IA,\nautomatización y marketing', subtitle: 'Con personas reales' },
    { name: 'slide4.png', text: 'RedCreativa Pro', subtitle: 'Creando juntos' },
  ];

  for (const slide of slides) {
    const svgContent = `
<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="540" y="800" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${slide.text.replace(/\n/g, '<br/>')}</text>
  <text x="540" y="1000" font-family="Arial, sans-serif" font-size="36" fill="rgba(255,255,255,0.8)" text-anchor="middle">${slide.subtitle}</text>
</svg>`;

    await fs.writeFile(path.join(assetsDir, slide.name.replace('.png', '.svg')), svgContent);
  }

  console.log('✅ Slides created as SVG files');
}

export async function renderRedCreativaProVideo() {
  console.log('\n🎬 GENERANDO VIDEO DE REDCREATIVA PRO');
  console.log('====================================\n');

  try {
    await createPlaceholderSlides();
    
    const audioPath = await generateAudio();
    const audioDuration = await getAudioDuration(audioPath);
    
    console.log(`⏱️ Duración del audio: ${audioDuration.toFixed(2)} segundos\n`);

    const outputDir = path.join(process.cwd(), 'public', 'videos');
    await fs.mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'redcreativa-pro-intro.mp4');

    console.log('🎥 Generando video con FFmpeg...');

    await createSlideshowWithFFmpeg(audioPath, outputPath, audioDuration);

    console.log('\n✅ VIDEO GENERADO EXITOSAMENTE!');
    console.log(`📁 Ubicación: ${outputPath}`);
    console.log('🎬 ¡Listo para publicar en Instagram!\n');

    return outputPath;
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Sugerencia: Instala FFmpeg para generar el video:');
    console.log('   - Windows: choco install ffmpeg');
    console.log('   - Mac: brew install ffmpeg');
    console.log('   - Linux: sudo apt install ffmpeg');
    throw error;
  }
}

if (require.main === module) {
  renderRedCreativaProVideo()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
