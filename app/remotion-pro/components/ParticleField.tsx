import { 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate, 
  Easing,
  AbsoluteFill,
  Sequence,
} from 'remotion';
import { useMemo, useRef, useEffect, useState } from 'react';
import { ParticleConfig } from '../utils/animations';

// ============================================
// PARTICLE FIELD - CAMPO DE PARTÍCULAS PROFESIONAL
// ============================================
// Características:
// - 3-4 capas simultáneas
// - Partículas cerca de cámara (rápidas)
// - Partículas en fondo (lentas)
// - Explosiones ocasionales
// - Movimientos orbitales
// - Flujo continuo

const PARTICLE_COLORS = {
  neonBlue: '#00D4FF',
  neonPurple: '#B700FF',
  cyan: '#00FFFF',
  white: '#FFFFFF',
  accent1: '#FF0066',
  accent2: '#FF9900',
};

export function ParticleField({
  particleCount = 50,
  layers = 3,
  colors = [PARTICLE_COLORS.neonBlue, PARTICLE_COLORS.neonPurple, PARTICLE_COLORS.cyan],
  speed = 'medium',
  orbitRadius,
  orbitDirection = 'clockwise',
  explosionIntensity = 1,
  flowDirection = 'upward',
}: ParticleConfig) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Velocidad base según configuración
  const speedMultiplier = {
    slow: 0.3,
    medium: 1,
    fast: 2,
    explosive: 4,
    flowing: 1.5,
  }[speed];
  
  // Generar partículas por capa
  const particlesByLayer = useMemo(() => {
    const layersArray: Particle[][] = [];
    
    for (let l = 0; l < layers; l++) {
      const layerParticles: Particle[] = [];
      const layerSpeed = speedMultiplier * (layers - l) / layers;
      const layerDepth = l / layers; // 0 = cerca, 1 = lejos
      
      for (let i = 0; i < Math.ceil(particleCount / layers); i++) {
        const color = colors[l % colors.length];
        const baseX = Math.random() * width;
        const baseY = Math.random() * height;
        
        layerParticles.push({
          id: `${l}-${i}`,
          x: baseX,
          y: baseY,
          z: 0.5 + Math.random() * 0.5 + (1 - layerDepth) * 0.5,
          size: (2 + Math.random() * 4) * (1 - layerDepth * 0.5),
          color,
          opacity: 0.3 + Math.random() * 0.7 * (1 - layerDepth),
          velocityX: (Math.random() - 0.5) * layerSpeed * 2,
          velocityY: (Math.random() - 0.5) * layerSpeed * 2,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.5 + Math.random() * 2,
        });
      }
      
      layersArray.push(layerParticles);
    }
    
    return layersArray;
  }, [particleCount, layers, colors, width, height, speedMultiplier]);
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      {particlesByLayer.map((layerParticles, layerIndex) => (
        <ParticleLayer
          key={layerIndex}
          particles={layerParticles}
          frame={frame}
          width={width}
          height={height}
          orbitRadius={orbitRadius}
          orbitDirection={orbitDirection}
          flowDirection={flowDirection}
          explosionIntensity={explosionIntensity}
        />
      ))}
    </AbsoluteFill>
  );
}

interface Particle {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  opacity: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  pulsePhase: number;
  pulseSpeed: number;
}

function ParticleLayer({
  particles,
  frame,
  width,
  height,
  orbitRadius,
  orbitDirection,
  flowDirection,
  explosionIntensity,
}: {
  particles: Particle[];
  frame: number;
  width: number;
  height: number;
  orbitRadius?: number;
  orbitDirection: string;
  flowDirection: string;
  explosionIntensity: number;
}) {
  return (
    <>
      {particles.map((particle) => {
        // Calcular posición basada en el tiempo
        let x = particle.x;
        let y = particle.y;
        let size = particle.size;
        let opacity = particle.opacity;
        
        // Movimiento orbital si está configurado
        if (orbitRadius) {
          const angle = (frame * 0.02 * (orbitDirection === 'clockwise' ? 1 : -1) + particles.indexOf(particle) * 0.5);
          x = width / 2 + Math.cos(angle) * orbitRadius * particle.z;
          y = height / 2 + Math.sin(angle) * orbitRadius * particle.z;
        } else {
          // Movimiento normal
          x = (particle.x + frame * particle.velocityX) % (width + 100) - 50;
          y = (particle.y + frame * particle.velocityY) % (height + 100) - 50;
          
          // Flujo direccional
          if (flowDirection === 'upward') {
            y = ((particle.y - frame * 2 * particle.z) % (height + 100) + height + 100) % (height + 100) - 50;
          } else if (flowDirection === 'outward') {
            const centerX = width / 2;
            const centerY = height / 2;
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const expansion = Math.min(1, frame * 0.01 * particle.z);
            x = centerX + dx * (1 + expansion);
            y = centerY + dy * (1 + expansion);
          }
        }
        
        // Pulso de tamaño
        const pulse = 1 + Math.sin(frame * particle.pulseSpeed + particle.pulsePhase) * 0.2;
        size *= pulse;
        
        // Efecto de profundidad (parallax)
        const parallaxOffset = Math.sin(frame * 0.01 + particle.id.length) * 20 * (1 - particle.z);
        y += parallaxOffset;
        
        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: particle.color,
              opacity,
              transform: `rotate(${particle.rotation + frame * particle.rotationSpeed}deg)`,
              boxShadow: `0 0 ${size * 2}px ${particle.color}, 0 0 ${size * 4}px ${particle.color}40`,
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </>
  );
}

// ============================================
// PARTICLE EXPLOSION - EXPLOSIÓN DE PARTÍCULAS
// ============================================

export function ParticleExplosion({
  centerX,
  centerY,
  particleCount = 100,
  colors = [PARTICLE_COLORS.neonBlue, PARTICLE_COLORS.neonPurple, PARTICLE_COLORS.cyan, PARTICLE_COLORS.white],
  duration = 60,
  intensity = 1,
}: {
  centerX?: number;
  centerY?: number;
  particleCount?: number;
  colors?: string[];
  duration?: number;
  intensity?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  const progress = Math.min(1, frame / duration);
  
  if (progress >= 1) return null;
  
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = (Math.random() * 8 + 4) * intensity * (1 - progress);
      
      return {
        x: centerX ?? width / 2,
        y: centerY ?? height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 2,
        color: colors[i % colors.length],
        rotation: Math.random() * 360,
        trail: Array.from({ length: 5 }).map((_, t) => ({
          x: 0,
          y: 0,
          opacity: (1 - t / 5) * (1 - progress),
        })),
      };
    });
  }, [centerX, centerY, width, height, particleCount, colors, intensity, progress]);
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((particle, i) => {
        const x = particle.x + particle.vx * frame;
        const y = particle.y + particle.vy * frame;
        const opacity = (1 - progress) * 0.8;
        
        return (
          <div key={i}>
            {/* Main particle */}
            <div
              style={{
                position: 'absolute',
                left: x - particle.size / 2,
                top: y - particle.size / 2,
                width: particle.size,
                height: particle.size * 3,
                borderRadius: '50%',
                background: particle.color,
                opacity,
                transform: `rotate(${particle.rotation})`,
                boxShadow: `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${particle.size * 6}px ${particle.color}80`,
              }}
            />
            
            {/* Trail effect */}
            {Array.from({ length: Math.min(5, Math.floor(frame / 2)) }).map((_, t) => {
              const trailX = x - particle.vx * (t + 1) * 2;
              const trailY = y - particle.vy * (t + 1) * 2;
              const trailOpacity = opacity * (1 - t / 5) * 0.5;
              
              return (
                <div
                  key={`trail-${t}`}
                  style={{
                    position: 'absolute',
                    left: trailX - particle.size / 2,
                    top: trailY - particle.size / 2,
                    width: particle.size,
                    height: particle.size,
                    borderRadius: '50%',
                    background: particle.color,
                    opacity: trailOpacity,
                    filter: 'blur(2px)',
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// ============================================
// STREAMING PARTICLES - FLUJO DE PARTÍCULAS
// ============================================

export function StreamingParticles({
  colors = [PARTICLE_COLORS.neonBlue, PARTICLE_COLORS.neonPurple],
  count = 30,
  speed = 3,
  direction = 'left-to-right',
}: {
  colors?: string[];
  count?: number;
  speed?: number;
  direction?: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      color: colors[i % colors.length],
      length: Math.random() * 50 + 20,
      speed: speed * (0.5 + Math.random() * 0.5),
      delay: i * 5,
    }));
  }, [count, colors, width, height, speed]);
  
  const getPosition = (p: typeof particles[0]) => {
    const offset = (frame - p.delay) * p.speed;
    
    switch (direction) {
      case 'left-to-right':
        return { x: ((p.x + offset) % (width + p.length)) - p.length, y: p.y };
      case 'right-to-left':
        return { x: ((p.x - offset) % (width + p.length) + width + p.length) % (width + p.length) - p.length, y: p.y };
      case 'top-to-bottom':
        return { x: p.x, y: ((p.y + offset) % (height + p.length)) - p.length };
      case 'bottom-to-top':
        return { x: p.x, y: ((p.y - offset) % (height + p.length) + height + p.length) % (height + p.length) - p.length };
      default:
        return { x: p.x, y: p.y };
    }
  };
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p, i) => {
        if (frame < p.delay) return null;
        
        const { x, y } = getPosition(p);
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: direction.includes('to-') ? 2 : p.length,
              height: direction.includes('to-') ? p.length : 2,
              background: `linear-gradient(${direction === 'left-to-right' ? 'to right' : direction === 'right-to-left' ? 'to left' : direction === 'top-to-bottom' ? 'to bottom' : 'to top'}, transparent, ${p.color}, ${p.color}, transparent)`,
              opacity: 0.6,
              filter: 'blur(2px)',
              transform: `rotate(${direction === 'left-to-right' ? 0 : direction === 'right-to-left' ? 180 : direction === 'top-to-bottom' ? 90 : -90}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}
