import { 
  useCurrentFrame, 
  useVideoConfig, 
  spring, 
  interpolate, 
  Easing,
  AbsoluteFill,
  Sequence,
} from 'remotion';
import { useMemo } from 'react';

// ============================================
// CONFIGURACIÓN DE SPRINGS PREMIUM
// ============================================
export const springConfig = {
  gentle: { damping: 30, stiffness: 80, mass: 1 },
  bouncy: { damping: 15, stiffness: 120, mass: 1 },
  snappy: { damping: 18, stiffness: 150, mass: 0.8 },
  smooth: { damping: 25, stiffness: 100, mass: 1.2 },
  explosive: { damping: 12, stiffness: 180, mass: 0.6 },
};

// Curvas de easing personalizadas
export const easingCurves = {
  easeOutBack: (x: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
  easeInOutExpo: (x: number) => {
    return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 
      ? Math.pow(2, 20 * x - 10) / 2 
      : (2 - Math.pow(2, -20 * x + 10)) / 2;
  },
  smoothStep: (x: number) => {
    return x * x * (3 - 2 * x);
  },
  elasticOut: (x: number) => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  },
};

// Hook para springs con configuración
export function useSpring(
  fps: number,
  frame: number,
  config: { damping: number; stiffness: number; mass?: number } = springConfig.smooth
) {
  return spring({ fps, frame, config });
}

// Hook para interpolaciones con easing personalizado
export function useEase(
  frame: number,
  from: number,
  to: number,
  easing: (x: number) => number = easingCurves.smoothStep
) {
  const progress = frame; // frames individuales
  const easedProgress = easing(Math.min(1, Math.max(0, progress)));
  return from + (to - from) * easedProgress;
}

// ============================================
// PROPS COMPARTIDOS
// ============================================

export interface AnimatedTextProps {
  text: string[];
  type: 'reveal' | 'pulse' | 'rotate' | 'fade' | 'typewriter';
  animationStyle: 'letterByLetter' | 'stagger' | 'wave' | 'typewriter' | 'slide';
  accentColor: string;
  fontSize: number;
  fontFamily: string;
  duration: number;
  delayBetweenLines?: number;
  letterDelay?: number;
  glowIntensity?: number;
  motionBlur?: boolean;
  speedLines?: boolean;
  rotationSpeed?: number;
}

export interface ParticleConfig {
  particleCount: number;
  layers: number;
  colors: string[];
  speed: 'slow' | 'medium' | 'fast' | 'explosive' | 'flowing';
  orbitRadius?: number;
  orbitDirection?: 'clockwise' | 'counter-clockwise';
  explosionIntensity?: number;
  flowDirection?: 'outward' | 'inward' | 'upward';
}

export interface CameraConfig {
  intensity: number;
  shakeFrequency: number;
  zoomRange: [number, number];
  panRange: [number, number];
  tiltRange?: [number, number];
}

export interface TransitionConfig {
  type: 'radial' | 'wipe' | 'burst' | 'tunnel' | 'zoom';
  color: string;
  intensity: number;
  duration: number;
}

export interface CardConfig {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  entranceType: 'spring' | 'slide' | 'fade';
  exitType: 'dissolve' | 'slide' | 'explode';
}
