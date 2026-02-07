import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from 'remotion';

// ============================================
// NEON GLOW - EFECTO DE RESPLANDOR NEÓN
// ============================================

export function NeonGlow({
  color = '#00D4FF',
  intensity = 0.5,
  animatePulse = true,
  pulseSpeed = 1,
  layers = 3,
  blurAmount = 20,
}: {
  color?: string;
  intensity?: number;
  animatePulse?: boolean;
  pulseSpeed?: number;
  layers?: number;
  blurAmount?: number;
}) {
  const frame = useCurrentFrame();
  
  const pulse = animatePulse ? 0.5 + Math.sin(frame * 0.05 * pulseSpeed) * 0.5 : 1;
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Multiple glow layers */}
      {Array.from({ length: layers }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: -blurAmount * (i + 1) * 2,
            background: `radial-gradient(ellipse at center, ${color}${Math.floor(intensity * pulse * 80 / (i + 1))} 0%, transparent ${60 + i * 15}%)`,
            filter: `blur(${blurAmount * (i + 1)}px)`,
            opacity: 1 - i * 0.2,
          }}
        />
      ))}
      
      {/* Animated shine effect */}
      <ShineOverlay color={color} intensity={intensity} />
    </AbsoluteFill>
  );
}

function ShineOverlay({
  color,
  intensity,
}: {
  color: string;
  intensity: number;
}) {
  const frame = useCurrentFrame();
  
  // Moving shine effect
  const shinePosition = (frame * 0.5) % 200 - 100;
  
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `
          linear-gradient(
            ${45 + shinePosition * 0.1}deg,
            transparent 0%,
            transparent 40%,
            ${color}${Math.floor(intensity * 30)} 50%,
            transparent 60%,
            transparent 100%
          )
        `,
        opacity: 0.5,
        filter: 'blur(40px)',
        transform: `translateX(${shinePosition * 5}px)`,
      }}
    />
  );
}

// ============================================
// GLOW TEXT CON MÚLTIPLES CAPAS
// ============================================

export function NeonText({
  text,
  fontSize,
  fontFamily,
  primaryColor = '#FFFFFF',
  glowColor = '#00D4FF',
  glowLayers = 4,
  pulseIntensity = 0.3,
  letterSpacing = 0,
}: {
  text: string;
  fontSize: number;
  fontFamily: string;
  primaryColor?: string;
  glowColor?: string;
  glowLayers?: number;
  pulseIntensity?: number;
  letterSpacing?: number;
}) {
  const frame = useCurrentFrame();
  
  const pulse = 1 + Math.sin(frame * 0.03) * pulseIntensity;
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Glow layers from outside to inside */}
      {Array.from({ length: glowLayers }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize,
            fontFamily,
            color: glowColor,
            letterSpacing: `${letterSpacing}px`,
            opacity: (1 / (i + 1)) * pulse,
            filter: `blur(${(i + 1) * 8}px)`,
            whiteSpace: 'pre',
          }}
        >
          {text}
        </div>
      ))}
      
      {/* Main text */}
      <div
        style={{
          position: 'relative',
          fontSize,
          fontFamily,
          color: primaryColor,
          letterSpacing: `${letterSpacing}px`,
          textShadow: `
            0 0 10px ${glowColor}80,
            0 0 20px ${glowColor}60,
            0 0 40px ${glowColor}40,
            0 0 80px ${glowColor}20
          `,
          whiteSpace: 'pre',
        }}
      >
        {text}
      </div>
    </div>
  );
}

// ============================================
// BORDER GLOW - BORDE RESPLANDECIENTE
// ============================================

export function GlowingBorder({
  width,
  height,
  borderWidth = 4,
  color = '#00D4FF',
  cornerRadius = 20,
  animationSpeed = 1,
}: {
  width: number;
  height: number;
  borderWidth?: number;
  color?: string;
  cornerRadius?: number;
  animationSpeed?: number;
}) {
  const frame = useCurrentFrame();
  
  // Rotating gradient effect
  const rotation = (frame * 0.5 * animationSpeed) % 360;
  
  return (
    <div
      style={{
        width,
        height,
        borderRadius: cornerRadius,
        background: `
          conic-gradient(
            from ${rotation}deg,
            ${color} 0deg,
            transparent 90deg,
            transparent 180deg,
            ${color} 270deg,
            transparent 360deg
          )
        `,
        padding: borderWidth,
        mask: `
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0)
        `,
        maskComposite: 'exclude',
        filter: 'blur(4px)',
      }}
    />
  );
}

// ============================================
// PULSING CIRCLE GLOW
// ============================================

export function PulsingGlow({
  size = 200,
  color = '#00D4FF',
  pulseSpeed = 1,
  innerColor = '#FFFFFF',
}: {
  size?: number;
  color?: string;
  pulseSpeed?: number;
  innerColor?: string;
}) {
  const frame = useCurrentFrame();
  
  const pulse = 0.8 + Math.sin(frame * 0.05 * pulseSpeed) * 0.4;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${innerColor}20 0%, ${color}40 40%, transparent 70%)`,
        boxShadow: `
          0 0 ${size * pulse}px ${color}40,
          0 0 ${size * pulse * 0.5}px ${color}60
        `,
        animation: `pulse ${2 / pulseSpeed}s ease-in-out infinite`,
      }}
    />
  );
}
