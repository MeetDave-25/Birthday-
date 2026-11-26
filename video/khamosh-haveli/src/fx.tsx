import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import {NARRATION} from './timeline';

export const TITLE_FONT = 'Cinzel, serif';
export const BODY_FONT = '"Cormorant Garamond", serif';
export const GOLD = '#d9a75a';
export const AMBER = '#f3c27a';
export const TEAL_DARK = '#04141a';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Candle-like flicker in [lo,1], deterministic per seed. */
export const flicker = (frame: number, seed: number, lo = 0.75) => {
  const a = Math.sin(frame * 0.9 + seed * 7) * 0.5 + 0.5;
  const b = random(`f-${seed}-${Math.floor(frame / 2)}`);
  return lo + (1 - lo) * (0.6 * a + 0.4 * b);
};

export const fadeInOut = (frame: number, from: number, to: number, fade = 12) =>
  interpolate(frame, [from, from + fade, to - fade, to], [0, 1, 1, 0], clamp);

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.14}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 60} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.85}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

export const Letterbox: React.FC = () => {
  const bar = 131; // 2.35:1 inside 16:9
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: bar, background: '#000'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: bar, background: '#000'}} />
    </AbsoluteFill>
  );
};

/** Teal-shadow / amber-highlight film grade over everything. */
export const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'rgba(0,40,50,0.18)', mixBlendMode: 'multiply', pointerEvents: 'none'}} />
    <AbsoluteFill style={{background: 'rgba(255,170,80,0.06)', mixBlendMode: 'screen', pointerEvents: 'none'}} />
  </>
);

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const line = NARRATION.find((l) => frame >= l.from && frame < l.to);
  if (!line) return null;
  const o = fadeInOut(frame, line.from, line.to, 10);
  const drift = interpolate(frame, [line.from, line.to], [6, -6]);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 170, pointerEvents: 'none'}}>
      <div
        style={{
          fontFamily: BODY_FONT,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: line.whisper ? 50 : 56,
          letterSpacing: line.whisper ? 6 : 1.5,
          color: line.whisper ? '#c9d6d8' : '#f1e2c4',
          opacity: o * (line.whisper ? 0.55 + 0.3 * Math.sin(frame * 0.5) : 1),
          transform: `translateY(${drift}px)`,
          textShadow: '0 0 18px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,1)',
          filter: line.whisper ? 'blur(0.6px)' : undefined,
        }}
      >
        {line.text}
      </div>
    </AbsoluteFill>
  );
};

/** Slowly drifting fog banks. */
export const Fog: React.FC<{opacity?: number; color?: string; y?: number}> = ({opacity = 0.5, color = '170,195,200', y = 70}) => {
  const frame = useCurrentFrame();
  const banks = [0, 1, 2, 3, 4];
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      {banks.map((i) => {
        const speed = 0.4 + random(`fog-s${i}`) * 0.8;
        const x = ((random(`fog-x${i}`) * 2400 + frame * speed) % 2800) - 600;
        const top = y + (random(`fog-y${i}`) - 0.5) * 22;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 700,
              top: `${top}%`,
              width: 1400,
              height: 420,
              borderRadius: '50%',
              background: `radial-gradient(ellipse at center, rgba(${color},0.55) 0%, rgba(${color},0) 70%)`,
              filter: 'blur(30px)',
              transform: 'translateY(-50%)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Dust motes floating in a light beam. */
export const Dust: React.FC<{count?: number; color?: string; rise?: number}> = ({count = 70, color = '255,225,170', rise = 0.3}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`dx${i}`) * 1920 + Math.sin(frame / 40 + i) * 20;
        const y = ((random(`dy${i}`) * 1080 - frame * rise * (0.5 + random(`dr${i}`))) % 1080 + 1080) % 1080;
        const s = 1 + random(`ds${i}`) * 3.5;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame / 15 + i * 3));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: '50%',
              background: `rgba(${color},${0.8 * tw})`,
              boxShadow: `0 0 ${s * 3}px rgba(${color},0.8)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Card: React.FC<{text: string; from: number; to: number; size?: number; sub?: string}> = ({text, from, to, size = 54, sub}) => {
  const frame = useCurrentFrame();
  const o = fadeInOut(frame, from, to, 14);
  const track = interpolate(frame, [from, to], [18, 10]);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: o, pointerEvents: 'none'}}>
      <div style={{fontFamily: TITLE_FONT, fontWeight: 700, fontSize: size, letterSpacing: track, color: '#e9dcc2', textShadow: '0 0 30px rgba(0,0,0,1)'}}>
        {text}
      </div>
      {sub ? (
        <div style={{fontFamily: BODY_FONT, fontStyle: 'italic', fontSize: 30, letterSpacing: 6, color: GOLD, marginTop: 14}}>{sub}</div>
      ) : null}
    </AbsoluteFill>
  );
};
