import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SLIDES = [
  { t: 'RedCreativa Pro', s: 'La comunidad que construye', c: '#6366f1' },
  { t: 'No estás solo', s: '+1,000 creadores aprendiendo', c: '#8b5cf6' },
  { t: 'IA • Automatización', s: 'Lo que funciona, explicado', c: '#ec4899' },
  { t: 'Únete gratis', s: 'Es real. Es RedCreativa.', c: '#22d3ee' },
];

function makeSlide(i: number) {
  const w = 1080, h = 1920;
  const c = createCanvas(w, h);
  const x = c.getContext('2d');
  const s = SLIDES[i];
  
  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#0f0f1a');
  g.addColorStop(1, s.c + '60');
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);

  for (let j = 0; j < 150; j++) {
    x.beginPath();
    x.arc(Math.random()*w, Math.random()*h, Math.random()*4, 0, 7);
    x.fillStyle = s.c + Math.floor(40 + Math.random()*100).toString(16).padStart(2,'0');
    x.fill();
  }

  x.fillStyle = '#fff';
  x.font = 'bold 88px system-ui';
  x.textAlign = 'center';
  x.fillText(s.t, w/2, h/2 - 50);

  x.font = '40px system-ui';
  x.fillStyle = s.c;
  x.fillText(s.s, w/2, h/2 + 60);

  return c.toBuffer('image/png');
}

async function main() {
  const dir = path.join(__dirname, 'assets');
  const out = path.join(process.cwd(), 'public', 'videos', 'redcreativa-pro.mp4');
  await fs.mkdir(dir, { recursive: true });
  await fs.mkdir(path.dirname(out), { recursive: true });

  const imgs: string[] = [];
  for (let i = 0; i < 4; i++) {
    const p = path.join(dir, `${i}.png`);
    await fs.writeFile(p, makeSlide(i));
    imgs.push(p);
  }

  const a = path.join(dir, 'a.wav');
  const sr = 48000, d = 24, ns = d*sr;
  const b = Buffer.alloc(44 + ns*4);
  let o = 0;
  b.write('RIFF', o); o+=4; b.writeUInt32LE(b.length-8, o); o+=4;
  b.write('WAVE', o); o+=4; b.write('fmt ', o); o+=4;
  b.writeUInt32LE(16, o); o+=4; b.writeUInt16LE(1, o); o+=2;
  b.writeUInt16LE(2, o); o+=2; b.writeUInt32LE(sr, o); o+=4;
  b.writeUInt32LE(sr*4, o); o+=4; b.writeUInt16LE(4, o); o+=2;
  b.writeUInt16LE(16, o); o+=2; b.write('data', o); o+=4;
  b.writeUInt32LE(ns*4, o); o+=4;
  for (let i = 0; i < ns; i++) {
    const t = i/sr;
    const e = Math.min(1, Math.min(t*10, (d-t)*10));
    const f = 200 + Math.sin(t*0.3)*50;
    const v = Math.floor(Math.sin(t*Math.PI*2*f) * 0.1 * e * 32767);
    b.writeInt16LE(v, o); b.writeInt16LE(v, o+2); o+=4;
  }
  await fs.writeFile(a, b);

  console.log('\n🎬 Generando video profesional...\n');

  return new Promise<void>((res, rej) => {
    const f = spawn('ffmpeg', [
      '-y', '-framerate', '30',
      '-i', imgs[0], '-i', imgs[1], '-i', imgs[2], '-i', imgs[3],
      '-i', a,
      '-filter_complex', '[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0[out]',
      '-map', '[out]', '-map', '4:a',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'fast', '-crf', '16',
      '-c:a', 'aac', '-b:a', '192k', '-t', '24', out
    ]);
    let e = '';
    f.stderr.on('data', (d) => { e += d.toString(); });
    f.on('close', (c) => {
      if (c === 0) { console.log('✅', out, '\n'); res(); }
      else { console.error(e.slice(-500)); rej(); }
    });
  });
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
