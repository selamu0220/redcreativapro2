import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SLIDES = [
  { t: 'ESCRIBE MEJOR', s: 'Con RedCreativa Pro', c: '#FF3366', e: '✍️' },
  { t: 'IA QUE ENTIENDE', s: 'Tu estilo único', c: '#FF9933', e: '🧠' },
  { t: 'SEO AUTOMÁTICO', s: 'Ranking #1 garantizado', c: '#33FF99', e: '📈' },
  { t: 'EMPIEZA HOY', s: '100% gratis', c: '#3366FF', e: '🚀' },
];

function makeFrame(i: number, total: number) {
  const w = 1080, h = 1920;
  const c = createCanvas(w, h);
  const x = c.getContext('2d');
  const s = SLIDES[i];
  const progress = i / total;
  const pulse = 1 + Math.sin(progress * Math.PI * 8) * 0.05;

  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#0a0a12');
  g.addColorStop(1, s.c + '30');
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);

  for (let j = 0; j < 120; j++) {
    const ox = Math.sin(j * 0.5 + progress * 6) * 50;
    const oy = Math.cos(j * 0.7 + progress * 4) * 40;
    x.beginPath();
    x.arc(Math.random() * w + ox, Math.random() * h + oy, Math.random() * 4, 0, 7);
    x.fillStyle = s.c + Math.floor(40 + Math.random() * 100).toString(16).padStart(2, '0');
    x.fill();
  }

  const g2 = x.createRadialGradient(w/2, h/2, 0, w/2, h/2, 600);
  g2.addColorStop(0, s.c + '15');
  g2.addColorStop(1, 'transparent');
  x.fillStyle = g2;
  x.fillRect(0, 0, w, h);

  x.save();
  x.translate(w/2, h/2);
  x.scale(pulse, pulse);
  x.translate(-w/2, -h/2);

  x.fillStyle = '#fff';
  x.font = 'bold 96px Arial';
  x.textAlign = 'center';
  
  const words = s.t.split(' ');
  words.forEach((word, idx) => {
    x.fillStyle = idx % 2 === 0 ? '#fff' : s.c;
    x.shadowColor = s.c;
    x.shadowBlur = 30;
    x.fillText(word, w/2 + (idx - 0.5) * 110, h/2 - 80 + idx * 110);
  });
  x.shadowBlur = 0;

  x.font = 'italic 42px Arial';
  x.fillStyle = s.c;
  x.fillText(s.s, w/2, h/2 + 150);

  x.font = '120px Arial';
  x.globalAlpha = 0.1;
  x.fillText(s.e, w/2, h/2 - 250);
  x.globalAlpha = 1;

  x.restore();

  return c.toBuffer('image/png');
}

async function main() {
  const out = path.join(process.cwd(), 'public', 'videos', 'redcreativa-v2.mp4');
  const dir = path.join(__dirname, 'frames_v2');
  await fs.mkdir(dir, { recursive: true });
  await fs.mkdir(path.dirname(out), { recursive: true });

  console.log('\n🎬 Generando video v2...\n');

  for (let i = 0; i < SLIDES.length; i++) {
    await fs.writeFile(path.join(dir, `${i}.png`), makeFrame(i, SLIDES.length));
    console.log(`  Escena ${i + 1}: ${SLIDES[i].t}`);
  }

  console.log('\nRenderizando...\n');

  return new Promise<void>((res, rej) => {
    const f = spawn('ffmpeg', [
      '-y', '-framerate', '30',
      '-loop', '1', '-t', '6', '-i', path.join(dir, '0.png'),
      '-loop', '1', '-t', '6', '-i', path.join(dir, '1.png'),
      '-loop', '1', '-t', '6', '-i', path.join(dir, '2.png'),
      '-loop', '1', '-t', '6', '-i', path.join(dir, '3.png'),
      '-filter_complex', '[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-preset', 'fast', '-crf', '17',
      '-t', '24', out
    ]);
    let e = '';
    f.stderr.on('data', (d) => { e += d.toString(); });
    f.on('close', (c) => {
      if (c === 0) { console.log('✅', out, '\n'); res(); }
      else { console.error(e.slice(-400)); rej(); }
    });
  });
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
