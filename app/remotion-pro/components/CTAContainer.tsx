import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing, AbsoluteFill, Sequence } from 'remotion';
import { AnimatedText } from './AnimatedText';
import { NeonGlow } from './NeonGlow';
import { ParticleField } from './ParticleField';
import { springConfig, easingCurves } from '../utils/animations';

// ============================================
// CTA CONTAINER - CALL TO ACTION FINAL
// ============================================

export function CTAContainer() {
  const frame = useCurrentFrame();
  
  const items = [
    {
      text: ['¡EMPIEZA', 'GRatis AHORA!'],
      subtext: 'Plan Pro solo 1€/mes',
      url: 'redcreativa.pro',
      delay: 0,
      color: '#00D4FF',
    },
  ];
  
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Logo centered */}
      <Sequence name="CTA Logo" from={0} durationInFrames={240}>
        <LogoReveal delay={0} />
      </Sequence>
      
      {/* Main CTA text */}
      <Sequence name="CTA Main" from={30} durationInFrames={210}>
        <MainCTAText delay={30} />
      </Sequence>
      
      {/* URL */}
      <Sequence name="CTA URL" from={120} durationInFrames={120}>
        <UrlDisplay delay={120} />
      </Sequence>
      
      {/* Particle effects */}
      <ParticleField
        particleCount={40}
        layers={3}
        colors={['#00D4FF', '#B700FF', '#FFFFFF']}
        orbitRadius={300}
        speed="medium"
      />
      
      {/* Glow effects */}
      <NeonGlow color="#00D4FF" intensity={0.4} animatePulse={true} pulseSpeed={1.5} />
    </AbsoluteFill>
  );
}

function LogoReveal({ delay }: { delay: number }) {
  const frame = useCurrentFrame();
  const progress = Math.max(0, Math.min(1, (frame - delay) / 60));
  
  // Spring animation
  const scaleSpring = spring({
    fps: 60,
    frame: frame - delay,
    config: { damping: 12, stiffness: 100 },
  });
  
  const scale = scaleSpring > 1 ? 1.3 - (scaleSpring - 1) * 0.3 : scaleSpring;
  
  // Breathing glow
  const glowPulse = 0.5 + Math.sin((frame - delay) * 0.1) * 0.5;
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `scale(${scale})`,
      }}
    >
      {/* Logo circle */}
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00D4FF 0%, #B700FF 50%, #00D4FF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `
            0 0 ${60 * glowPulse}px #00D4FF80,
            0 0 ${120 * glowPulse}px #B700FF60,
            inset 0 0 30px rgba(255,255,255,0.2)
          `,
          border: '4px solid rgba(255,255,255,0.3)',
        }}
      >
        <span style={{ fontSize: 80 }}>🚀</span>
      </div>
    </div>
  );
}

function MainCTAText({ delay }: { delay: number }) {
  const frame = useCurrentFrame();
  const progress = Math.max(0, Math.min(1, (frame - delay) / 80));
  
  // Entry animation
  const yOffset = interpolate(progress, [0, 1], [100, 0]);
  const opacity = interpolate(progress, [0, 0.2, 1], [0, 0, 1]);
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '60%',
        transform: `translateY(${yOffset}px)`,
        opacity,
        textAlign: 'center',
      }}
    >
      <AnimatedText
        text={['¡EMPIEZA', 'GRatis AHORA!']}
        type="reveal"
        animationStyle="stagger"
        accentColor="#00D4FF"
        fontSize={72}
        fontFamily="Montserrat Black"
        duration={60}
        delayBetweenLines={15}
        glowIntensity={1.5}
        motionBlur={true}
      />
      
      {/* Subtitle */}
      <AnimatedText
        text={['Plan Pro solo 1€/mes']}
        type="fade"
        animationStyle="slide"
        accentColor="#B700FF"
        fontSize={32}
        fontFamily="Montserrat"
        duration={40}
        delayBetweenLines={0}
      />
    </div>
  );
}

function UrlDisplay({ delay }: { delay: number }) {
  const frame = useCurrentFrame();
  const progress = Math.max(0, Math.min(1, (frame - delay) / 60));
  
  // Typewriter effect for URL
  const charsToShow = Math.floor(progress * 20);
  const url = 'redcreativa.pro'.slice(0, charsToShow);
  
  // Pulse animation
  const pulse = 0.8 + Math.sin(frame * 0.15) * 0.4;
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '85%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 15,
      }}
    >
      {/* URL with typing effect */}
      <div
        style={{
          fontSize: 28,
          fontFamily: 'Monaco, monospace',
          color: '#00D4FF',
          letterSpacing: 2,
          textShadow: `0 0 ${20 * pulse}px #00D4FF`,
          padding: '10px 30px',
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: 30,
          border: `2px solid #00D4FF40`,
        }}
      >
        {url}
        <span
          style={{
            animation: 'blink 0.5s infinite',
            marginLeft: 2,
          }}
        >
          |
        </span>
      </div>
      
      {/* Arrow indicator */}
      <div
        style={{
          fontSize: 24,
          color: 'rgba(255,255,255,0.5)',
          animation: 'bounce 1s infinite',
        }}
      >
        ↓
      </div>
    </div>
  );
}

// ============================================
// BUTTON ANIMADO
// ============================================

export function AnimatedButton({
  text,
  onClick,
  color = '#00D4FF',
  width = 300,
  height = 60,
  delay = 0,
}: {
  text: string;
  onClick?: () => void;
  color?: string;
  width?: number;
  height?: number;
  delay?: number;
}) {
  const frame = useCurrentFrame();
  
  const progress = Math.max(0, Math.min(1, (frame - delay) / 30));
  
  const scale = spring({
    fps: 60,
    frame: frame - delay,
    config: { damping: 20, stiffness: 120 },
  });
  
  // Hover effect simulation
  const hoverIntensity = 0.5 + Math.sin(frame * 0.05) * 0.3;
  
  return (
    <div
      style={{
        width,
        height,
        borderRadius: height / 2,
        background: `linear-gradient(90deg, ${color} 0%, ${color}80 50%, ${color} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transform: `scale(${progress * (scale > 1 ? 1.1 : scale)})`,
        boxShadow: `
          0 0 ${20 * hoverIntensity}px ${color},
          0 0 ${40 * hoverIntensity}px ${color}60,
          inset 0 0 20px rgba(255,255,255,0.2)
        `,
        border: '2px solid rgba(255,255,255,0.3)',
        transition: 'transform 0.1s ease-out',
      }}
    >
      <span
        style={{
          fontSize: 24,
          fontFamily: 'Montserrat Bold',
          color: '#FFFFFF',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          letterSpacing: 2,
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ============================================
// FINAL FLASH EFFECT
// ============================================

export function FinalFlash() {
  const frame = useCurrentFrame();
  
  const progress = Math.max(0, Math.min(1, frame / 30));
  
  if (progress >= 1) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at center, white ${Math.floor(100 * (1 - progress))}%, transparent ${Math.floor(100 * (1 - progress))}%)`,
        opacity: 1 - progress,
        pointerEvents: 'none',
      }}
    />
  );
}
