import { AbsoluteFill, Audio, Img, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, Easing, random } from 'remotion';
import { useMemo, useState, useEffect } from 'react';

interface SceneProps {
  text: string;
  subtitle: string;
  accentColor: string;
  emoji: string;
  startFrame: number;
  durationInFrames: number;
}

function AnimatedTitle({ text, startFrame, accentColor }: { text: string; startFrame: number; accentColor: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || relativeFrame > 120) return null;

  const words = text.split(' ');
  const progress = relativeFrame / 120;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, maxWidth: 900 }}>
      {words.map((word, i) => {
        const wordProgress = interpolate(progress, [i * 0.1, i * 0.1 + 0.5], [0, 1], { easing: Easing.out(Easing.back(1.7)) });
        const y = interpolate(wordProgress, [0, 1], [100, 0]);
        const opacity = wordProgress;

        return (
          <div
            key={i}
            style={{
              transform: `translateY(${y}px)`,
              opacity,
              fontSize: 72,
              fontWeight: 800,
              color: i % 2 === 0 ? '#ffffff' : accentColor,
              textShadow: `0 4px 30px ${accentColor}40`,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {word}
          </div>
        );
      })}
    </div>
  );
}

function FloatingParticles({ color, count = 30 }: { color: string; count?: number }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = (frame * 0.3 + i * 137) % 100;
        const y = (frame * 0.2 + i * 89) % 100;
        const size = 3 + (i % 5) * 2;
        const delay = i * 5;
        const opacity = interpolate(frame, [delay, delay + 30, durationInFrames - 30, durationInFrames], [0, 0.6, 0.6, 0], { easing: Easing.out(Easing.linear) });
        const scale = 1 + Math.sin(frame * 0.05 + i) * 0.3;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              opacity,
              transform: `scale(${scale})`,
              boxShadow: `0 0 ${size * 2}px ${color}80`,
            }}
          />
        );
      })}
    </>
  );
}

function GlowOrb({ color, size = 400 }: { color: string; size?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <div
      style={{
        position: 'absolute',
        right: -100,
        bottom: -100,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        transform: `translate(${Math.sin(t * 0.5) * 20}px, ${Math.cos(t * 0.3) * 15}px)`,
      }}
    />
  );
}

function Scene({ text, subtitle, accentColor, emoji, startFrame, durationInFrames }: SceneProps) {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || relativeFrame >= durationInFrames) return null;

  const progress = relativeFrame / durationInFrames;
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const yOffset = interpolate(progress, [0, 1], [20, 0]);

  return (
    <AbsoluteFill style={{ 
      opacity,
      transform: `translateY(${yOffset}px)`,
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
      overflow: 'hidden',
    }}>
      <FloatingParticles color={accentColor} count={40} />
      <GlowOrb color={accentColor} size={500} />
      
      <div style={{ position: 'absolute', top: '12%', width: '100%', textAlign: 'center' }}>
        <span style={{ fontSize: 80, opacity: 0.15 }}>{emoji}</span>
      </div>

      <div style={{ 
        position: 'absolute', 
        top: '45%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <AnimatedTitle text={text} startFrame={0} accentColor={accentColor} />
        
        <div style={{ 
          marginTop: 40, 
          fontSize: 32, 
          color: `${accentColor}cc`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontStyle: 'italic',
          opacity: interpolate(relativeFrame, [30, 60], [0, 1]),
        }}>
          {subtitle}
        </div>
      </div>

      <div style={{ 
        position: 'absolute', 
        bottom: '8%', 
        left: '50%', 
        transform: 'translateX(-50%)',
        display: 'flex', 
        gap: 12,
      }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              opacity: interpolate(relativeFrame, [i * 15, i * 15 + 20], [0.3, 1]),
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}

function ProgressBar() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: 6,
      background: 'rgba(255,255,255,0.1)',
    }}>
      <div style={{
        width: `${progress * 100}%`,
        height: '100%',
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
      }} />
    </div>
  );
}

export function RedCreativaVideo() {
  const { durationInFrames, fps } = useVideoConfig();
  const sceneDuration = durationInFrames / 4;

  const scenes = [
    { text: 'RedCreativa Pro', subtitle: 'La comunidad que construye el futuro', accentColor: '#6366f1', emoji: '🚀' },
    { text: 'No estás solo', subtitle: '+1,000 creadores aprendiendo juntos', accentColor: '#8b5cf6', emoji: '🤝' },
    { text: 'IA • Automatización', subtitle: 'Lo que funciona, explicado', accentColor: '#ec4899', emoji: '💡' },
    { text: 'Únete gratis', subtitle: 'Es real. Es RedCreativa Pro.', accentColor: '#22d3ee', emoji: '✨' },
  ];

  return (
    <AbsoluteFill style={{ background: '#000000' }}>
      {scenes.map((scene, i) => (
        <Scene
          key={i}
          {...scene}
          startFrame={i * sceneDuration}
          durationInFrames={sceneDuration}
        />
      ))}
      <ProgressBar />
    </AbsoluteFill>
  );
}

export default RedCreativaVideo;
