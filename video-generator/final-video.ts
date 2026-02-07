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
  const dir = path.join(__dirname, 'temp_frames');
  await fs.mkdir(dir, { recursive: true });

  console.log('\n🎬 Generando video final...\n');

  const slides = [
    { t: 'RedCreativa Pro', s: 'La comunidad que construye', c: '#6366f1' },
    { t: 'No estás solo', s: '+1,000 creadores', c: '#8b5cf6' },
    { t: 'IA • Automatización', s: 'Lo que funciona', c: '#ec4899' },
    { t: 'Únete gratis', s: 'Es real', c: '#22d3ee' },
  ];

  for (let i = 0; i < slides.length; i++) {
    await fs.writeFile(path.join(dir, `${i}.png`), createSlide(slides[i].t, slides[i].s, slides[i].c));
  }

  console.log('🎥 Renderizando video...\n');

  return new Promise<void>((resolve, reject) => {
    const args = [
      '-y',
      '-framerate', '30/1',
      '-i', path.join(dir, '0.png'),
      '-framerate', '30/1',
      '-i', path.join(dir, '1.png'),
      '-framerate', '30/1',
      '-i', path.join(dir, '2.png'),
      '-framerate', '30/1',
      '-i', path.join(dir, '3.png'),
      '-c:v', 'libx264',
      '-r', '30',
      '-pix_fmt', 'yuv420p',
      '-profile:v', 'baseline',
      '-level', '4.0',
      '-preset', 'medium',
      '-crf', '23',
      '-t', '24',
      '-movflags', '+faststart',
      out
    ];

    const f = spawn('ffmpeg', args);
    let err = '';
    f.stderr.on('data', (d) => { err += d.toString(); process.stderr.write(d); });
    f.on('close', (c) => {
      if (c === 0) {
        console.log('\n✅ Video listo:', out, '\n');
        resolve();
      } else {
        console.error('Error:', err.slice(-400));
        reject();
      }
    });
  });
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
