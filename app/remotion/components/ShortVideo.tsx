import { 
  AbsoluteFill, 
  Audio, 
  Img, 
  useCurrentFrame, 
  useVideoConfig,
  spring,
  interpolate,
  Sequence
} from 'remotion';
import { useRef, useEffect, useState } from 'react';

export interface ShortVideoProps {
  audioPath: string;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  logoPath?: string;
}

export function ShortVideo({
  audioPath,
  title,
  subtitle,
  backgroundImage,
  logoPath
}: ShortVideoProps) {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const progress = frame / durationInFrames;

  const titleOpacity = spring({
    frame,
    fps,
    config: { mass: 0.5, stiffness: 200, damping: 15 }
  });

  const titleScale = interpolate(progress, [0, 0.2], [0.8, 1], {
    extrapolateRight: 'clamp'
  });

  const subtitleY = interpolate(progress, [0.3, 0.5], [20, 0], {
    extrapolateRight: 'clamp'
  });

  const particles = Array.from({ length: 20 }).map((_, i) => ({
    x: (i * 73) % 100,
    y: (i * 47) % 100,
    size: 5 + (i % 5),
    delay: (i * 3) % 30
  }));

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {backgroundImage && (
        <AbsoluteFill>
          <Img 
            src={backgroundImage} 
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.3
            }}
          />
        </AbsoluteFill>
      )}

      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            transform: `translate(-50%, -50%)`,
            opacity: interpolate(frame, [particle.delay, particle.delay + 20], [0, 1], {
              extrapolateRight: 'clamp'
            })
          }}
        />
      ))}

      <Sequence from={0} durationInFrames={fps * 0.5}>
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          {logoPath ? (
            <Img 
              src={logoPath}
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                opacity: titleOpacity
              }}
            />
          ) : (
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 40,
              opacity: titleOpacity
            }}>
              🎬
            </div>
          )}
        </div>
      </Sequence>

      <div style={{
        textAlign: 'center',
        zIndex: 10,
        padding: '0 40px',
      }}>
        <h1 style={{
          fontSize: 56,
          fontWeight: 800,
          color: 'white',
          marginBottom: 20,
          textShadow: '0 4px 30px rgba(0,0,0,0.3)',
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1.1,
        }}>
          {title}
        </h1>

        {subtitle && (
          <p style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            opacity: interpolate(progress, [0.3, 0.5], [0, 1], {
              extrapolateRight: 'clamp'
            }),
            transform: `translateY(${-subtitleY}px)`,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.5)',
              opacity: interpolate(
                progress,
                [i * 0.3, i * 0.3 + 0.1],
                [1, 0],
                { extrapolateRight: 'clamp' }
              )
            }}
          />
        ))}
      </div>

      <Audio src={audioPath} />
    </AbsoluteFill>
  );
}
