import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

// ============================================
// EFECTOS PRE-CALCULADOS
// ============================================

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface FlareConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color: string;
}

export interface EnergyWaveConfig {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  strokeWidth: number;
  color: string;
}

// Generador de explosión de partículas
export function createParticleExplosion(
  centerX: number,
  centerY: number,
  count: number,
  colors: string[],
  intensity: number = 1
): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = (Math.random() * 5 + 3) * intensity;
    
    particles.push({
      x: centerX,
      y: centerY,
      z: Math.random() * 2 - 1,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * 60 + 40,
    });
  }
  
  return particles;
}

// Generador de flare
export function createFlare(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  rotation: number = 0
): FlareConfig {
  return {
    x,
    y,
    width,
    height,
    rotation,
    opacity: 1,
    color,
  };
}

// Generador de onda de energía
export function createEnergyWave(
  x: number,
  y: number,
  maxRadius: number,
  color: string
): EnergyWaveConfig {
  return {
    x,
    y,
    radius: 0,
    maxRadius,
    opacity: 1,
    strokeWidth: 4,
    color,
  };
}

// ============================================
// COMPONENTES DE EFECTOS
// ============================================

// Componente de flare temporal
export function TemporaryFlare({
  x,
  y,
  color,
  duration,
  maxOpacity = 1,
}: {
  x: number;
  y: number;
  color: string;
  duration: number;
  maxOpacity?: number;
}) {
  const frame = useCurrentFrame();
  const progress = frame / duration;
  
  if (progress >= 1) return null;
  
  const opacity = maxOpacity * (1 - progress);
  const scale = 1 + progress * 2;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 100 * scale,
        top: y - 100 * scale,
        width: 200 * scale,
        height: 200 * scale,
        borderRadius: '50%',
        background: `radial-gradient(ellipse at center, ${color}80 0%, ${color}40 30%, transparent 70%)`,
        opacity,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }}
    />
  );
}

// Componente de ráfaga de líneas de velocidad
export function SpeedLines({
  color,
  count = 12,
  intensity = 1,
}: {
  color: string;
  count?: number;
  intensity?: number;
}) {
  const frame = useCurrentFrame();
  
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => {
        const delay = i * 5;
        const lineProgress = Math.max(0, Math.min(1, (frame - delay) / 30));
        
        if (lineProgress === 0 || lineProgress >= 1) return null;
        
        const length = 50 + lineProgress * 200;
        const opacity = (1 - lineProgress) * intensity;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: length,
              height: 2 + Math.random() * 3,
              background: `linear-gradient(to right, transparent, ${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}, transparent)`,
              transform: `translate(-50%, -50%) rotate(${i * (360 / count)}deg) translateY(${-100 - lineProgress * 200}px)`,
            }}
          />
        );
      })}
    </div>
  );
}

// Componente de rings de energía expansivos
export function ExpandingRings({
  color,
  interval = 60,
  maxRings = 5,
}: {
  color: string;
  interval?: number;
  maxRings?: number;
}) {
  const frame = useCurrentFrame();
  
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: maxRings }).map((_, i) => {
        const startFrame = i * interval;
        const ringProgress = Math.max(0, Math.min(1, (frame - startFrame) / 60));
        
        if (ringProgress === 0) return null;
        
        const radius = ringProgress * 800;
        const opacity = 1 - ringProgress;
        const strokeWidth = 4 * (1 - ringProgress * 0.5);
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: radius * 2,
              height: radius * 2,
              borderRadius: '50%',
              border: `${strokeWidth}px solid ${color}`,
              opacity,
              transform: 'translate(-50%, -50%)',
              filter: `blur(${ringProgress * 10}px)`,
            }}
          />
        );
      })}
    </div>
  );
}

// Componente de glitch effect
export function GlitchEffect({
  intensity = 1,
  frequency = 5,
}: {
  intensity?: number;
  frequency?: number;
}) {
  const frame = useCurrentFrame();
  
  if (frame % frequency !== 0) return null;
  
  const offsetX = (Math.random() - 0.5) * 10 * intensity;
  const offsetY = (Math.random() - 0.5) * 5 * intensity;
  
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        filter: `hue-rotate(${Math.random() * 30}deg) saturate(${1 + Math.random() * 0.5})`,
      }}
    />
  );
}

// Componente de texto con tracking animado
export function AnimatedTracking({
  text,
  fontSize,
  color,
  fontFamily,
  startFrame,
  duration,
  trackingRange = 50,
}: {
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  startFrame: number;
  duration: number;
  trackingRange?: number;
}) {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;
  
  const progress = Math.max(0, Math.min(1, relativeFrame / duration));
  
  // Tracking se reduce de 50 a 0
  const tracking = trackingRange * (1 - progress);
  
  return (
    <span
      style={{
        fontSize,
        color,
        fontFamily,
        letterSpacing: `${tracking}px`,
      }}
    >
      {text}
    </span>
  );
}

// Componente de shake screen
export function ScreenShake({
  intensity = 1,
  frequency = 0.2,
}: {
  intensity?: number;
  frequency?: number;
}) {
  const frame = useCurrentFrame();
  
  const offsetX = Math.sin(frame * frequency) * 5 * intensity;
  const offsetY = Math.cos(frame * frequency * 1.3) * 3 * intensity;
  
  return {
    transform: `translate(${offsetX}px, ${offsetY}px)`,
  };
}
