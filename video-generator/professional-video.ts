import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || 'sk_0ab9405b37b6b3870119b6300c24e0a44fd29732a179a79e',
});

const SCRIPT = `Bienvenido a RedCreativa Pro.

Aquí no vendemos. Aquí construimos juntos.

Somos una comunidad de más de mil creadores aprendiendo IA, automatización y marketing real.

Sin promesas vacías. Sin ventas agresivas.

Solo personas reales compartiendo lo que funciona.

¿Listo para unirte?`;

async function generateAudio(): Promise<{ path: string; duration: number } | null> {
  console.log('🎙️ Generando audio con ElevenLabs...');
  
  try {
    const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
      text: SCRIPT,
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
    });

    let audioData: Uint8Array;
    if (audio instanceof Uint8Array) {
      audioData = audio;
    } else if (audio instanceof ArrayBuffer) {
      audioData = new Uint8Array(audio);
    } else if (audio instanceof ReadableStream) {
      const chunks: Uint8Array[] = [];
      const reader = audio.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const total = chunks.reduce((acc, c) => acc + c.length, 0);
      audioData = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, offset);
        offset += chunk.length;
      }
    } else {
      throw new Error('Tipo no soportado');
    }

    const audioPath = path.join(__dirname, 'audio', 'voice.mp3');
    await fs.mkdir(path.dirname(audioPath), { recursive: true });
    await fs.writeFile(audioPath, audioData);

    const duration = 20; 
    console.log(`✅ Audio: ${audioPath} (${duration}s)`);
    return { path: audioPath, duration };
  } catch (error) {
    console.log('⚠️ Error con ElevenLabs, usando audio placeholder');
    return null;
  }
}

async function createPlaceholderAudio(audioPath: string, duration: number): Promise<void> {
  const sr = 48000;
  const samples = Math.floor(duration * sr);
  const buffer = Buffer.alloc(44 + samples * 4);
  let offset = 0;

  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(buffer.length - 8, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(1, offset); offset += 2;
  buffer.writeUInt16LE(2, offset); offset += 2;
  buffer.writeUInt32LE(sr, offset); offset += 4;
  buffer.writeUInt32LE(sr * 4, offset); offset += 4;
  buffer.writeUInt16LE(4, offset); offset += 2;
  buffer.writeUInt16LE(16, offset); offset += 2;
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(samples * 4, offset); offset += 4;

  for (let i = 0; i < samples; i++) {
    const t = i / sr;
    const envelope = Math.min(1, Math.min(t * 4, (duration - t) * 4));
    const freq = 220 + Math.sin(t * 0.4) * 40;
    const sample = Math.sin(t * Math.PI * 2 * freq) * 0.15 * envelope;
    const value = Math.floor(sample * 32767);
    buffer.writeInt16LE(value, offset);
    buffer.writeInt16LE(value, offset + 2);
    offset += 4;
  }

  await fs.writeFile(audioPath, buffer);
}

function createTitleSlide() {
  const w = 1920, h = 1080;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  const bg = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
  bg.addColorStop(0, '#1a1a2e');
  bg.addColorStop(0.5, '#0f0f1a');
  bg.addColorStop(1, '#050510');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 200; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 4 + 1;
    const opacity = Math.random() * 0.4 + 0.1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(99, 102, 241, ${opacity})`;
    ctx.fill();
  }

  const grid = ctx.createLinearGradient(0, 0, w, h);
  grid.addColorStop(0, 'transparent');
  grid.addColorStop(0.5, 'rgba(99, 102, 241, 0.03)');
  grid.addColorStop(1, 'transparent');
  ctx.fillStyle = grid;
  ctx.fillRect(0, 0, w, h);

  return canvas.toBuffer('image/png');
}

function createContentSlide(title: string, subtitle: string, accent: string, emoji: string) {
  const w = 1920, h = 1080;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0a0a15');
  bg.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const orb = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 600);
  orb.addColorStop(0, accent + '20');
  orb.addColorStop(0.5, accent + '10');
  orb.addColorStop(1, 'transparent');
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 150; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = accent + Math.floor(Math.random() * 60 + 30).toString(16).padStart(2, '0');
    ctx.fill();
  }

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 120px system-ui';
  ctx.textAlign = 'center';
  
  const words = title.split(' ');
  words.forEach((word, i) => {
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 20;
    ctx.fillText(word, w/2 + (i - words.length/2 + 0.5) * 130, h/2 - 80 + i * 120);
  });
  ctx.shadowBlur = 0;

  ctx.font = 'italic 48px system-ui';
  ctx.fillStyle = accent + 'cc';
  ctx.fillText(subtitle, w/2, h/2 + 150);

  ctx.font = '100px system-ui';
  ctx.globalAlpha = 0.15;
  ctx.fillText(emoji, w/2, h/2 - 250);
  ctx.globalAlpha = 1;

  return canvas.toBuffer('image/png');
}

async function main() {
  console.log('\n🎬 GENERANDO VIDEO PROFESIONAL...\n');

  const audioResult = await generateAudio();
  const audioPath = path.join(__dirname, 'audio', 'audio.wav');
  
  let duration = 24;
  if (audioResult) {
    duration = Math.ceil(audioResult.duration);
  } else {
    await createPlaceholderAudio(audioPath, duration);
    console.log('⚠️ Usando audio placeholder (genera API key en ElevenLabs)');
  }

  const slidesDir = path.join(__dirname, 'slides');
  await fs.mkdir(slidesDir, { recursive: true });

  const slides = [
    { title: 'RedCreativa Pro', subtitle: 'La comunidad que construye', accent: '#6366f1', emoji: '🚀' },
    { title: 'No estás solo', subtitle: '+1,000 creadores aprendiendo', accent: '#8b5cf6', emoji: '🤝' },
    { title: 'IA • Automatización', subtitle: 'Lo que funciona, explicado', accent: '#ec4899', emoji: '💡' },
    { title: 'Únete gratis', subtitle: 'Es real. Es RedCreativa Pro.', accent: '#22d3ee', emoji: '✨' },
  ];

  console.log('🎨 Creando slides...');
  await fs.writeFile(path.join(slidesDir, 'slide0.png'), createTitleSlide());
  for (let i = 0; i < slides.length; i++) {
    await fs.writeFile(path.join(slidesDir, `slide${i+1}.png`), createContentSlide(slides[i].title, slides[i].subtitle, slides[i].accent, slides[i].emoji));
  }

  const outputPath = path.join(process.cwd(), 'public', 'videos', 'redcreativa-pro.mp4');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  console.log('🎥 Renderizando con efectos profesionales...\n');

  return new Promise<void>((resolve, reject) => {
    const sceneDuration = duration / slides.length;
    
    const args = [
      '-y',
      '-framerate', '30',
      '-loop', '1', '-t', String(sceneDuration), '-i', path.join(slidesDir, 'slide0.png'),
      '-loop', '1', '-t', String(sceneDuration), '-i', path.join(slidesDir, 'slide1.png'),
      '-loop', '1', '-t', String(sceneDuration), '-i', path.join(slidesDir, 'slide2.png'),
      '-loop', '1', '-t', String(sceneDuration), '-i', path.join(slidesDir, 'slide3.png'),
      '-loop', '1', '-t', String(sceneDuration), '-i', path.join(slidesDir, 'slide4.png'),
      '-i', audioResult ? audioResult.path : audioPath,
      '-filter_complex',
      `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='min(1.05+on/200,1.15)':d=${sceneDuration*30}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080,fps=30,trim=0:${sceneDuration},setpts=PTS-STARTPTS[v0];
       [1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='min(1+on/250,1.2)':d=${sceneDuration*30}:x='iw/2-(iw/zoom/2)+sin(on/30)*10':y='ih/2-(ih/zoom/2)+cos(on/40)*8':s=1920x1080,fps=30,trim=0:${sceneDuration},setpts=PTS-STARTPTS[v1];
       [2:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='1.2-min(on/300,0.2)':d=${sceneDuration*30}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080,fps=30,trim=0:${sceneDuration},setpts=PTS-STARTPTS[v2];
       [3:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='min(1.05+on/200,1.18)':d=${sceneDuration*30}:x='iw/2-(iw/zoom/2)-sin(on/35)*12':y='ih/2-(ih/zoom/2)+cos(on/45)*10':s=1920x1080,fps=30,trim=0:${sceneDuration},setpts=PTS-STARTPTS[v3];
       [4:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='1.15-min(on/280,0.15)':d=${sceneDuration*30}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080,fps=30,trim=0:${sceneDuration},setpts=PTS-STARTPTS[v4];
       [v0][v1][v2][v3][v4]concat=n=5:v=1:a=0,eq=brightness=0.02:saturation=1.1[out]`,
      '-map', '[out]',
      '-map', '5:a',
      '-c:v', 'libx264',
      '-b:a', '192k',
      '-ar', '48000',
      '-t', String(duration),
      outputPath
    ];

    const ffmpeg = spawn('ffmpeg', args);
    let err = '';
    ffmpeg.stderr.on('data', (d) => { err += d.toString(); });
    ffmpeg.on('close', (c) => {
      if (c === 0) {
        console.log('\n✅ VIDEO GENERADO!');
        console.log(`📁 ${outputPath}`);
        console.log(`⏱️ ${duration} segundos`);
        console.log('\n🎬 ¡Listo para Instagram Reels!\n');
        resolve();
      } else {
        console.error('Error:', err.slice(-600));
        reject();
      }
    });
  });
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
