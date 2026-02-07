import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import path from 'path';

async function main() {
  const output = path.join(process.cwd(), 'public', 'videos', 'redcreativa-pro.mp4');

  console.log('🎬 Renderizando con Remotion Dev...\n');

  const entryPoint = path.join(process.cwd(), 'app', 'remotion', 'index.tsx');
  
  console.log('Bundleando...');
  const serveUrl = await bundle({
    entryPoint,
    onProgress: (p) => console.log(`  ${(p * 100).toFixed(1)}%`),
  });

  console.log('\nObteniendo composiciones...');
  const compositions = await getCompositions({ serveUrl });
  const composition = compositions.find(c => c.id === 'redcreativa-pro');

  if (!composition) {
    console.error('❌ Composición no encontrada');
    process.exit(1);
  }

  console.log(`🎥 Renderizando: ${composition.id}`);
  console.log(`   ${composition.durationInFrames / composition.fps}s | ${composition.width}x${composition.height}\n`);

  await renderMedia({
    composition,
    serveUrl,
    output,
    codec: 'h264',
    pixelFormat: 'yuv420p',
    crf: 18,
    overwrite: true,
  });

  console.log('\n✅ Video listo!');
  console.log('📁', output);
}

main().catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
