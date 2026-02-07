import { useCurrentFrame, useVideoConfig, interpolate, Easing, AbsoluteFill, Sequence } from 'remotion';
import { ParticleField } from './ParticleField';
import { springConfig } from '../utils/animations';

// ============================================
// DEMO EDITOR - SIMULACIÓN DE EDITOR DE TEXTO
// ============================================

export function DemoEditor({
  speed = 2,
  text = ['Escribiendo...', 'Más rápido...', '¡IA revolucionaria!'],
  fontFamily = 'Monaco, monospace',
  showCursor = true,
}: {
  speed?: number;
  text?: string[];
  fontFamily?: string;
  showCursor?: boolean;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Calcular qué línea mostrar
  const lineDuration = 60 / speed;
  const totalDuration = text.length * lineDuration;
  const progress = frame / totalDuration;
  
  const currentLineIndex = Math.min(
    Math.floor(frame / lineDuration),
    text.length - 1
  );
  
  const lineProgress = (frame % lineDuration) / lineDuration;
  
  // Efecto de typing
  const charsToShow = Math.floor(lineProgress * text[currentLineIndex].length * speed);
  const visibleText = text[currentLineIndex].slice(0, charsToShow);
  
  // Posición del cursor
  const cursorX = charsToShow * 12; // Aproximadamente 12px por carácter
  
  // Partículas flotando alrededor del texto
  const particlesFrame = frame;
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Editor container */}
      <div
        style={{
          width: Math.min(800, width - 100),
          height: Math.min(500, height - 200),
          background: 'rgba(5, 5, 20, 0.95)',
          borderRadius: 16,
          border: '2px solid #00D4FF',
          boxShadow: `
            0 0 50px #00D4FF30,
            inset 0 0 100px rgba(0, 212, 255, 0.05)
          `,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header del editor */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            background: 'rgba(0, 212, 255, 0.1)',
            borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          }}
        >
          {/* Window controls */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['#FF5F57', '#FFBD2E', '#28CA41'].map((color, i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: color,
                }}
              />
            ))}
          </div>
          
          {/* Title bar */}
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 13,
              fontFamily: 'system-ui',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Red Creativa Pro - Editor IA
          </div>
        </div>
        
        {/* Editor content */}
        <div
          style={{
            padding: 20,
            fontFamily,
            fontSize: 18,
            lineHeight: 1.8,
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          {/* Previous lines (already typed) */}
          {text.slice(0, currentLineIndex).map((line, i) => (
            <div
              key={i}
              style={{
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 8,
              }}
            >
              {line}
            </div>
          ))}
          
          {/* Current line with typing effect */}
          <div style={{ position: 'relative' }}>
            <span>{visibleText}</span>
            
            {/* Cursor */}
            {showCursor && lineProgress < 0.95 && (
              <span
                style={{
                  position: 'absolute',
                  left: cursorX * 9,
                  top: 0,
                  width: 2,
                  height: 24,
                  background: '#00D4FF',
                  animation: 'blink 0.5s infinite',
                  boxShadow: '0 0 10px #00D4FF',
                }}
              />
            )}
          </div>
          
          {/* Ghost text (what's coming) */}
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>
            {text[currentLineIndex].slice(charsToShow)}
          </span>
        </div>
        
        {/* Status bar */}
        <div
          style={{
            position: 'absolute',
          }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 16px',
            background: 'rgba(0, 212, 255, 0.05)',
            borderTop: '1px solid rgba(0, 212, 255, 0.1)',
            fontSize: 12,
            fontFamily: 'system-ui',
            color: 'rgba(255,255,255,0.4)',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <span>Lines: {currentLineIndex + 1}</span>
          <span>Chars: {charsToShow}</span>
          <span style={{ color: '#00D4FF' }}>AI: Active</span>
        </div>
        
        {/* Glow effect from text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at center, rgba(0, 212, 255, 0.05) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      </div>
      
      {/* Particles around editor */}
      <ParticleField
        particleCount={20}
        layers={2}
        colors={['#00D4FF', '#B700FF']}
        orbitRadius={400}
        speed="medium"
      />
    </AbsoluteFill>
  );
}

// ============================================
// TYPING EFFECT SOLO
// ============================================

export function TypingEffect({
  text,
  fontSize = 48,
  fontFamily = 'Montserrat Bold',
  color = '#FFFFFF',
  cursorColor = '#00D4FF',
  speed = 3,
  showCursor = true,
}: {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  cursorColor?: string;
  speed?: number;
  showCursor?: boolean;
}) {
  const frame = useCurrentFrame();
  
  const charsToShow = Math.floor(frame / speed);
  const visibleText = text.slice(0, charsToShow);
  
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ fontSize, fontFamily, color }}>{visibleText}</span>
      {showCursor && charsToShow < text.length && (
        <span
          style={{
            fontSize,
            fontFamily,
            color: cursorColor,
            animation: 'blink 0.5s infinite',
          }}
        >
          |
        </span>
      )}
    </div>
  );
}

// ============================================
// WORD BY WORD REVEAL
// ============================================

export function WordByWordReveal({
  words,
  fontSize = 36,
  fontFamily = 'Montserrat',
  color = '#FFFFFF',
  accentColor = '#00D4FF',
  wordDelay = 15,
  staggerDelay = 3,
}: {
  words: string[];
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  accentColor?: string;
  wordDelay?: number;
  staggerDelay?: number;
}) {
  const frame = useCurrentFrame();
  
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
      {words.map((word, index) => {
        const wordStart = index * (wordDelay + staggerDelay);
        const wordProgress = Math.max(0, Math.min(1, (frame - wordStart) / wordDelay));
        
        return (
          <span
            key={index}
            style={{
              fontSize,
              fontFamily,
              color: wordProgress < 1 ? `${accentColor}50` : color,
              transform: `scale(${wordProgress > 0 && wordProgress < 1 ? 1.2 : 1})`,
              opacity: wordProgress,
              transition: 'transform 0.1s ease-out',
              textShadow: wordProgress >= 1 ? `0 0 20px ${accentColor}` : 'none',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
