# 🎬 Red Creativa Pro - Remotion Video Project

Professional TikTok/Reels vertical video (25 seconds, 1080x1920, 60 FPS) for promoting Red Creativa Pro AI writing tool.

## 📁 Project Structure

```
app/remotion-pro/
├── index.tsx                    # Main composition (1500 frames @ 60fps)
├── components/
│   ├── AnimatedText.tsx         # Multi-layer text animations
│   ├── ParticleField.tsx        # Particle systems (3-4 layers)
│   ├── NeonGlow.tsx              # Neon glow effects
│   ├── CameraLayer.tsx           # Camera movements (pan, tilt, zoom)
│   ├── ExplosiveTransition.tsx    # Explosive transitions
│   ├── DynamicCard.tsx           # Animated benefit cards
│   ├── DemoEditor.tsx            # AI editor simulation
│   └── CTAContainer.tsx         # Final CTA section
├── utils/
│   ├── animations.ts            # Spring configs & easing curves
│   └── effects.tsx             # Pre-built effects
├── animations.css               # CSS animations
├── remotion.config.ts          # Remotion configuration
└── package.json                # Dependencies
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Remotion Studio (preview)
npm run dev

# Render video
npm run render

# Generate still frame
npm run still
```

## 📐 Video Specs

- **Duration:** 25 seconds (1500 frames)
- **FPS:** 60
- **Resolution:** 1080x1920 (vertical TikTok/Reels)
- **Codec:** H.264 with CRF 18

## 🎨 Sections Breakdown

| Time | Frames | Section | Key Elements |
|------|--------|---------|--------------|
| 0-4s | 0-240 | Hook | Explosive particles, multi-layer text reveal |
| 4-9s | 240-540 | Solution | Logo overshoot, rapid text sequence |
| 9-16s | 540-960 | Benefits | 5 animated cards, parallax effects |
| 16-21s | 960-1260 | Demo | Editor simulation, typing effects |
| 21-25s | 1260-1500 | CTA | Logo pulse, URL reveal, particle rain |

## 🎛️ Animation System

### Spring Configs
```typescript
springConfig = {
  gentle:   { damping: 30,  stiffness: 80 },
  bouncy:   { damping: 15,  stiffness: 120 },
  snappy:   { damping: 18,  stiffness: 150 },
  smooth:   { damping: 25,  stiffness: 100 },
  explosive:{ damping: 12,  stiffness: 180 },
}
```

### Easing Curves
- `easeOutBack` - Overshoot effect
- `easeInOutExpo` - Smooth exponential
- `smoothStep` - Natural ease
- `elasticOut` - Elastic bounce

## 🎨 Color Palette

```javascript
const COLORS = {
  background: '#050510',
  neonBlue:   '#00D4FF',
  neonPurple:  '#B700FF',
  cyan:        '#00FFFF',
  white:       '#FFFFFF',
  accent1:     '#FF0066',
  accent2:     '#FF9900',
}
```

## 🧩 Components Usage

### AnimatedText
```tsx
<AnimatedText
  text={['Line 1', 'Line 2']}
  type="reveal"
  animationStyle="letterByLetter"
  accentColor="#00D4FF"
  fontSize={72}
  fontFamily="Montserrat Black"
  duration={60}
  glowIntensity={1.5}
/>
```

### ParticleField
```tsx
<ParticleField
  particleCount={50}
  layers={3}
  colors={['#00D4FF', '#B700FF']}
  speed="fast"
  orbitRadius={300}
/>
```

## ⚠️ Notes

- Requires Remotion 4.x with proper `zod@3.22.3` version
- Render may take several minutes on CPU
- For GPU acceleration, use Remotion Cloud or deploy to Vercel

## 🎬 Render Command

```bash
remotion render app/remotion-pro/index.tsx redcreativa-pro public/videos/redcreativa-pro.mp4
```

## 📝 Script Execution

```bash
# For video-generator script
cd video-generator
npx tsx professional-video.ts
```
