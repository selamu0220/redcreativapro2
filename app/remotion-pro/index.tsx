import {
  Composition,
  registerRoot,
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
  Audio,
  Img,
} from 'remotion';
import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { AnimatedText } from './components/AnimatedText';
import { ParticleField } from './components/ParticleField';
import { NeonGlow } from './components/NeonGlow';
import { CameraLayer } from './components/CameraLayer';
import { ExplosiveTransition } from './components/ExplosiveTransition';
import { DynamicCard } from './components/DynamicCard';
import { DemoEditor } from './components/DemoEditor';
import { CTAContainer } from './components/CTAContainer';
import { createParticleExplosion, createFlare, createEnergyWave } from './utils/effects';
import { springConfig, easingCurves } from './utils/animations';

// ============================================
// CONFIGURACIÓN PRINCIPAL DEL VÍDEO
// ============================================
// 25 segundos exactos @ 60 FPS = 1500 frames
// Resolución vertical TikTok/Reels: 1080x1920

const FPS = 60;
const DURATION_SECONDS = 25;
const TOTAL_FRAMES = DURATION_SECONDS * FPS;
const WIDTH = 1080;
const HEIGHT = 1920;

// Timing Sections (en frames)
const SECTIONS = {
  HOOK: { start: 0, end: 240, duration: 240 },        // 0-4s
  SOLUTION: { start: 240, end: 540, duration: 300 },    // 4-9s  
  BENEFITS: { start: 540, end: 960, duration: 420 },    // 9-16s
  DEMO: { start: 960, end: 1260, duration: 300 },       // 16-21s
  CTA: { start: 1260, end: 1500, duration: 240 },       // 21-25s
};

// Colores del brand
const COLORS = {
  background: '#050510',
  neonBlue: '#00D4FF',
  neonPurple: '#B700FF',
  cyan: '#00FFFF',
  white: '#FFFFFF',
  accent1: '#FF0066',
  accent2: '#FF9900',
};

function LoadingPlaceholder() {
  return (
    <AbsoluteFill
      style={{
        background: COLORS.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ color: COLORS.neonBlue, fontSize: 24, fontFamily: 'Montserrat' }}>
        Cargando...
      </div>
    </AbsoluteFill>
  );
}

function BackgroundBase() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: COLORS.background,
        overflow: 'hidden',
      }}
    >
      {/* Gradiente animado */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 30% 20%, ${COLORS.neonPurple}20 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, ${COLORS.neonBlue}15 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, ${COLORS.cyan}08 0%, transparent 70%)
          `,
          transform: `translate(${-20 + Math.sin(frame * 0.01) * 40}px, ${-20 + Math.cos(frame * 0.008) * 40}px) scale(${1 + Math.sin(frame * 0.005) * 0.1})`,
          filter: 'blur(40px)',
        }}
      />

      {/* Ruido animado sutil */}
      <AnimatedNoise opacity={0.03} />
    </AbsoluteFill>
  );
}

function AnimatedNoise({ opacity }: { opacity: number }) {
  const frame = useCurrentFrame();
  
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,${opacity}) 2px,
            rgba(255,255,255,${opacity}) 4px
          )
        `,
        transform: `translateY(${frame * 0.5}%)`,
        opacity: 0.5 + Math.sin(frame * 0.02) * 0.3,
      }}
    />
  );
}

function MainComposition() {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ background: COLORS.background, overflow: 'hidden' }}>
      {/* ======================================== */}
      {/* CAPA 1: FONDO ANIMADO */}
      {/* ======================================== */}
      <BackgroundBase />

      {/* ======================================== */}
      {/* CAPA 2: PARTÍCULAS (3 capas simultáneas) */}
      {/* ======================================== */}
      <Sequence name="Particles Background" from={0} durationInFrames={TOTAL_FRAMES}>
        <ParticleField
          particleCount={80}
          layers={3}
          colors={[COLORS.neonBlue, COLORS.neonPurple, COLORS.cyan]}
          speed="fast"
          explosionIntensity={0.8}
        />
      </Sequence>

      {/* ======================================== */}
      {/* SECCIÓN 1: HOOK EXPLOSIVO (0-4s) */}
      {/* ======================================== */}
      <Sequence name="Hook Section" from={SECTIONS.HOOK.start} durationInFrames={SECTIONS.HOOK.duration}>
        <HookSection />
      </Sequence>

      {/* ======================================== */}
      {/* SECCIÓN 2: PRESENTACIÓN DE SOLUCIÓN (4-9s) */}
      {/* ======================================== */}
      <Sequence name="Solution Section" from={SECTIONS.SOLUTION.start} durationInFrames={SECTIONS.SOLUTION.duration}>
        <SolutionSection />
      </Sequence>

      {/* ======================================== */}
      {/* SECCIÓN 3: BENEFICIOS (9-16s) */}
      {/* ======================================== */}
      <Sequence name="Benefits Section" from={SECTIONS.BENEFITS.start} durationInFrames={SECTIONS.BENEFITS.duration}>
        <BenefitsSection />
      </Sequence>

      {/* ======================================== */}
      {/* SECCIÓN 4: DEMOSTRACIÓN (16-21s) */}
      {/* ======================================== */}
      <Sequence name="Demo Section" from={SECTIONS.DEMO.start} durationECTIONS.DEMOInFrames={S.duration}>
        <DemoSection />
      </Sequence>

      {/* ======================================== */}
      {/* SECCIÓN 5: CTA FINAL (21-25s) */}
      {/* ======================================== */}
      <Sequence name="CTA Section" from={SECTIONS.CTA.start} durationInFrames={SECTIONS.CTA.duration}>
        <CTASection />
      </Sequence>

      {/* ======================================== */}
      {/* EFECTOS DE CÁMARA CONTINUOS */}
      {/* ======================================== */}
      <CameraLayer
        intensity={0.15}
        shakeFrequency={0.3}
        zoomRange={[0.97, 1.03]}
        panRange={[-15, 15]}
      />

      {/* ======================================== */}
      {/* FLARES Y GLOWS CONSTANTES */}
      {/* ======================================== */}
      <Sequence name="Flare Effects" from={0} durationInFrames={TOTAL_FRAMES}>
        <FlareOverlay />
      </Sequence>

      {/* ======================================== */}
      {/* GLOW NEON GENERAL */}
      {/* ======================================== */}
      <NeonGlow
        color={COLORS.neonBlue}
        intensity={0.15}
        animatePulse={true}
        pulseSpeed={0.5}
      />
    </AbsoluteFill>
  );
}

// ============================================
// SECCIÓN 1: HOOK EXPLOSIVO (0-4s, 240 frames)
// ============================================
function HookSection() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sectionFrame = frame;
  const sectionDuration = SECTIONS.HOOK.duration;

  // Explosión inicial
  const explosionProgress = Math.min(1, sectionFrame / 60);
  const zoomProgress = interpolate(sectionFrame, [0, 180], [1.5, 1], { easing: Easing.out(Easing.cubic) });
  const textReveal = spring({ fps, frame: sectionFrame, config: { damping: 20, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Explosión de partículas inicial */}
      <Sequence name="Explosion" from={0} durationInFrames={120}>
        <ExplosiveTransition
          type="radial"
          color={COLORS.neonBlue}
          intensity={1}
          duration={120}
        />
      </Sequence>

      {/* Texto principal con reveal multicapa */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${zoomProgress})`,
        }}
      >
        {/* Pregunta hook */}
        <AnimatedText
          text={['¿Cansado de escribir', 'lento y sin', 'inspiración?']}
          type="reveal"
          animationStyle="stagger"
          accentColor={COLORS.neonPurple}
          fontSize={72}
          fontFamily="Montserrat Black"
          duration={sectionDuration}
          delayBetweenLines={20}
          glowIntensity={1}
          motionBlur={true}
        />
      </div>

      {/* Subtítulos rápidos apareciendo */}
      <Sequence name="Subtitles Fast" from={60} durationInFrames={180}>
        <div style={{ position: 'absolute', bottom: 400, left: 0, right: 0 }}>
          <AnimatedText
            text={['Horas perdidas...', 'Ideas que no fluyen...', 'Contenido mediocre...']}
            type="pulse"
            animationStyle="typewriter"
            accentColor={COLORS.neonBlue}
            fontSize={36}
            fontFamily="Montserrat"
            duration={120}
            delayBetweenLines={40}
          />
        </div>
      </Sequence>

      {/* Partículas constantes alrededor del texto */}
      <ParticleField
        particleCount={30}
        layers={2}
        colors={[COLORS.neonBlue, COLORS.neonPurple]}
        orbitRadius={400}
        speed="fast"
      />

      {/* Flares cruzando cada 0.5s */}
      <Sequence name="Flare Crosses" from={0} durationInFrames={240}>
        <FlareCrossing interval={30} />
      </Sequence>
    </AbsoluteFill>
  );
}

// ============================================
// SECCIÓN 2: PRESENTACIÓN DE SOLUCIÓN (4-9s)
// ============================================
function SolutionSection() {
  const frame = useCurrentFrame();
  const sectionFrame = frame;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Transición wipe radial explosiva */}
      <Sequence name="Transition Wipe" from={0} durationInFrames={60}>
        <ExplosiveTransition
          type="wipe"
          color={COLORS.neonPurple}
          intensity={1.2}
          duration={60}
        />
      </Sequence>

      {/* Logo con overshoot spring brutal */}
      <Sequence name="Logo Entry" from={30} durationInFrames={150}>
        <LogoEntrance />
      </Sequence>

      {/* Textos secuenciales ultra rápidos */}
      <Sequence name="Solution Texts" from={120} durationInFrames={420}>
        <SolutionTextSequence />
      </Sequence>

      {/* Partículas orbitando el logo */}
      <ParticleField
        particleCount={40}
        layers={3}
        colors={[COLORS.neonBlue, COLORS.neonPurple, COLORS.cyan]}
        orbitRadius={350}
        speed="medium"
        orbitDirection="clockwise"
      />

      {/* Camera pan rápido entre textos */}
      <CameraLayer
        intensity={0.2}
        shakeFrequency={0.5}
        panRange={[-30, 30]}
        zoomRange={[0.95, 1.05]}
      />
    </AbsoluteFill>
  );
}

function LogoEntrance() {
  const frame = useCurrentFrame();
  
  const scale = spring({
    fps: FPS,
    frame,
    config: { damping: 15, stiffness: 100 },
  });

  const scaleOvershoot = scale > 1 ? 1.3 - (scale - 1) * 0.3 : scale;
  const glowPulse = 0.5 + Math.sin(frame * 0.2) * 0.5;

  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          transform: `scale(${scaleOvershoot})`,
          filter: `drop-shadow(0 0 ${30 * glowPulse}px ${COLORS.neonBlue}) drop-shadow(0 0 ${60 * glowPulse}px ${COLORS.neonPurple})`,
        }}
      >
        <AnimatedText
          text={['Red Creativa', 'Pro']}
          type="reveal"
          animationStyle="letterByLetter"
          accentColor={COLORS.neonBlue}
          fontSize={88}
          fontFamily="Montserrat Black"
          duration={180}
          letterDelay={8}
          glowIntensity={1.5}
        />
      </div>
    </AbsoluteFill>
  );
}

function SolutionTextSequence() {
  const frame = useCurrentFrame();

  const texts = [
    { text: ['¡LA IA QUE REVOLUCIONA', 'TU ESCRITURA!'], delay: 0 },
    { text: ['3× más rápido', 'con streaks'], delay: 80 },
    { text: ['Aprende TU estilo', 'único'], delay: 140 },
    { text: ['SEO automático +', 'corrección pro'], delay: 200 },
    { text: ['100% indetectable', 'como IA'], delay: 260 },
  ];

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 80 }}>
      {texts.map((item, index) => (
        <Sequence key={index} name={`Solution Text ${index}`} from={item.delay} durationInFrames={80}>
          <AnimatedText
            text={item.text}
            type="reveal"
            animationStyle="stagger"
            accentColor={index % 2 === 0 ? COLORS.neonPurple : COLORS.cyan}
            fontSize={52}
            fontFamily="Montserrat Bold"
            duration={60}
            delayBetweenLines={10}
            glowIntensity={1}
            speedLines={index % 2 === 0}
          />
          {/* Explosión de partículas sincronizada */}
          {frame >= 0 && frame < 30 && (
            <ExplosiveTransition
              type="burst"
              color={index % 2 === 0 ? COLORS.neonPurple : COLORS.cyan}
              intensity={0.6}
              duration={20}
            />
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

// ============================================
// SECCIÓN 3: BENEFICIOS EN RÁFAGA (9-16s)
// ============================================
function BenefitsSection() {
  const frame = useCurrentFrame();

  const cards = [
    {
      title: 'Artículos completos',
      subtitle: 'en minutos',
      icon: '✍️',
      color: COLORS.neonBlue,
      position: 'top-left',
    },
    {
      title: 'SEO que',
      subtitle: 'rankea #1',
      icon: '📈',
      color: COLORS.neonPurple,
      position: 'top-right',
    },
    {
      title: 'Suena 100%',
      subtitle: 'humano',
      icon: '🎭',
      color: COLORS.cyan,
      position: 'bottom-left',
    },
    {
      title: 'Corrige todo',
      subtitle: 'al instante',
      icon: '✨',
      color: COLORS.accent1,
      position: 'bottom-right',
    },
    {
      title: 'Para profesionales',
      subtitle: 'serios',
      icon: '💼',
      color: COLORS.accent2,
      position: 'center',
    },
  ];

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Transición con shake + flash */}
      <Sequence name="Transition Shake" from={0} durationInFrames={30}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'white',
            opacity: 1 - frame / 30,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${Math.sin(frame * 5) * 20}px, ${Math.cos(frame * 5) * 20}px)`,
          }}
        />
      </Sequence>

      {/* Texto superpuesto grande */}
      <Sequence name="Power Text" from={60} durationInFrames={360}>
        <AnimatedText
          text={['EL PODER QUE', 'NECESITABAS']}
          type="rotate"
          animationStyle="wave"
          accentColor={COLORS.white}
          fontSize={64}
          fontFamily="Montserrat Black"
          duration={360}
          rotationSpeed={0.02}
        />
      </Sequence>

      {/* Cards dinámicos */}
      {cards.map((card, index) => (
        <Sequence
          key={index}
          name={`Benefit Card ${index}`}
          from={90 + index * 60}
          durationInFrames={180}
        >
          <DynamicCard
            title={card.title}
            subtitle={card.subtitle}
            icon={card.icon}
            color={card.color}
            position={card.position as any}
            entranceType="spring"
            exitType="dissolve"
          />
        </Sequence>
      ))}

      {/* Partículas explotando de cada card */}
      <ParticleField
        particleCount={60}
        layers={4}
        colors={[COLORS.neonBlue, COLORS.neonPurple, COLORS.cyan, COLORS.white]}
        explosionIntensity={1}
        speed="explosive"
      />
    </AbsoluteFill>
  );
}

// ============================================
// SECCIÓN 4: DEMOSTRACIÓN VISUAL (16-21s)
// ============================================
function DemoSection() {
  const frame = useCurrentFrame();
  const sectionFrame = frame;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Transición zoom through con túnel de partículas */}
      <Sequence name="Zoom Through" from={0} durationInFrames={60}>
        <ExplosiveTransition
          type="tunnel"
          color={COLORS.neonBlue}
          intensity={1}
          duration={60}
        />
      </Sequence>

      {/* Simulación de editor */}
      <Sequence name="Editor Demo" from={30} durationInFrames={270}>
        <DemoEditor
          speed={3}
          text={[
            'La IA que aprende tu estilo...',
            'Escribiendo 3× más rápido...',
            'SEO optimizado automáticamente...',
            'Contenido 100% humano...',
          ]}
        />
      </Sequence>

      {/* Texto secundario */}
      <Sequence name="Demo Subtext" from={100} durationInFrames={200}>
        <AnimatedText
          text={['Mira cómo el contenido', 'fluye solo...']}
          type="fade"
          animationStyle="typewriter"
          accentColor={COLORS.neonPurple}
          fontSize={32}
          fontFamily="Montserrat"
          duration={200}
          delayBetweenLines={30}
        />
      </Sequence>

      {/* Partículas saliendo de cada palabra */}
      <ParticleField
        particleCount={50}
        layers={3}
        colors={[COLORS.neonBlue, COLORS.neonPurple, COLORS.cyan]}
        flowDirection="outward"
        speed="flowing"
      />

      {/* Ondas de energía */}
      <Sequence name="Energy Waves" from={60} durationInFrames={240}>
        <EnergyWaveOverlay />
      </Sequence>
    </AbsoluteFill>
  );
}

function DemoEditor({ speed, text }: { speed: number; text: string[] }) {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 800,
          height: 600,
          background: 'rgba(10, 10, 20, 0.9)',
          borderRadius: 20,
          border: `2px solid ${COLORS.neonBlue}`,
          boxShadow: `0 0 50px ${COLORS.neonBlue}40`,
          overflow: 'hidden',
          padding: 40,
        }}
      >
        {/* Cursor parpadeante */}
        <div
          style={{
            position: 'absolute',
            width: 3,
            height: 40,
            background: COLORS.neonBlue,
            animation: 'blink 0.5s infinite',
            transform: `translateY(${frame * speed}px)`,
          }}
        />
        
        {/* Texto apareciendo */}
        {text.map((line, index) => {
          const lineFrame = frame - index * 40;
          if (lineFrame < 0) return null;
          
          const opacity = interpolate(lineFrame, [0, 20], [0, 1]);
          const y = interpolate(lineFrame, [0, 20], [20, 0]);
          
          return (
            <div
              key={index}
              style={{
                color: COLORS.white,
                fontSize: 28,
                fontFamily: 'Monaco, monospace',
                opacity,
                transform: `translateY(${y}px)`,
                marginBottom: 20,
                textShadow: `0 0 10px ${COLORS.neonBlue}`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function EnergyWaveOverlay() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {[0, 1, 2].map((layer) => (
        <div
          key={layer}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `2px solid ${layer === 0 ? COLORS.neonBlue : layer === 1 ? COLORS.neonPurple : COLORS.cyan}`,
            opacity: 0.3 - layer * 0.1,
            transform: `scale(${1 + (frame + layer * 60) * 0.01})`,
            filter: 'blur(20px)',
          }}
        />
      ))}
    </AbsoluteFill>
  );
}

// ============================================
// SECCIÓN 5: CTA FINAL (21-25s)
// ============================================
function CTASection() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Explosión total de pantalla */}
      <Sequence name="Final Explosion" from={0} durationInFrames={60}>
        <ExplosiveTransition
          type="radial"
          color={COLORS.neonPurple}
          intensity={1.5}
          duration={60}
        />
      </Sequence>

      {/* CTA Container con logo y botones */}
      <Sequence name="CTA Content" from={30} durationInFrames={210}>
        <CTAContainer />
      </Sequence>

      {/* Partículas cayendo como lluvia luminosa */}
      <Sequence name="Particle Rain" from={180} durationInFrames={60}>
        <ParticleRain />
      </Sequence>

      {/* Glow final crescendo */}
      <Sequence name="Final Glow" from={180} durationInFrames={60}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at center, ${COLORS.neonBlue}40 0%, transparent 70%)`,
            opacity: interpolate(frame, [0, 60], [0, 1]),
          }}
        />
      </Sequence>

      {/* Freeze dramático en los últimos frames */}
      {frame >= 210 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'brightness(1.1)',
          }}
        />
      )}
    </AbsoluteFill>
  );
}

function ParticleRain() {
  const frame = useCurrentFrame();

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${(i * 37) % 100}%`,
            top: interpolate(frame, [0, 60], [-50, 100]),
            width: 2,
            height: 20 + (i % 3) * 15,
            background: `linear-gradient(to bottom, transparent, ${COLORS.neonBlue}${Math.floor(50 + (i % 2) * 50)})`,
            opacity: 0.5 + Math.sin(frame + i) * 0.3,
            transform: `skewX(${-10 + Math.sin(i) * 5}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// EFECTOS ADICIONALES
// ============================================

function FlareOverlay() {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Sequence key={i} name={`Flare ${i}`} from={i * 30} durationInFrames={240}>
          <FlareElement delay={i * 30} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

function FlareElement({ delay }: { delay: number }) {
  const frame = useCurrentFrame();
  
  return (
    <div
      style={{
        position: 'absolute',
        width: 200 + Math.random() * 100,
        height: 200 + Math.random() * 100,
        borderRadius: '50%',
        background: `radial-gradient(ellipse at center, ${COLORS.neonBlue}60 0%, transparent 70%)`,
        left: interpolate(frame, [delay, delay + 60], [-200, 1400], { easing: Easing.linear }),
        top: interpolate(frame, [delay, delay + 60], [Math.random() * 1920, Math.random() * 1920]),
        transform: `rotate(${Math.random() * 360}deg)`,
        filter: 'blur(30px)',
        opacity: 0.5,
      }}
    />
  );
}

function FlareCrossing({ interval }: { interval: number }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const flares = Math.floor(durationInFrames / interval);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: flares }).map((_, i) => {
        const startFrame = i * interval;
        const progress = Math.max(0, Math.min(1, (frame - startFrame) / 20));
        
        if (progress === 0 || progress >= 1) return null;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: interpolate(progress, [0, 1], [-200, 1400]),
              top: 50 + Math.random() * 1820,
              width: 50 + progress * 200,
              height: 10,
              background: `linear-gradient(90deg, transparent, ${COLORS.neonBlue}${Math.floor((1 - progress) * 100)}, transparent)`,
              transform: `rotate(${-5 + Math.random() * 10}deg)`,
              opacity: 0.8 * (1 - progress),
              filter: 'blur(10px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

// ============================================
// REGISTRO Y EXPORTACIÓN
// ============================================

registerRoot(() => (
  <Suspense fallback={<LoadingPlaceholder />}>
    <MainComposition />
  </Suspense>
));

export const RedCreativaProVideo = () => {
  return (
    <Composition
      id="redcreativa-pro"
      component={MainComposition}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{}}
    />
  );
};

export default RedCreativaProVideo;
