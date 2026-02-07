const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'videos', 'redcreativa-final.mp4');
const FRAMES_DIR = path.join(__dirname, 'frames');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Canvas dimensions
const WIDTH = 1080;
const HEIGHT = 1920;

// Colors
const COLORS = {
  background: '#050510',
  neonBlue: '#00D4FF',
  neonPurple: '#B700FF',
  cyan: '#00FFFF',
  white: '#FFFFFF',
  accent1: '#FF0066',
  accent2: '#FF9900',
};

// Easing functions
const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeOutElastic = (t) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

// Generate a single frame
function generateFrame(frameNumber, totalFrames) {
  const t = frameNumber / totalFrames;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">`;
  
  // Background
  svg += `<rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.background}"/>`;
  
  // Scene timing
  const scene1End = 0.16;   // 0-4s (16%)
  const scene2End = 0.36;   // 4-9s (20%)
  const scene3End = 0.64;   // 9-16s (28%)
  const scene4End = 0.84;   // 16-21s (20%)
  const scene5End = 1.0;    // 21-25s (16%)
  
  // ===== SCENE 1: HOOK (0-4s) =====
  if (t < scene1End) {
    const localT = t / scene1End;
    const scaledLocal = easeOutExpo(localT);
    
    // Particles explosion
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 100 + localT * 800;
      const px = WIDTH/2 + Math.cos(angle) * distance * (0.5 + Math.sin(i * 13) * 0.5);
      const py = HEIGHT/2 + Math.sin(angle) * distance * (0.5 + Math.cos(i * 17) * 0.5);
      const size = 8 * (1 - localT) * (0.5 + Math.sin(i * 7) * 0.5);
      const opacity = 1 - localT;
      
      if (localT < 0.7) {
        svg += `<circle cx="${px}" cy="${py}" r="${size}" fill="${i % 2 === 0 ? COLORS.neonBlue : COLORS.neonPurple}" opacity="${opacity}"/>`;
      }
    }
    
    // Main title reveal
    if (localT > 0.2) {
      const titleLocal = (localT - 0.2) / 0.8;
      const scale = 1 + (1 - easeOutExpo(titleLocal)) * 0.3;
      const opacity = Math.min(1, (localT - 0.2) * 5);
      
      svg += `<text x="${WIDTH/2}" y="${HEIGHT * 0.4}" 
              font-family="Arial Black, sans-serif" 
              font-size="80" 
              fill="${COLORS.white}"
              text-anchor="middle"
              opacity="${opacity}"
              transform="translate(${WIDTH/2}, ${HEIGHT * 0.4}) scale(${scale}) translate(-${WIDTH/2}, -${HEIGHT * 0.4})">
              REDCREATIVA
      </text>`;
      
      // Glow effect
      svg += `<text x="${WIDTH/2}" y="${HEIGHT * 0.4}" 
              font-family="Arial Black, sans-serif" 
              font-size="80" 
              fill="none"
              stroke="${COLORS.neonBlue}"
              stroke-width="3"
              text-anchor="middle"
              opacity="${opacity * 0.5}"
              transform="translate(${WIDTH/2}, ${HEIGHT * 0.4}) scale(${scale}) translate(-${WIDTH/2}, -${HEIGHT * 0.4})">
              REDCREATIVA
      </text>`;
    }
    
    // Subtitle
    if (localT > 0.5) {
      const subLocal = (localT - 0.5) / 0.5;
      const yOffset = HEIGHT * 0.4 + 120 * (1 - easeOutExpo(subLocal));
      
      svg += `<text x="${WIDTH/2}" y="${yOffset}" 
              font-family="Arial, sans-serif" 
              font-size="42" 
              fill="${COLORS.cyan}"
              text-anchor="middle"
              opacity="${subLocal}">
              PRO
      </text>`;
    }
  }
  
  // ===== SCENE 2: SOLUTION PRESENTATION (4-9s) =====
  else if (t < scene2End) {
    const localT = (t - scene1End) / (scene2End - scene1End);
    
    // Logo with bounce
    const logoScale = localT < 0.3 ? 0.3 + 0.7 * easeOutExpo(localT / 0.3) : 
                      0.3 + 0.7 * (1 + 0.15 * Math.sin((localT - 0.3) / 0.7 * Math.PI * 4));
    const logoY = HEIGHT/2 - (1 - easeOutExpo(localT)) * 50;
    
    const logoOpacity = Math.min(1, localT * 3);
    
    // Main logo text
    svg += `<text x="${WIDTH/2}" y="${logoY}" 
            font-family="Arial Black, sans-serif" 
            font-size="90" 
            fill="${COLORS.neonBlue}"
            text-anchor="middle"
            opacity="${logoOpacity}"
            transform="translate(${WIDTH/2}, ${logoY}) scale(${logoScale}) translate(-${WIDTH/2}, -${logoY})">
            REDCREATIVA
    </text>`;
    
    // PRO badge
    if (localT > 0.4) {
      const badgeLocal = (localT - 0.4) / 0.6;
      const badgeScale = easeOutElastic(Math.min(1, badgeLocal * 2));
      
      svg += `<text x="${WIDTH/2}" y="${logoY + 100}" 
              font-family="Arial Black, sans-serif" 
              font-size="50" 
              fill="${COLORS.neonPurple}"
              text-anchor="middle"
              opacity="${badgeLocal}"
              transform="translate(${WIDTH/2}, ${logoY + 100}) scale(${badgeScale}) translate(-${WIDTH/2}, -${logoY + 100})">
              PRO
      </text>`;
      
      // Glow
      svg += `<text x="${WIDTH/2}" y="${logoY + 100}" 
              font-family="Arial Black, sans-serif" 
              font-size="50" 
              fill="none"
              stroke="${COLORS.neonPurple}"
              stroke-width="2"
              text-anchor="middle"
              opacity="${badgeLocal * 0.5}"
              transform="translate(${WIDTH/2}, ${logoY + 100}) scale(${badgeScale}) translate(-${WIDTH/2}, -${logoY + 100})">
              PRO
      </text>`;
    }
    
    // Tagline
    if (localT > 0.6) {
      const tagLocal = (localT - 0.6) / 0.4;
      const tagY = HEIGHT * 0.75 + (1 - tagLocal) * 30;
      
      svg += `<text x="${WIDTH/2}" y="${tagY}" 
              font-family="Arial, sans-serif" 
              font-size="32" 
              fill="${COLORS.white}"
              text-anchor="middle"
              opacity="${tagLocal * 0.8}">
              Crea Videos Profesionales con IA
      </text>`;
    }
    
    // Animated underline
    if (localT > 0.7) {
      const lineLocal = Math.min(1, (localT - 0.7) / 0.3);
      svg += `<line x1="${WIDTH * 0.3}" y1="${HEIGHT * 0.8}" 
              x2="${WIDTH * 0.3 + (WIDTH * 0.4) * lineLocal}" y2="${HEIGHT * 0.8}" 
              stroke="${COLORS.cyan}"
              stroke-width="4"
              stroke-linecap="round"
              opacity="${lineLocal}"/>`;
    }
  }
  
  // ===== SCENE 3: BENEFITS CARDS (9-16s) =====
  else if (t < scene3End) {
    const localT = (t - scene2End) / (scene3End - scene2End);
    
    // Title
    const titleOpacity = Math.min(1, localT * 4);
    const titleY = HEIGHT * 0.12 - (1 - Math.min(1, localT * 3)) * 20;
    
    svg += `<text x="${WIDTH/2}" y="${titleY}" 
            font-family="Arial Black, sans-serif" 
            font-size="48" 
            fill="${COLORS.white}"
            text-anchor="middle"
            opacity="${titleOpacity}">
            BENEFICIOS
    </text>`;
    
    // Cards with parallax
    const cards = [
      { text: 'Ahorra\nTiempo', y: HEIGHT * 0.28, color: COLORS.neonBlue },
      { text: 'Calidad\nPremium', y: HEIGHT * 0.48, color: COLORS.neonPurple },
      { text: 'Escala\nFacilmente', y: HEIGHT * 0.68, color: COLORS.cyan },
    ];
    
    cards.forEach((card, i) => {
      const cardT = Math.max(0, Math.min(1, (localT - i * 0.15) * 3));
      const slideIn = 1 - easeOutExpo(1 - cardT);
      const xOffset = -200 + slideIn * 250;
      const cardOpacity = Math.min(1, (localT - i * 0.1) * 5);
      
      if (cardOpacity > 0) {
        // Card background
        svg += `<rect x="${WIDTH * 0.1 + xOffset}" y="${card.y}" 
                width="${WIDTH * 0.8}" height="180" 
                rx="20" ry="20"
                fill="rgba(255,255,255,0.05)"
                stroke="${card.color}"
                stroke-width="2"
                opacity="${cardOpacity}"/>`;
        
        // Card icon/emoji
        const icons = ['⏱️', '✨', '📈'];
        svg += `<text x="${WIDTH * 0.2 + xOffset}" y="${card.y + 60}" 
                font-size="50"
                opacity="${cardOpacity}">
                ${icons[i]}
        </text>`;
        
        // Card text
        const lines = card.text.split('\n');
        lines.forEach((line, lineIdx) => {
          svg += `<text x="${WIDTH * 0.2 + xOffset}" y="${card.y + 100 + lineIdx * 45}" 
                  font-family="Arial Black, sans-serif" 
                  font-size="32" 
                  fill="${COLORS.white}"
                  opacity="${cardOpacity}">
                  ${line}
          </text>`;
        });
        
        // Accent dot
        svg += `<circle cx="${WIDTH * 0.85 + xOffset}" cy="${card.y + 90}" r="15" 
                fill="${card.color}"
                opacity="${cardOpacity * 0.8}"/>`;
      }
    });
  }
  
  // ===== SCENE 4: AI EDITOR DEMO (16-21s) =====
  else if (t < scene4End) {
    const localT = (t - scene3End) / (scene4End - scene3End);
    
    // Title
    svg += `<text x="${WIDTH/2}" y="${HEIGHT * 0.12}" 
            font-family="Arial Black, sans-serif" 
            font-size="44" 
            fill="${COLORS.white}"
            text-anchor="middle">
            EDITOR CON IA
    </text>`;
    
    // Editor window
    const editorY = HEIGHT * 0.2;
    svg += `<rect x="${WIDTH * 0.08}" y="${editorY}" 
            width="${WIDTH * 0.84}" height="${HEIGHT * 0.55}" 
            rx="15" ry="15"
            fill="#1a1a2e"
            stroke="#333"
            stroke-width="2"/>`;
    
    // Editor header
    svg += `<rect x="${WIDTH * 0.08}" y="${editorY}" 
            width="${WIDTH * 0.84}" height="50" 
            rx="15" ry="15"
            fill="#2d2d44"/>`;
    svg += `<rect x="${WIDTH * 0.08}" y="${editorY + 35}" 
            width="${WIDTH * 0.84}" height="15" 
            fill="#2d2d44"/>`;
    
    // Window controls
    svg += `<circle cx="${WIDTH * 0.12}" cy="${editorY + 25}" r="8" fill="#ff5f57"/>`;
    svg += `<circle cx="${WIDTH * 0.16}" cy="${editorY + 25}" r="8" fill="#ffbd2e"/>`;
    svg += `<circle cx="${WIDTH * 0.20}" cy="${editorY + 25}" r="8" fill="#28c840"/>`;
    
    // Timeline
    svg += `<rect x="${WIDTH * 0.12}" y="${editorY + 400}" 
            width="${WIDTH * 0.76}" height="80" 
            rx="8" ry="8"
            fill="#16213e"/>`;
    
    // Audio waveform (simulated)
    const waveY = editorY + 440;
    for (let i = 0; i < 50; i++) {
      const h = 10 + Math.sin(i * 0.3 + localT * 10) * 20 + Math.random() * 15;
      const x = WIDTH * 0.12 + (i / 50) * WIDTH * 0.76;
      svg += `<rect x="${x}" y="${waveY - h/2}" width="8" height="${h}" 
              rx="4" ry="4"
              fill="${localT > i/50 ? COLORS.neonBlue : '#333'}"
              opacity="${localT > i/50 ? 0.8 : 0.3}"/>`;
    }
    
    // AI Assistant message
    if (localT > 0.3) {
      const msgLocal = Math.min(1, (localT - 0.3) / 0.7);
      const bubbleY = editorY + 80 + (1 - msgLocal) * 50;
      
      svg += `<rect x="${WIDTH * 0.15}" y="${bubbleY}" 
              width="${WIDTH * 0.6}" height="60" 
              rx="15" ry="15"
              fill="#0f3460"
              opacity="${msgLocal}"/>`;
      
      svg += `<text x="${WIDTH * 0.18}" y="${bubbleY + 38}" 
              font-family="monospace" 
              font-size="20" 
              fill="${COLORS.neonBlue}"
              opacity="${msgLocal}">
              ${localT > 0.5 ? '✨ Video generado!' : 'Generando...'}
      </text>`;
    }
    
    // Progress indicator
    if (localT > 0.4 && localT < 0.9) {
      const prog = (localT - 0.4) / 0.5;
      svg += `<rect x="${WIDTH * 0.3}" y="${HEIGHT * 0.85}" 
              width="${WIDTH * 0.4 * prog}" height="8" 
              rx="4" ry="4"
              fill="url(#progressGrad)"
              opacity="0.9"/>`;
    }
  }
  
  // ===== SCENE 5: CTA (21-25s) =====
  else {
    const localT = (t - scene4End) / (scene5End - scene4End);
    
    // Main CTA text
    const ctaScale = localT < 0.5 ? easeOutElastic(Math.min(1, localT * 2)) : 1;
    const ctaY = HEIGHT * 0.35 + (1 - Math.min(1, localT * 2)) * 30;
    
    svg += `<text x="${WIDTH/2}" y="${ctaY}" 
            font-family="Arial Black, sans-serif" 
            font-size="56" 
            fill="${COLORS.white}"
            text-anchor="middle"
            opacity="${Math.min(1, localT * 3)}"
            transform="translate(${WIDTH/2}, ${ctaY}) scale(${ctaScale}) translate(-${WIDTH/2}, -${ctaY})">
            COMIENZA AHORA
    </text>`;
    
    // Glow
    svg += `<text x="${WIDTH/2}" y="${ctaY}" 
            font-family="Arial Black, sans-serif" 
            font-size="56" 
            fill="none"
            stroke="${COLORS.neonBlue}"
            stroke-width="2"
            text-anchor="middle"
            opacity="${Math.min(1, localT * 3) * 0.4}"
            transform="translate(${WIDTH/2}, ${ctaY}) scale(${ctaScale}) translate(-${WIDTH/2}, -${ctaY})">
            COMIENZA AHORA
    </text>`;
    
    // Website URL
    if (localT > 0.3) {
      const urlLocal = (localT - 0.3) / 0.7;
      const urlY = HEIGHT * 0.55 + (1 - easeOutExpo(urlLocal)) * 20;
      
      svg += `<text x="${WIDTH/2}" y="${urlY}" 
              font-family="monospace" 
              font-size="36" 
              fill="${COLORS.cyan}"
              text-anchor="middle"
              opacity="${urlLocal}">
              redcreativa.pro
      </text>`;
    }
    
    // Call to action button
    if (localT > 0.5) {
      const btnLocal = (localT - 0.5) / 0.5;
      const btnScale = 1 + (1 - easeOutExpo(btnLocal)) * 0.05;
      const btnY = HEIGHT * 0.7;
      
      svg += `<g transform="translate(${WIDTH/2}, ${btnY}) scale(${btnScale}) translate(-${WIDTH/2}, -${btnY})">
        <rect x="${WIDTH/2 - 160}" y="${HEIGHT * 0.7 - 40}" 
              width="320" height="80" 
              rx="40" ry="40"
              fill="url(#btnGrad)"/>
        <text x="${WIDTH/2}" y="${HEIGHT * 0.7 + 15}" 
              font-family="Arial Black, sans-serif" 
              font-size="28" 
              fill="${COLORS.white}"
              text-anchor="middle">
              PRUEBA GRÁTIS
        </text>
      </g>`;
    }
    
    // Logo at bottom
    if (localT > 0.7) {
      const logoLocal = (localT - 0.7) / 0.3;
      svg += `<text x="${WIDTH/2}" y="${HEIGHT * 0.88}" 
              font-family="Arial Black, sans-serif" 
              font-size="40" 
              fill="${COLORS.neonPurple}"
              text-anchor="middle"
              opacity="${logoLocal}">
              REDCREATIVA PRO
      </text>`;
    }
  }
  
  // ===== GLOBAL EFFECTS =====
  
  // Vignette overlay
  svg += `<defs>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="60%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.4)"/>
    </radialGradient>
    <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${COLORS.neonBlue}"/>
      <stop offset="100%" stop-color="${COLORS.neonPurple}"/>
    </linearGradient>
    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${COLORS.neonPurple}"/>
      <stop offset="100%" stop-color="${COLORS.cyan}"/>
    </linearGradient>
  </defs>`;
  
  svg += `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)"/>`;
  
  // Scanlines (subtle)
  svg += `<pattern id="scanlines" patternUnits="userSpaceOnUse" width="4" height="4">
    <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
  </pattern>`;
  svg += `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#scanlines)"/>`;
  
  // Frame number
  svg += `<text x="${WIDTH - 30}" y="${HEIGHT - 30}" 
          font-family="monospace" 
          font-size="16" 
          fill="${COLORS.white}"
          opacity="0.3"
          text-anchor="end">
          ${String(frameNumber).padStart(4, '0')} / ${totalFrames}
  </text>`;
  
  svg += `</svg>`;
  
  return svg;
}

// Render all frames to PNGs using rsvg-convert or直接保存SVG
async function render() {
  const totalFrames = 1500; // 25 seconds at 60fps
  const fps = 60;
  const duration = 25;
  
  console.log(`Starting render: ${duration}s @ ${fps}fps (${totalFrames} frames)`);
  console.log(`Output: ${OUTPUT_PATH}`);
  
  // Create frames directory
  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
  }
  
  // Generate SVG files
  console.log('Generating SVG frames...');
  for (let i = 0; i < totalFrames; i++) {
    const svg = generateFrame(i, totalFrames);
    fs.writeFileSync(path.join(FRAMES_DIR, `frame_${String(i).padStart(4, '0')}.svg`), svg);
    
    if (i % 100 === 0) {
      console.log(`  Generated ${i + 1}/${totalFrames} frames`);
    }
  }
  
  console.log('All SVG frames generated!');
  
  // Check if rsvg-convert is available
  try {
    require('child_process').execSync('which rsvg-convert', { stdio: 'ignore' });
    
    // Convert SVGs to PNG and create video
    console.log('Converting to PNG and creating video with FFmpeg...');
    
    const ffmpegCmd = [
      '-y',
      '-framerate', String(fps),
      '-i', path.join(FRAMES_DIR, 'frame_%04d.svg'),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-crf', '18',
      '-preset', 'fast',
      OUTPUT_PATH
    ];
    
    const ffmpeg = spawn('ffmpeg', ffmpegCmd, { stdio: 'inherit' });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Video rendered: ${OUTPUT_PATH}`);
        
        // Cleanup frames
        fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
        console.log('Cleaned up temporary frames');
      } else {
        console.error('FFmpeg failed with code:', code);
      }
    });
    
  } catch (e) {
    console.log('rsvg-convert or ffmpeg not found.');
    console.log('Generated SVG frames in:', FRAMES_DIR);
    console.log('To create video, run:');
    console.log(`  # Install rsvg-convert:`);
    console.log(`  #   Windows: choco install librsvg`);
    console.log(`  #   Mac: brew install librsvg`);
    console.log(`  #   Linux: sudo apt install librsvg2-bin`);
    console.log(`  # Then convert and encode:`);
    console.log(`  for f in ${FRAMES_DIR}/*.svg; do rsvg-convert -w 1080 -h 1920 "$f" -o "${f%.svg}.png"; done`);
    console.log(`  ffmpeg -y -framerate ${fps} -i ${FRAMES_DIR}/frame_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 ${OUTPUT_PATH}`);
  }
}

render().catch(console.error);
