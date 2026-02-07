import { useCurrentFrame, useVideoConfig, interpolate, Easing, AbsoluteFill, Sequence } from 'remotion';
import { ParticleExplosion } from './ParticleField';
import { springConfig } from '../utils/animations';

// ============================================
// TRANSICIONES EXPLOSIVAS
// ============================================

export function ExplosiveTransition({
  type = 'radial',
  color = '#00D4FF',
  intensity = 1,
  duration = 60,
}: {
  type?: 'radial' | 'wipe' | 'burst' | 'tunnel' | 'zoom';
  color?: string;
  intensity?: number;
  duration?: number;
}) {
  const frame = useCurrentFrame();
  
  if (frame >= duration) return null;
  
  const progress = frame / duration;
  const easedProgress = Easing.out(Easing.cubic)(progress);
  
  switch (type) {
    case 'radial':
      return <RadialExplosion progress={easedProgress} color={color} intensity={intensity} />;
    case 'wipe':
      return <WipeTransition progress={easedProgress} color={color} />;
    case 'burst':
      return <BurstTransition progress={easedProgress} color={color} intensity={intensity} />;
    case 'tunnel':
      return <TunnelTransition progress={easedProgress} color={color} intensity={intensity} />;
    case 'zoom':
      return <ZoomTransition progress={easedProgress} color={color} intensity={intensity} />;
    default:
      return <RadialExplosion progress={easedProgress} color={color} intensity={intensity} />;
  }
}

function RadialExplosion({
  progress,
  color,
  intensity = 1,
}: {
  progress: number;
  color: string;
  intensity?: number;
}) {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Expanding ring */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: progress * 2000,
          height: progress * 2000,
          borderRadius: '50%',
          border: `${Math.max(2, 50 * (1 - progress))}px solid ${color}`,
          opacity: 1 - progress,
          transform: 'translate(-50%, -50%)',
          filter: `blur(${progress * 20}px)`,
        }}
      />
      
      {/* Central flash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, ${color}${Math.floor(100 * (1 - progress))} 0%, transparent 70%)`,
          opacity: 1 - progress,
        }}
      />
      
      {/* Particle burst */}
      <ParticleExplosion
        particleCount={80 * intensity}
        colors={[color, '#FFFFFF', color]}
        duration={duration}
      />
    </AbsoluteFill>
  );
}

function WipeTransition({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: `${progress * 100}%`,
        background: `linear-gradient(180deg, ${color}ff 0%, ${color}40 50%, transparent 100%)`,
        transform: 'translateY(-100%)',
        animation: `wipeIn ${progress}s ease-out forwards`,
      }}
    />
  );
}

function BurstTransition({
  progress,
  color,
  intensity = 1,
}: {
  progress: number;
  color: string;
  intensity?: number;
}) {
  const spikes = 12;
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: spikes }).map((_, i) => {
        const angle = (360 / spikes) * i;
        const length = 100 + progress * 1000 * intensity;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 4 + progress * 20,
              height: length,
              background: `linear-gradient(to top, ${color}${Math.floor(100 * (1 - progress))}, transparent)`,
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
              opacity: 1 - progress,
              filter: `blur(${progress * 10}px)`,
            }}
          />
        );
      })}
      
      <ParticleExplosion particleCount={60 * intensity} colors={[color, '#FFFFFF']} duration={60} />
    </AbsoluteFill>
  );
}

function TunnelTransition({
  progress,
  color,
  intensity = 1,
}: {
  progress: number;
  color: string;
  intensity?: number;
}) {
  const rings = 8;
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: rings }).map((_, i) => {
        const ringProgress = Math.max(0, Math.min(1, (progress - i * 0.1) / (1 - i * 0.1)));
        const radius = ringProgress * 800 * intensity;
        const opacity = 1 - ringProgress;
        
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
              border: `${Math.max(1, 8 * (1 - ringProgress))}px solid ${color}`,
              opacity,
              transform: 'translate(-50%, -50%)',
              filter: `blur(${ringProgress * 15}px)`,
            }}
          />
        );
      })}
      
      {/* Particles flowing outward */}
      <ParticleExplosion
        particleCount={40 * intensity}
        colors={[color, '#FFFFFF', color]}
        duration={60}
      />
    </AbsoluteFill>
  );
}

function ZoomTransition({
  progress,
  color,
  intensity = 1,
}: {
  progress: number;
  color: string;
  intensity?: number;
}) {
  return (
    <AbsoluteFill>
      {/* Zoom through effect */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: (1 - progress) * 200,
          height: (1 - progress) * 200,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${color}${Math.floor(100 * (1 - progress))} 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
          filter: `blur(${progress * 30}px)`,
        }}
      />
      
      {/* Vignette closing in */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent ${progress * 150}%, ${color}${Math.floor(80 * (1 - progress))} ${progress * 200}%)`,
          opacity: 1 - progress,
        }}
      />
      
      <ParticleExplosion particleCount={50 * intensity} colors={[color, '#FFFFFF']} duration={60} />
    </AbsoluteFill>
  );
}

// ============================================
// TRANSICIONES PREDEFINIDAS
// ============================================

export function FlashTransition() {
  return (
    <Sequence from={0} durationInFrames={15}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'white',
          opacity: 1,
        }}
      />
    </Sequence>
  );
}

export function SlideInTransition({
  from = 'bottom',
  color = '#000000',
}: {
  from?: 'top' | 'bottom' | 'left' | 'right';
  color?: string;
}) {
  const frame = useCurrentFrame();
  
  const offset = 100;
  let transform = 'translateY(0)';
  
  switch (from) {
    case 'top':
      transform = `translateY(${(1 - frame / 30) * -offset}px)`;
      break;
    case 'bottom':
      transform = `translateY(${(1 - frame / 30) * offset}px)`;
      break;
    case 'left':
      transform = `translateX(${(1 - frame / 30) * -offset}px)`;
      break;
    case 'right':
      transform = `translateX(${(1 - frame / 30) * offset}px)`;
      break;
  }
  
  if (frame >= 30) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: color,
        transform,
        transition: 'transform 0.03s linear',
      }}
    />
  );
}
