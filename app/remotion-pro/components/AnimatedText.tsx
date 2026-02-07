import { 
  useCurrentFrame, 
  useVideoConfig, 
  spring, 
  interpolate, 
  Easing,
  AbsoluteFill,
  Sequence,
} from 'remotion';
import { useMemo, useRef, useEffect } from 'react';
import { springConfig, easingCurves, AnimatedTextProps } from '../utils/animations';

// ============================================
// ANIMATED TEXT - TEXTO MULTICAPA PROFESIONAL
// ============================================
// Características:
// - Revelado letra por letra con delay
// - Reveal stroke + inner fill
// - Glow externo intenso
// - Motion blur simulado
// - Sombra proyectada
// - Tracking/kerning animado

export function AnimatedText({
  text,
  type = 'reveal',
  animationStyle = 'letterByLetter',
  accentColor,
  fontSize,
  fontFamily,
  duration = 60,
  delayBetweenLines = 30,
  letterDelay = 5,
  glowIntensity = 1,
  motionBlur = false,
  speedLines = false,
  rotationSpeed = 0,
}: AnimatedTextProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Calcular timing basado en el tipo de animación
  const totalDuration = duration + (text.length - 1) * delayBetweenLines;
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {text.map((line, lineIndex) => {
        const lineStartFrame = lineIndex * delayBetweenLines;
        const lineFrame = frame - lineStartFrame;
        
        return (
          <Sequence
            key={lineIndex}
            name={`Line ${lineIndex}`}
            from={lineStartFrame}
            durationInFrames={duration}
          >
            <LineAnimator
              text={line}
              type={type}
              animationStyle={animationStyle}
              accentColor={accentColor}
              fontSize={fontSize}
              fontFamily={fontFamily}
              frame={lineFrame}
              duration={duration}
              letterDelay={letterDelay}
              glowIntensity={glowIntensity}
              motionBlur={motionBlur}
              speedLines={speedLines}
              rotationSpeed={rotationSpeed}
            />
          </Sequence>
        );
      })}
    </div>
  );
}

function LineAnimator({
  text,
  type,
  animationStyle,
  accentColor,
  fontSize,
  fontFamily,
  frame,
  duration,
  letterDelay,
  glowIntensity,
  motionBlur,
  rotationSpeed,
}: {
  text: string;
  type: string;
  animationStyle: string;
  accentColor: string;
  fontSize: number;
  fontFamily: string;
  frame: number;
  duration: number;
  letterDelay: number;
  glowIntensity: number;
  motionBlur: boolean;
  rotationSpeed: number;
}) {
  const progress = Math.max(0, Math.min(1, frame / duration));
  
  // Dividir texto en caracteres para animación individual
  const chars = Array.from(text);
  
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: letterDelay > 0 ? 4 : 0,
      }}
    >
      {chars.map((char, charIndex) => {
        const charProgress = Math.max(0, Math.min(1, (frame - charIndex * letterDelay) / (duration / chars.length)));
        
        // Diferentes tipos de animación por carácter
        const charAnimation = getCharAnimation(
          type,
          animationStyle,
          charProgress,
          accentColor,
          charIndex,
          chars.length,
          rotationSpeed
        );
        
        return (
          <CharComponent
            key={charIndex}
            char={char === ' ' ? '\u00A0' : char}
            animation={charAnimation}
            fontSize={fontSize}
            fontFamily={fontFamily}
            motionBlur={motionBlur}
          />
        );
      })}
      
      {/* Speed lines si está habilitado */}
      {speedLines && progress > 0 && progress < 1 && (
        <SpeedLines color={accentColor} count={8} intensity={0.5} />
      )}
    </div>
  );
}

function getCharAnimation(
  type: string,
  style: string,
  progress: number,
  accentColor: string,
  index: number,
  total: number,
  rotationSpeed: number
) {
  // Animación base según tipo
  let baseAnimation: CharAnimation = {
    opacity: progress,
    scale: 1,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    rotation: 0,
    blur: motionBlur ? progress * 2 : 0,
    strokeProgress: progress,
  };
  
  // Aplicar estilos específicos
  switch (style) {
    case 'letterByLetter':
      baseAnimation = {
        ...baseAnimation,
        translateY: (1 - progress) * 50,
        scale: 0.8 + progress * 0.2,
      };
      break;
      
    case 'stagger':
      const staggerDelay = index / total;
      const staggerProgress = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
      baseAnimation = {
        ...baseAnimation,
        translateY: (1 - staggerProgress) * 30,
        opacity: staggerProgress,
      };
      break;
      
    case 'wave':
      baseAnimation = {
        ...baseAnimation,
        translateY: Math.sin(progress * Math.PI * 2 + (index / total) * Math.PI * 2) * 10,
        rotation: Math.sin(progress * Math.PI + (index / total) * Math.PI) * 5,
      };
      break;
      
    case 'typewriter':
      baseAnimation = {
        ...baseAnimation,
        opacity: Math.floor(progress * total) >= index ? 1 : 0,
        translateX: (1 - Math.floor(progress * total) / index) * 20,
      };
      break;
      
    case 'slide':
      baseAnimation = {
        ...baseAnimation,
        translateX: (1 - progress) * 100,
        opacity: progress,
      };
      break;
  }
  
  // Aplicar tipo de reveal
  switch (type) {
    case 'reveal':
      baseAnimation.strokeProgress = progress;
      break;
    case 'pulse':
      const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
      baseAnimation.scale *= pulse;
      break;
    case 'rotate':
      baseAnimation.rotation += progress * 360 * rotationSpeed;
      break;
    case 'fade':
      baseAnimation.opacity = progress;
      break;
  }
  
  return baseAnimation;
}

interface CharAnimation {
  opacity: number;
  scale: number;
  translateX: number;
  translateY: number;
  skewX: number;
  rotation: number;
  blur: number;
  strokeProgress: number;
}

function CharComponent({
  char,
  animation,
  fontSize,
  fontFamily,
  motionBlur,
}: {
  char: string;
  animation: CharAnimation;
  fontSize: number;
  fontFamily: string;
  motionBlur: boolean;
}) {
  if (animation.opacity <= 0) return null;
  
  return (
    <div
      style={{
        display: 'inline-block',
        position: 'relative',
        opacity: animation.opacity,
        transform: `
          translate(${animation.translateX}px, ${animation.translateY}px)
          scale(${animation.scale})
          rotate(${animation.rotation}deg)
          skewX(${animation.skewX}deg)
        `,
        filter: animation.blur > 0 ? `blur(${animation.blur}px)` : undefined,
        fontSize,
        fontFamily,
        color: '#FFFFFF',
        // Stroke reveal
        WebkitTextStroke: animation.strokeProgress < 1 
          ? `2px ${'#00D4FF'}`
          : undefined,
      }}
    >
      {/* Glow layer */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          color: '#00D4FF',
          opacity: animation.strokeProgress * 0.5,
          filter: 'blur(8px)',
          zIndex: -1,
        }}
      >
        {char}
      </span>
      
      {/* Main text */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {char}
      </span>
      
      {/* Inner shadow */}
      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'rgba(0,0,0,0.5)',
          fontSize,
          fontFamily,
          opacity: animation.strokeProgress * 0.3,
          pointerEvents: 'none',
        }}
      >
        {char}
      </span>
    </div>
  );
}

// ============================================
// TEXTO CON GLOW NEÓN PROFESIONAL
// ============================================

export function NeonText({
  text,
  fontSize,
  fontFamily,
  primaryColor,
  glowColor,
  glowIntensity = 1,
  pulseSpeed = 1,
}: {
  text: string;
  fontSize: number;
  fontFamily: string;
  primaryColor: string;
  glowColor: string;
  glowIntensity?: number;
  pulseSpeed?: number;
}) {
  const frame = useCurrentFrame();
  const pulse = 0.5 + Math.sin(frame * 0.05 * pulseSpeed) * 0.5;
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Outer glow */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize,
          fontFamily,
          color: glowColor,
          opacity: 0.8 * glowIntensity * pulse,
          filter: `blur(${20 * glowIntensity}px)`,
          whiteSpace: 'pre',
        }}
      >
        {text}
      </div>
      
      {/* Middle glow */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize,
          fontFamily,
          color: glowColor,
          opacity: 0.6 * glowIntensity * pulse,
          filter: `blur(${10 * glowIntensity}px)`,
          whiteSpace: 'pre',
        }}
      >
        {text}
      </div>
      
      {/* Inner glow */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize,
          fontFamily,
          color: glowColor,
          opacity: 0.4 * glowIntensity * pulse,
          filter: `blur(${4 * glowIntensity}px)`,
          whiteSpace: 'pre',
        }}
      >
        {text}
      </div>
      
      {/* Main text */}
      <div
        style={{
          position: 'relative',
          fontSize,
          fontFamily,
          color: primaryColor,
          whiteSpace: 'pre',
          textShadow: `
            0 0 10px ${glowColor}80,
            0 0 20px ${glowColor}60,
            0 0 40px ${glowColor}40
          `,
        }}
      >
        {text}
      </div>
    </div>
  );
}
