import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createSlide(title: string, sub: string, color: string) {
  const c = createCanvas(1080, 1920);
  const x = c.getContext('2d');

  const g = x.createLinearGradient(0, 0, 1080, 1920);
  g.addColorStop(0, '#0a0a12');
  g.addColorStop(1, color + '30');
  x.fillStyle = g;
  x.fillRect(0, 0, 1080, 1920);

  for (let i = 0; i < 100; i++) {
    x.beginPath();
    x.arc(Math.random() * 1080, Math.random() * 1920, Math.random() * 4, 0, 7);
    x.fillStyle = color + Math.floor(30 + Math.random() * 80).toString(16).padStart(2, '0');
    x.fill();
  }

  x.fillStyle = '#fff';
  x.font = 'bold 80px Arial';
  x.textAlign = 'center';
  x.fillText(title, 540, 960);
  x.font = '32px Arial';
  x.fillStyle = color;
  x.fillText(sub, 540, 1050);

  return c.toBuffer('image/png');
}

async function main() {
  const out = path.join(process.cwd(), 'public', 'videos', 'redcreativa.mp4');
  const dir = path.join(__dirname, 'frames_v2');
  await fs.mkdir(dir, { recursive: true });

  console.log('\n🎬 Generando video profesional...\n');

  const slides = [
    { t: 'RedCreativa Pro', s: 'La comunidad que construye', c: '#6366f1' },
    { t: 'No estás solo', s: '+1,000 creadores', c: '#8b5cf6' },
    { t: 'IA • Automatización', s: 'Lo que funciona', c: '#ec4899' },
    { t: 'Únete gratis', s: 'Es real', c: '#22d3ee' },
  ];

  const fps = 30;
  const secPerSlide = 6;
  const framesPerSlide = fps * secPerSlide;

  console.log('Creando frames...');
  for (let s = 0; s < slides.length; s++) {
    for (let f = 0; f < framesPerSlide; f++) {
      const canvas = createCanvas(1080, 1920);
      const ctx = canvas.getContext('2d');
      const slide = slides[s];
      const progress = f / framesPerSlide;

      const g = ctx.createLinearGradient(0, 0, 1080, 1920);
      g.addColorStop(0, '#0a0a12');
      g.addColorStop(1, slide.c + '30');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1080, 1920);

      for (let i = 0; i < 100; i++) {
        const ox = Math.sin(i + f * 0.02) * 20;
        const oy = Math.cos(i + f * 0.015) * 15;
        ctx.beginPath();
        ctx.arc(Math.random() * 1080 + ox, Math.random() * 1920 + oy, Math.random() * 4, 0, 7);
        ctx.fillStyle = slide.c + Math.floor(30 + Math.random() * 80).toString(16).padStart(2, '0');
        ctx.fill();
      }

      const scale = 1 + progress * 0.05;
      ctx.save();
      ctx.translate(540, 960);
      ctx.scale(scale, scale);
      ctx.translate(-540, -960);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(slide.t, 540, 960);
      ctx.font = '32px Arial';
      ctx.fillStyle = slide.c;
      ctx.fillText(slide.s, 540, 1050);
      ctx.restore();

      await fs.writeFile(path.join(dir, `slide${s}_frame${f}.png`), canvas.toBuffer('image/png'));
    }
    console.log(`  Escena ${s + 1}: ${slides[s].t}`);
  }

  console.log('\nRenderizando video...\n');

  return new Promise<void>((resolve, reject) => {
    const args = [
      '-y',
      '-framerate', String(fps),
      '-i', path.join(dir, 'slide0_frame%d.png'),
      '-i', path.join(dir, 'slide1_frame%d.png'),
      '-i', path.join(dir, 'slide2_frame%d.png'),
      '-i', path.join(dir, 'slide3_frame%d.png'),
      '-filter_complex', `[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0`,
      '-c:v', 'libx264',
      '-r', String(fps),
      '-pix_fmt', 'yuv420p',
      '-profile:v', 'baseline',
      '-level', '4.0',
      '-preset', 'medium',
      '-crf', '23',
      '-movflags', '+faststart',
      out
    ];

    const ffmpeg = spawn('ffmpeg', args);
    let err = '';
    ffmpeg.stderr.on('data', (d) => { err += d.toString(); });
    ffmpeg.on('close', (c) => {
      if (c === 0) {
        console.log('✅', out, '\n');
        resolve();
      } else {
        console.error('Error:', err.slice(-400));
        reject();
      }
    });
  });
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
