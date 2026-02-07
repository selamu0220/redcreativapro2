'use client';

import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

interface RedCreativaProProps {
  audioPath: string;
  script: string;
}

function AnimatedText({
  text,
  startFrame,
  duration = 60,
  style = {},
}: {
  text: string;
  startFrame: number;
  duration?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || relativeFrame > duration) return null;

  const progress = relativeFrame / duration;

  const opacity = interpolate(progress, [0, 0.15], [0, 1], { easing: Easing.out(Easing.cubic) });
  const translateY = interpolate(progress, [0, 0.3], [30, 0], { easing: Easing.out(Easing.cubic) });
  const scale = interpolate(progress, [0, 0.2], [0.9, 1], { easing: Easing.out(Easing.cubic) });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        textAlign: 'center',
        ...style,
      }}
    >
      {text}
    </div>
  );
}

function GlitchText({ children, startFrame, duration = 90 }: { children: React.ReactNode; startFrame: number; duration?: number }) {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || relativeFrame > duration) return null;

  const glitchIntensity = interpolate(relativeFrame, [0, 5, 10, 15, 90], [5, 0, 3, 0, 0], { easing: Easing.out(Easing.cubic) });
  const translateX = (Math.random() - 0.5) * glitchIntensity;
  const translateY = (Math.random() - 0.5) * glitchIntensity;

  return <div style={{ transform: `translate(${translateX}px, ${translateY}px)` }}>{children}</div>;
}

function Particle({ x, y, size, delay: delayMs, color }: { x: number; y: number; size: number; delay: number; color: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delayFrames = delayMs * fps;

  if (frame < delayFrames) return null;

  const progress = (frame - delayFrames) / 120;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        background: color,
        borderRadius: '50%',
        opacity: interpolate(progress, [0, 0.1, 0.8, 1], [0, 1, 1, 0]),
        transform: `translate(-50%, -50%) scale(${1 + progress * 0.5})`,
      }}
    />
  );
}

function FloatingShape({ type, x, y, size, color, rotation, duration }: { type: 'circle' | 'square' | 'triangle'; x: number; y: number; size: number; color: string; rotation: number; duration: number }) {
  const frame = useCurrentFrame();
  const progress = frame / (duration * 60);

  const floatY = Math.sin(progress * Math.PI * 2) * 20;
  const floatX = Math.cos(progress * Math.PI) * 10;
  const currentRotation = rotation + progress * 360;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: x + floatX,
    top: y + floatY,
    width: size,
    height: size,
    background: color,
    opacity: 0.15,
    transform: `rotate(${currentRotation}deg)`,
  };

  if (type === 'circle') return <div style={{ ...baseStyle, borderRadius: '50%' }} />;
  if (type === 'square') return <div style={baseStyle} />;
  return <div style={{ ...baseStyle, width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${color}`, background: 'transparent' }} />;
}

export function RedCreativaProMain({ audioPath, script }: RedCreativaProProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scenes = script.split('\n\n').filter(Boolean);
  const totalAudioDuration = 20;
  const sceneDuration = (totalAudioDuration * fps) / scenes.length;

  const particles = Array.from({ length: 30 }).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 3 + Math.random() * 8,
    delay: Math.random() * 3,
    color: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'][Math.floor(Math.random() * 5)],
  }));

  return (
    <AbsoluteFill style={{ background: '#0a0a0f', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 20%, rgba(102, 126, 234, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(118, 75, 162, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(240, 147, 251, 0.05) 0%, transparent 70%)' }} />

      {particles.map((particle, i) => <Particle key={i} {...particle} />)}

      <FloatingShape type="circle" x={15} y={20} size={100} color="#667eea" rotation={0} duration={8} />
      <FloatingShape type="square" x={75} y={25} size={60} color="#764ba2" rotation={45} duration={10} />
      <FloatingShape type="triangle" x={85} y={75} size={80} color="#f093fb" rotation={180} duration={12} />
      <FloatingShape type="circle" x={25} y={80} size={40} color="#4facfe" rotation={0} duration={6} />

      <Sequence name="Intro Logo" from={0} durationInFrames={fps * 2}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 120, height: 120, borderRadius: 30, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(102, 126, 234, 0.5)' }}>
            <span style={{ fontSize: 50 }}>⚡</span>
          </div>
        </div>
      </Sequence>

      {scenes.map((scene, index) => {
        const start = index * sceneDuration;
        const sceneStart = start;
        const sceneEnd = start + sceneDuration;
        const relativeFrame = frame - start;

        if (frame < sceneStart || frame >= sceneEnd) return null;

        const lines = scene.split('\n');

        return (
          <Sequence key={index} name={`Scene ${index}`} from={sceneStart} durationInFrames={sceneDuration}>
            <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px' }}>
              <div style={{ width: 120, height: 4, background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: 2 }} />
              <div style={{ height: 40 }} />

              {lines.map((line, lineIndex) => (
                <AnimatedText
                  key={lineIndex}
                  text={line}
                  startFrame={lineIndex * 15}
                  duration={60}
                  style={{ fontSize: index === 0 && line.includes('RedCreativa') ? 48 : 32, fontWeight: index === 0 && line.includes('RedCreativa') ? 800 : 600, color: 'white', lineHeight: 1.4, maxWidth: index === 0 ? '100%' : 700, fontFamily: 'system-ui, -apple-system, sans-serif', textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
                />
              ))}

              {index === scenes.length - 1 && (
                <div style={{ height: 60, display: 'flex', gap: 20, marginTop: 40 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', opacity: interpolate(relativeFrame, [i * 15, i * 15 + 10], [0, 1]) }} />
                  ))}
                </div>
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      <Sequence name="Ending CTA" from={durationInFrames - fps * 3} durationInFrames={fps * 3}>
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)' }}>
          <GlitchText startFrame={0}>
            <div style={{ fontSize: 56, fontWeight: 900, background: 'linear-gradient(90deg, #fff, #667eea, #f093fb)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', textShadow: '0 0 60px rgba(102, 126, 234, 0.5)' }}>
              RedCreativa Pro
            </div>
          </GlitchText>
          <div style={{ height: 30 }} />
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Creando juntos</div>
        </AbsoluteFill>
      </Sequence>

      <Audio src={audioPath} />
    </AbsoluteFill>
  );
}
