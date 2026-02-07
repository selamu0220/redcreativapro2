import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing, AbsoluteFill, Sequence } from 'remotion';
import { AnimatedText } from './AnimatedText';
import { NeonGlow } from './NeonGlow';
import { springConfig } from '../utils/animations';

// ============================================
// DYNAMIC CARD - TARJETAS DINÁMICAS CON ENTRADA/SALIDA
// ============================================

export function DynamicCard({
  title,
  subtitle,
  icon,
  color,
  position = 'center',
  entranceType = 'spring',
  exitType = 'dissolve',
}: {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  entranceType?: 'spring' | 'slide' | 'fade';
  exitType?: 'dissolve' | 'slide' | 'explode';
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Posición base
  const positionMap = {
    'top-left': { x: 100, y: 200 },
    'top-right': { x: width - 500, y: 200 },
    'bottom-left': { x: 100, y: height - 500 },
    'bottom-right': { x: width - 500, y: height - 500 },
    'center': { x: (width - 500) / 2, y: (height - 400) / 2 },
  };
  
  const basePos = positionMap[position];
  
  // Animación de entrada
  let entranceAnimation: { x: number; y: number; scale: number; opacity: number };
  
  switch (entranceType) {
    case 'spring':
      const scaleSpring = spring({
        fps: 60,
        frame,
        config: { damping: 15, stiffness: 120 },
      });
      entranceAnimation = {
        x: basePos.x + (1 - scaleSpring) * 200,
        y: basePos.y + (1 - scaleSpring) * 100,
        scale: scaleSpring,
        opacity: scaleSpring,
      };
      break;
    case 'slide':
      const slideProgress = interpolate(frame, [0, 30], [0, 1], { easing: Easing.out(Easing.cubic) });
      entranceAnimation = {
        x: basePos.x - 300 * (1 - slideProgress),
        y: basePos.y,
        scale: slideProgress,
        opacity: slideProgress,
      };
      break;
    case 'fade':
      const fadeProgress = interpolate(frame, [0, 20], [0, 1]);
      entranceAnimation = {
        x: basePos.x,
        y: basePos.y,
        scale: fadeProgress,
        opacity: fadeProgress,
      };
      break;
    default:
      entranceAnimation = { x: basePos.x, y: basePos.y, scale: 1, opacity: 1 };
  }
  
  // Animación de salida
  const exitProgress = interpolate(frame, [120, 150], [0, 1]);
  
  let exitAnimation = { opacity: 1, scale: 1 };
  switch (exitType) {
    case 'dissolve':
      exitAnimation = { opacity: 1 - exitProgress, scale: 1 };
      break;
    case 'slide':
      exitAnimation = { opacity: 1 - exitProgress, scale: 1 - exitProgress * 0.3 };
      break;
    case 'explode':
      exitAnimation = { opacity: Math.max(0, 1 - exitProgress * 2), scale: 1 + exitProgress * 0.5 };
      break;
  }
  
  const totalOpacity = entranceAnimation.opacity * exitAnimation.opacity;
  const totalScale = entranceAnimation.scale * exitAnimation.scale;
  
  if (totalOpacity <= 0) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: entranceAnimation.x,
        top: entranceAnimation.y,
        width: 450,
        padding: 30,
        background: 'rgba(10, 10, 25, 0.95)',
        borderRadius: 20,
        border: `2px solid ${color}`,
        boxShadow: `
          0 0 30px ${color}40,
          0 0 60px ${color}20,
          inset 0 0 30px ${color}10
        `,
        transform: `scale(${totalScale})`,
        opacity: totalOpacity,
        overflow: 'hidden',
      }}
    >
      {/* Icono */}
      <div
        style={{
          fontSize: 50,
          marginBottom: 15,
          filter: 'drop-shadow(0 0 10px currentColor)',
        }}
      >
        {icon}
      </div>
      
      {/* Título */}
      <AnimatedText
        text={[title]}
        type="reveal"
        animationStyle="letterByLetter"
        accentColor={color}
        fontSize={32}
        fontFamily="Montserrat Bold"
        duration={40}
        letterDelay={5}
        glowIntensity={0.8}
      />
      
      {/* Subtítulo */}
      <AnimatedText
        text={[subtitle]}
        type="fade"
        animationStyle="slide"
        accentColor={color}
        fontSize={22}
        fontFamily="Montserrat"
        duration={30}
        delayBetweenLines={0}
      />
      
      {/* Glow effect */}
      <NeonGlow color={color} intensity={0.3} layers={2} />
    </div>
  );
}

// ============================================
// BENEFIT CARD SIMPLIFICADA
// ============================================

export function BenefitCard({
  number,
  title,
  description,
  color,
  delay = 0,
}: {
  number: string;
  title: string;
  description: string;
  color: string;
  delay?: number;
}) {
  const frame = useCurrentFrame();
  
  const progress = Math.max(0, Math.min(1, (frame - delay) / 60));
  
  const scale = spring({
    fps: 60,
    frame: frame - delay,
    config: { damping: 18, stiffness: 100 },
  });
  
  if (progress <= 0) return null;
  
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 20,
        padding: 25,
        background: 'rgba(10, 10, 30, 0.9)',
        borderRadius: 16,
        border: `1px solid ${color}50`,
        borderLeft: `4px solid ${color}`,
        transform: `scale(${scale > 1 ? 1.2 - (scale - 1) * 0.5 : scale})`,
        opacity: progress,
      }}
    >
      {/* Número */}
      <div
        style={{
          fontSize: 36,
          fontFamily: 'Montserrat Black',
          color: color,
          textShadow: `0 0 20px ${color}`,
          minWidth: 50,
        }}
      >
        {number}
      </div>
      
      {/* Contenido */}
      <div>
        <div
          style={{
            fontSize: 24,
            fontFamily: 'Montserrat Bold',
            color: '#FFFFFF',
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 16,
            fontFamily: 'Montserrat',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STAT CARD - TARJETA CON ESTADÍSTICA
// ============================================

export function StatCard({
  value,
  label,
  icon,
  color,
  delay = 0,
}: {
  value: string;
  label: string;
  icon: string;
  color: string;
  delay?: number;
}) {
  const frame = useCurrentFrame();
  
  const progress = Math.max(0, Math.min(1, (frame - delay) / 40));
  
  const countUp = interpolate(progress, [0, 1], [0, 1]);
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 30,
        background: `linear-gradient(135deg, ${color}20 0%, rgba(10,10,30,0.9) 100%)`,
        borderRadius: 20,
        border: `2px solid ${color}60`,
        transform: `scale(${countUp > 0.9 ? 1 + Math.sin((frame - delay - 40) * 0.1) * 0.05 : countUp})`,
        opacity: countUp,
      }}
    >
      <div style={{ fontSize: 60, marginBottom: 10 }}>{icon}</div>
      <div
        style={{
          fontSize: 48,
          fontFamily: 'Montserrat Black',
          color: color,
          textShadow: `0 0 30px ${color}80`,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 18,
          fontFamily: 'Montserrat',
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
        }}
      >
        {label}
      </div>
    </div>
  );
}
