import { useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from 'remotion';

// ============================================
// CAMERA LAYER - MOVIMIENTOS DE CÁMARA SIMULADOS
// ============================================

export function CameraLayer({
  intensity = 0.1,
  shakeFrequency = 0.2,
  zoomRange = [0.98, 1.02],
  panRange = [-10, 10],
  tiltRange = [-5, 5],
  dollySpeed = 0.01,
}: {
  intensity?: number;
  shakeFrequency?: number;
  zoomRange?: [number, number];
  panRange?: [number, number];
  tiltRange?: [number, number];
  dollySpeed?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Zoom suave
  const zoom = interpolate(
    Math.sin(frame * dollySpeed),
    [-1, 1],
    zoomRange,
    { easing: Easing.out(Easing.sine) }
  );
  
  // Pan horizontal
  const panX = interpolate(
    Math.sin(frame * shakeFrequency),
    [-1, 1],
    panRange,
    { easing: Easing.out(Easing.sine) }
  );
  
  // Pan vertical (tilt)
  const panY = interpolate(
    Math.cos(frame * shakeFrequency * 0.7),
    [-1, 1],
    tiltRange,
    { easing: Easing.out(Easing.sine) }
  );
  
  // Shake adicional aleatorio
  const shakeX = (Math.random() - 0.5) * intensity * 5;
  const shakeY = (Math.random() - 0.5) * intensity * 3;
  
  return {
    transform: `
      scale(${zoom})
      translate(${panX + shakeX}px, ${panY + shakeY}px)
    `,
    transformOrigin: 'center center',
  };
}

// ============================================
// HANDHELD CAMERA SHAKE - MOVIMIENTO NATURAL
// ============================================

export function HandheldShake({
  intensity = 1,
  frequency = 0.3,
  decay = 0.99,
}: {
  intensity?: number;
  frequency?: number;
  decay?: number;
}) {
  const frame = useCurrentFrame();
  
  // Simular movimiento de cámara handheld con múltiples capas de ruido
  const noise1 = Math.sin(frame * frequency * 1.7) * Math.cos(frame * frequency * 2.3);
  const noise2 = Math.sin(frame * frequency * 3.1 + 1) * Math.cos(frame * frequency * 1.9 + 2);
  const noise3 = Math.sin(frame * frequency * 0.7) * Math.cos(frame * frequency * 1.1 + 3);
  
  const totalIntensity = intensity * Math.pow(decay, frame * 0.01);
  
  const translateX = (noise1 + noise2 * 0.5) * 10 * totalIntensity;
  const translateY = (noise2 + noise3 * 0.5) * 8 * totalIntensity;
  const rotate = (noise1 - noise3) * 0.5 * totalIntensity;
  
  return {
    transform: `
      translate(${translateX}px, ${translateY}px)
      rotate(${rotate}deg)
    `,
    transformOrigin: 'center center',
  };
}

// ============================================
// DOLLY ZOOM - EFECTO HITCHCOCK
// ============================================

export function DollyZoom({
  zoomInDuration = 120,
  zoomOutDuration = 120,
  holdDuration = 60,
  zoomRange = [1, 1.5],
}: {
  zoomInDuration?: number;
  zoomOutDuration?: number;
  holdDuration?: number;
  zoomRange?: [number, number];
}) {
  const frame = useCurrentFrame();
  const totalDuration = zoomInDuration + holdDuration + zoomOutDuration;
  
  const progress = frame / totalDuration;
  
  let zoom: number;
  let fieldOfView: number;
  
  if (progress < zoomInDuration / totalDuration) {
    const inProgress = progress / (zoomInDuration / totalDuration);
    zoom = interpolate(inProgress, [0, 1], zoomRange, { easing: Easing.inOut(Easing.sine) });
    fieldOfView = interpolate(inProgress, [0, 1], [60, 30]);
  } else if (progress < (zoomInDuration + holdDuration) / totalDuration) {
    zoom = zoomRange[1];
    fieldOfView = 30;
  } else {
    const outProgress = (progress - (zoomInDuration + holdDuration) / totalDuration) / (zoomOutDuration / totalDuration);
    zoom = interpolate(outProgress, [1, 0], zoomRange, { easing: Easing.inOut(Easing.sine) });
    fieldOfView = interpolate(outProgress, [0, 1], [30, 60]);
  }
  
  return {
    transform: `scale(${zoom})`,
    perspective: `${fieldOfView}px`,
  };
}

// ============================================
// PARALLAX EFFECT - PARALLAX ENTRE CAPAS
// ============================================

export function ParallaxLayer({
  depth = 0.5,
  direction = 'horizontal',
  amplitude = 50,
  speed = 0.02,
}: {
  depth?: number;
  direction?: 'horizontal' | 'vertical' | 'circular';
  amplitude?: number;
  speed?: number;
}) {
  const frame = useCurrentFrame();
  
  const multiplier = depth * amplitude;
  
  let translateX = 0;
  let translateY = 0;
  
  switch (direction) {
    case 'horizontal':
      translateX = Math.sin(frame * speed) * multiplier;
      break;
    case 'vertical':
      translateY = Math.cos(frame * speed) * multiplier;
      break;
    case 'circular':
      translateX = Math.sin(frame * speed) * multiplier;
      translateY = Math.cos(frame * speed * 0.7) * multiplier;
      break;
  }
  
  return {
    transform: `translate(${translateX}px, ${translateY}px)`,
  };
}

// ============================================
// TILT EFFECT - INCLINACIÓN 3D
// ============================================

export function TiltEffect({
  mouseX = 0.5,
  mouseY = 0.5,
  maxRotation = 15,
  perspective = 1000,
}: {
  mouseX?: number;
  mouseY?: number;
  maxRotation?: number;
  perspective?: number;
}) {
  // Calcular rotación basada en posición
  const rotateX = (mouseY - 0.5) * maxRotation;
  const rotateY = (0.5 - mouseX) * maxRotation;
  
  return {
    transform: `
      perspective(${perspective}px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `,
    transformStyle: 'preserve-3d',
  };
}

// ============================================
// SWEEP PAN - MOVIMIENTO DE BARRIDO
// ============================================

export function SweepPan({
  from = 'left',
  to = 'right',
  duration = 60,
}: {
  from?: 'left' | 'right' | 'top' | 'bottom';
  to?: 'left' | 'right' | 'top' | 'bottom';
  duration?: number;
}) {
  const frame = useCurrentFrame();
  
  const progress = Math.min(1, frame / duration);
  
  let startX = 0, startY = 0;
  let endX = 0, endY = 0;
  
  switch (from) {
    case 'left':
      startX = -100; break;
    case 'right':
      startX = 100; break;
    case 'top':
      startY = -100; break;
    case 'bottom':
      startY = 100; break;
  }
  
  switch (to) {
    case 'left':
      endX = -100; break;
    case 'right':
      endX = 100; break;
    case 'top':
      endY = -100; break;
    case 'bottom':
      endY = 100; break;
  }
  
  const currentX = interpolate(progress, [0, 1], [startX, endX]);
  const currentY = interpolate(progress, [0, 1], [startY, endY]);
  
  return {
    transform: `translate(${currentX}%, ${currentY}%)`,
  };
}
