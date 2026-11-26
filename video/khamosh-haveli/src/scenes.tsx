import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, Easing} from 'remotion';
import {AMBER, BODY_FONT, Card, clamp, Dust, fadeInOut, flicker, Fog, GOLD, TITLE_FONT} from './fx';

/* ------------------------------------------------------------------ */
/* Shared drawings                                                     */
/* ------------------------------------------------------------------ */

const ClockFace: React.FC<{size: number; hour: number; minute: number; second: number; cracked?: boolean; glow?: number}> = ({
  size,
  hour,
  minute,
  second,
  cracked,
  glow = 0.4,
}) => {
  const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  const hand = (angle: number, len: number, w: number, color: string) => (
    <line x1={0} y1={0} x2={0} y2={-len} stroke={color} strokeWidth={w} strokeLinecap="round" transform={`rotate(${angle})`} />
  );
  return (
    <svg width={size} height={size} viewBox="-220 -220 440 440">
      <defs>
        <radialGradient id="face" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={`rgba(235,205,150,${0.55 + glow * 0.3})`} />
          <stop offset="70%" stopColor="rgba(120,85,45,0.9)" />
          <stop offset="100%" stopColor="rgba(30,18,8,1)" />
        </radialGradient>
      </defs>
      <circle r={212} fill="#1c1208" stroke="#6e5024" strokeWidth={10} />
      <circle r={196} fill="url(#face)" stroke="#3a2812" strokeWidth={3} />
      {numerals.map((n, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <text
            key={n}
            x={Math.sin(a) * 160}
            y={-Math.cos(a) * 160 + 10}
            textAnchor="middle"
            fontFamily="Cinzel, serif"
            fontWeight={700}
            fontSize={30}
            fill="#2a1a0a"
          >
            {n}
          </text>
        );
      })}
      {new Array(60).fill(0).map((_, i) => (
        <line key={i} x1={0} y1={-190} x2={0} y2={i % 5 === 0 ? -178 : -184} stroke="#2a1a0a" strokeWidth={i % 5 === 0 ? 3 : 1} transform={`rotate(${i * 6})`} />
      ))}
      {hand(hour * 30 + minute * 0.5, 95, 10, '#120a04')}
      {hand(minute * 6, 140, 6, '#120a04')}
      {hand(second * 6, 165, 2, '#7a1010')}
      <circle r={9} fill="#120a04" />
      {cracked ? (
        <g stroke="rgba(255,255,255,0.55)" strokeWidth={1.6} fill="none">
          <path d="M40 -30 L95 -110 L120 -150 M95 -110 L150 -95 M40 -30 L-20 -80 L-60 -170 M-20 -80 L-110 -60 M40 -30 L110 40 L170 70 M110 40 L90 130 M40 -30 L-40 60 L-130 120 M-40 60 L-30 170" />
        </g>
      ) : null}
      <circle r={196} fill="rgba(255,255,255,0.04)" />
    </svg>
  );
};

/** Haveli silhouette on a hill, with dimly lit windows. */
const Haveli: React.FC<{frame: number; ghostWindow?: number}> = ({frame, ghostWindow = 0}) => {
  const windows: {x: number; y: number; w: number; h: number}[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 9; c++) {
      windows.push({x: 600 + c * 82 + 15, y: 610 + r * 80, w: 36, h: 52});
    }
  }
  return (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      {/* hill */}
      <path d="M0 900 Q 500 740 960 760 Q 1450 740 1920 880 L1920 1080 L0 1080 Z" fill="#020507" />
      {/* main block */}
      <g fill="#03080b">
        <rect x={580} y={590} width={760} height={190} />
        <rect x={560} y={570} width={800} height={22} />
        {/* central tower + dome */}
        <rect x={860} y={450} width={200} height={140} />
        <path d="M850 455 Q 960 300 1070 455 Z" />
        <rect x={955} y={300} width={10} height={40} />
        <circle cx={960} cy={296} r={9} />
        {/* corner chhatris */}
        {[600, 1320].map((x) => (
          <g key={x}>
            <rect x={x - 32} y={520} width={8} height={52} />
            <rect x={x + 24} y={520} width={8} height={52} />
            <rect x={x - 40} y={512} width={80} height={10} />
            <path d={`M${x - 36} 514 Q ${x} 450 ${x + 36} 514 Z`} />
            <rect x={x - 2} y={440} width={4} height={18} />
          </g>
        ))}
        {/* small chhatris on the roof line */}
        {[720, 800, 1120, 1200].map((x) => (
          <g key={x}>
            <rect x={x - 18} y={548} width={36} height={24} />
            <path d={`M${x - 22} 550 Q ${x} 510 ${x + 22} 550 Z`} />
          </g>
        ))}
      </g>
      {/* windows: arched, mostly dark, a few with candle light */}
      {windows.map((w, i) => {
        const lit = random(`win${i}`) > 0.72;
        const isGhost = i === 13;
        const base = lit ? 0.55 * flicker(frame, i, 0.5) : 0.04;
        const o = isGhost ? Math.max(base, ghostWindow) : base;
        return (
          <g key={i}>
            <path
              d={`M${w.x} ${w.y + w.h} L${w.x} ${w.y + 14} Q ${w.x + w.w / 2} ${w.y - 8} ${w.x + w.w} ${w.y + 14} L${w.x + w.w} ${w.y + w.h} Z`}
              fill={isGhost && ghostWindow > 0.1 ? `rgba(210,230,235,${o})` : `rgba(255,170,80,${o})`}
            />
            {isGhost && ghostWindow > 0.1 ? (
              <path
                d={`M${w.x + w.w / 2 - 6} ${w.y + w.h} L${w.x + w.w / 2 - 7} ${w.y + 24} Q ${w.x + w.w / 2} ${w.y + 12} ${w.x + w.w / 2 + 7} ${w.y + 24} L${w.x + w.w / 2 + 6} ${w.y + w.h} Z`}
                fill="#000"
                opacity={ghostWindow}
              />
            ) : null}
          </g>
        );
      })}
      {/* door */}
      <path d="M930 780 L930 690 Q 960 655 990 690 L990 780 Z" fill={`rgba(255,150,60,${0.12 * flicker(frame, 99, 0.4)})`} />
    </svg>
  );
};

/** Pale ghostly woman silhouette (long hair, gown). */
const Ghost: React.FC<{opacity: number; scale?: number}> = ({opacity, scale = 1}) => (
  <svg width={220 * scale} height={560 * scale} viewBox="0 0 220 560" style={{opacity, filter: 'blur(1.5px) drop-shadow(0 0 25px rgba(200,230,240,0.7))'}}>
    <defs>
      <linearGradient id="gown" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(225,240,245,0.95)" />
        <stop offset="100%" stopColor="rgba(225,240,245,0)" />
      </linearGradient>
    </defs>
    <path d="M110 30 C 60 30 55 90 60 150 L 40 300 L 20 560 L 200 560 L 180 300 L 160 150 C 165 90 160 30 110 30 Z" fill="url(#gown)" />
    {/* long dark hair hiding the face */}
    <path d="M110 20 C 50 20 50 95 62 190 L 80 250 L 110 150 L 140 250 L 158 190 C 170 95 170 20 110 20 Z" fill="#05090b" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Scenes (each uses its local frame inside a <Sequence>)              */
/* ------------------------------------------------------------------ */

export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const beam = interpolate(f, [0, 40], [0, 1], clamp) * interpolate(f, [100, 120], [1, 0.3], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill
        style={{
          opacity: beam,
          background: 'linear-gradient(115deg, rgba(0,0,0,0) 30%, rgba(255,205,140,0.16) 45%, rgba(255,205,140,0.05) 55%, rgba(0,0,0,0) 65%)',
        }}
      />
      <AbsoluteFill style={{opacity: beam}}>
        <Dust count={90} rise={0.15} />
      </AbsoluteFill>
      <Card text="RAJASTHAN" sub="· 1 9 4 7 ·" from={20} to={118} size={64} />
    </AbsoluteFill>
  );
};

export const Desert: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 180], [1, 1.12], {...clamp, easing: Easing.inOut(Easing.quad)});
  const fadeIn = interpolate(f, [0, 25], [0, 1], clamp);
  const ghostWin = interpolate(f, [120, 130, 160, 166], [0, 0.9, 0.9, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000', opacity: fadeIn}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 62%'}}>
        <AbsoluteFill style={{background: 'linear-gradient(#01070c 0%, #07202b 55%, #0d2a33 75%, #05131a 100%)'}} />
        {/* stars */}
        {new Array(160).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: random(`sx${i}`) * 1920,
              top: random(`sy${i}`) * 560,
              width: 2,
              height: 2,
              borderRadius: 1,
              background: '#dfe8ea',
              opacity: 0.2 + 0.6 * Math.abs(Math.sin(f / 20 + i)),
            }}
          />
        ))}
        {/* moon */}
        <div
          style={{
            position: 'absolute',
            left: 1210,
            top: 150,
            width: 230,
            height: 230,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #fbf3df, #d8cbaa 60%, #a89a7a)',
            boxShadow: '0 0 120px 40px rgba(230,220,190,0.25), 0 0 300px 120px rgba(150,190,200,0.12)',
          }}
        />
        <Fog opacity={0.35} y={58} />
        <Haveli frame={f} ghostWindow={ghostWin} />
        <Fog opacity={0.55} y={80} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ClockScene: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 180], [1.0, 1.35], {...clamp, easing: Easing.inOut(Easing.quad)});
  // second hand frozen at 0 ... then one twitch backwards at f=150 (sound sync 15.0s)
  const sec = f < 150 ? 0 : f < 156 ? -1 : -1;
  const shake = f >= 150 && f < 156 ? (random(`cs${f}`) - 0.5) * 10 : 0;
  const o = fadeInOut(f, 0, 180, 14);
  return (
    <AbsoluteFill style={{background: '#050302', opacity: o, justifyContent: 'center', alignItems: 'center'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,170,80,0.22), rgba(0,0,0,0) 60%)'}} />
      <div style={{transform: `scale(${zoom}) translate(${shake}px, ${shake / 2}px) rotate(-4deg)`}}>
        <ClockFace size={720} hour={12} minute={0} second={sec} cracked glow={flicker(f, 3, 0.6)} />
      </div>
      <Dust count={40} rise={0.1} />
    </AbsoluteFill>
  );
};

export const Arrival: React.FC = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 120], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const spread = 60 + t * 560;
  const size = 40 + t * 520;
  const lightO = interpolate(f, [0, 20, 110, 125], [0, 1, 1, 0.15], clamp);
  const o = fadeInOut(f, 0, 180, 10);
  return (
    <AbsoluteFill style={{background: '#02080b', opacity: o}}>
      <AbsoluteFill style={{background: 'linear-gradient(#010406, #0a1d24 60%, #050d10)'}} />
      {/* light cones */}
      <AbsoluteFill style={{opacity: lightO * 0.55}}>
        <div
          style={{
            position: 'absolute',
            left: 960 - spread * 1.6,
            top: 560 - size * 0.5,
            width: spread * 3.2,
            height: size,
            background: 'radial-gradient(ellipse at center, rgba(255,240,210,0.6), rgba(255,240,210,0) 70%)',
            filter: 'blur(20px)',
          }}
        />
      </AbsoluteFill>
      {[-1, 1].map((s) => (
        <div
          key={s}
          style={{
            position: 'absolute',
            left: 960 + s * spread * 0.5 - size * 0.18,
            top: 600 - size * 0.18,
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: '50%',
            opacity: lightO,
            background: 'radial-gradient(circle, #ffffff 0%, rgba(255,245,220,0.9) 20%, rgba(255,230,180,0) 70%)',
          }}
        />
      ))}
      <Fog opacity={0.7} y={60} color="190,205,210" />
      <Fog opacity={0.5} y={78} />
      <Card text="RHEA" sub="journalist" from={45} to={170} size={72} />
    </AbsoluteFill>
  );
};

export const Corridor: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 240], [1, 1.55], {...clamp, easing: Easing.inOut(Easing.sin)});
  const o = fadeInOut(f, 0, 240, 14);
  // ghost: appears at far end (local 100 = 25.3s), vanishes, then reappears much closer (local 208 = 28.9s)
  const g1 = interpolate(f, [100, 104, 140, 143], [0, 0.85, 0.85, 0], clamp) * (f > 120 && f < 124 ? 0.2 : 1);
  const g2 = interpolate(f, [208, 210, 228, 230], [0, 0.95, 0.95, 0], clamp);
  const depths = [0, 1, 2, 3, 4, 5, 6, 7];
  const dark = f >= 143 && f < 150 ? 0.9 : 0; // candles blow out for a moment
  return (
    <AbsoluteFill style={{background: '#000', opacity: o}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 52%'}}>
        <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
          <defs>
            <linearGradient id="floor" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#2a1a0c" />
              <stop offset="100%" stopColor="#020101" />
            </linearGradient>
          </defs>
          <rect width="1920" height="1080" fill="#060403" />
          <path d="M0 1080 L860 600 L1060 600 L1920 1080 Z" fill="url(#floor)" />
          {/* receding arches */}
          {depths.map((d) => {
            const s = Math.pow(0.72, d);
            const w = 1700 * s;
            const h = 1000 * s;
            const x = 960 - w / 2;
            const y = 560 - h * 0.55;
            const shade = Math.round(40 * s + 6);
            return (
              <path
                key={d}
                d={`M${x} ${y + h} L${x} ${y + h * 0.3} Q ${960} ${y - h * 0.15} ${x + w} ${y + h * 0.3} L${x + w} ${y + h} L${x + w - 60 * s} ${y + h} L${x + w - 60 * s} ${y + h * 0.33} Q 960 ${y - h * 0.02} ${x + 60 * s} ${y + h * 0.33} L${x + 60 * s} ${y + h} Z`}
                fill={`rgb(${shade + 10},${shade},${shade - 4})`}
              />
            );
          })}
          <rect x={930} y={520} width={60} height={90} fill="#000" />
        </svg>
        {/* candles on both walls */}
        {depths.slice(0, 6).map((d) =>
          [-1, 1].map((side) => {
            const s = Math.pow(0.72, d);
            const x = 960 + side * 760 * s;
            const y = 600 - 150 * s;
            const fl = flicker(f, d * 2 + (side > 0 ? 1 : 0), 0.55) * (1 - dark);
            return (
              <div key={`${d}${side}`} style={{position: 'absolute', left: x, top: y}}>
                <div
                  style={{
                    position: 'absolute',
                    left: -260 * s,
                    top: -260 * s,
                    width: 520 * s,
                    height: 520 * s,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(255,160,70,${0.42 * fl}), rgba(255,120,40,0) 65%)`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: -7 * s,
                    top: -30 * s,
                    width: 14 * s,
                    height: 30 * s,
                    borderRadius: '50% 50% 45% 45%',
                    background: `rgba(255,${200 + 40 * fl},140,${fl})`,
                    boxShadow: `0 0 ${20 * s}px rgba(255,180,90,${fl})`,
                    transform: `scaleY(${0.85 + fl * 0.3}) rotate(${Math.sin(f / 3 + d) * 6}deg)`,
                  }}
                />
                <div style={{position: 'absolute', left: -6 * s, top: 0, width: 12 * s, height: 50 * s, background: '#d8ccb0'}} />
              </div>
            );
          })
        )}
        {/* ghost far */}
        <div style={{position: 'absolute', left: 960 - 33, top: 470}}>
          <Ghost opacity={g1} scale={0.3} />
        </div>
      </AbsoluteFill>
      {/* ghost close (outside the push so it feels right in front of camera) */}
      <div style={{position: 'absolute', left: 960 - 165, top: 230}}>
        <Ghost opacity={g2} scale={1.5} />
      </div>
      <AbsoluteFill style={{background: '#000', opacity: dark * 0.85}} />
      <Fog opacity={0.18} y={85} color="160,140,120" />
    </AbsoluteFill>
  );
};

/** Sepia photograph with a simple silhouette portrait. */
const Photo: React.FC<{w: number; h: number; kind: number; caption?: string; eyes?: number}> = ({w, h, kind, caption, eyes = 0}) => (
  <div
    style={{
      width: w,
      height: h,
      background: '#efe3c8',
      padding: w * 0.05,
      paddingBottom: w * 0.16,
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
      position: 'relative',
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at 50% 40%, #b89a6c, #6e5434 75%, #3d2c18)',
        position: 'relative',
        overflow: 'hidden',
        filter: 'sepia(0.6) contrast(1.1)',
      }}
    >
      <svg viewBox="0 0 100 120" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" style={{position: 'absolute', inset: 0}}>
        {kind === 0 ? (
          // family group
          <g fill="#2b1d0e">
            {[25, 50, 75].map((x, i) => (
              <g key={x}>
                <circle cx={x} cy={52 - (i === 1 ? 6 : 0)} r={8} />
                <path d={`M${x - 13} 120 L${x - 11} ${70 - (i === 1 ? 6 : 0)} Q ${x} ${60 - (i === 1 ? 6 : 0)} ${x + 11} ${70 - (i === 1 ? 6 : 0)} L${x + 13} 120 Z`} />
              </g>
            ))}
          </g>
        ) : kind === 1 ? (
          // the haveli itself
          <g fill="#2b1d0e">
            <rect x={10} y={70} width={80} height={50} />
            <rect x={38} y={52} width={24} height={20} />
            <path d="M36 54 Q 50 30 64 54 Z" />
          </g>
        ) : (
          // portrait of a woman — Rhea, 1947
          <g>
            <path d="M50 18 C 30 18 26 40 28 62 L 22 120 L 78 120 L 72 62 C 74 40 70 18 50 18 Z" fill="#1f150a" />
            <ellipse cx={50} cy={46} rx={14} ry={18} fill="#a6865a" />
            <path d="M20 120 Q 50 80 80 120 Z" fill="#3a2612" />
            <ellipse cx={44} cy={44} rx={2.6} ry={1.7} fill={eyes > 0 ? `rgb(${40 + 215 * eyes},${30 - 20 * eyes},${20 - 10 * eyes})` : '#24170a'} />
            <ellipse cx={56} cy={44} rx={2.6} ry={1.7} fill={eyes > 0 ? `rgb(${40 + 215 * eyes},${30 - 20 * eyes},${20 - 10 * eyes})` : '#24170a'} />
            <path d="M45 56 Q 50 58 55 56" stroke="#5a3d20" strokeWidth={0.9} fill="none" />
          </g>
        )}
      </svg>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55))'}} />
    </div>
    {caption ? (
      <div
        style={{
          position: 'absolute',
          bottom: w * 0.03,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: BODY_FONT,
          fontStyle: 'italic',
          fontSize: w * 0.075,
          color: '#3a2410',
        }}
      >
        {caption}
      </div>
    ) : null}
  </div>
);

export const Album: React.FC = () => {
  const f = useCurrentFrame();
  const o = fadeInOut(f, 0, 240, 14);
  const zoom = interpolate(f, [0, 240], [1, 1.25], clamp);
  // page flips at local 45, 105, 165 (31.5s, 33.5s, 35.5s)
  const flips = [45, 105, 165];
  const pages = [0, 1, 2];
  return (
    <AbsoluteFill style={{background: '#030201', opacity: o, justifyContent: 'center', alignItems: 'center', perspective: 2200}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 55%, rgba(255,160,70,${0.3 * flicker(f, 7, 0.7)}), rgba(0,0,0,0) 60%)`}} />
      <div style={{transform: `scale(${zoom}) rotateX(28deg)`, position: 'relative', width: 1300, height: 760, transformStyle: 'preserve-3d'}}>
        {/* book base */}
        <div style={{position: 'absolute', inset: -20, background: '#3b120c', borderRadius: 10, boxShadow: '0 40px 80px rgba(0,0,0,0.8)'}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: 650, height: 760, background: '#d8c9a5'}} />
        <div style={{position: 'absolute', left: 650, top: 0, width: 650, height: 760, background: '#ddcfab', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {/* final right page under all flips: blank, waiting */}
          <div style={{fontFamily: BODY_FONT, fontStyle: 'italic', fontSize: 40, color: 'rgba(60,30,10,0.35)'}}>?</div>
        </div>
        <div style={{position: 'absolute', left: 60, top: 110}}>
          <Photo w={520} h={460} kind={1} caption="Haveli, 1947" />
        </div>
        {pages.map((p) => {
          const start = flips[p];
          const rot = interpolate(f, [start, start + 26], [0, -180], {...clamp, easing: Easing.inOut(Easing.cubic)});
          return (
            <div
              key={p}
              style={{
                position: 'absolute',
                left: 650,
                top: 0,
                width: 650,
                height: 760,
                transformOrigin: '0% 50%',
                transform: `rotateY(${rot}deg) translateZ(${(3 - p) * 1}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <div style={{position: 'absolute', inset: 0, background: '#e2d4b0', backfaceVisibility: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'inset 20px 0 40px rgba(0,0,0,0.25)'}}>
                <Photo w={470} h={540} kind={p === 2 ? 2 : 0} caption={p === 0 ? 'Thakur parivaar' : p === 1 ? 'Diwali, 1946' : ''} />
              </div>
              <div style={{position: 'absolute', inset: 0, background: '#d5c6a0', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}} />
            </div>
          );
        })}
      </div>
      <Dust count={30} rise={0.08} />
    </AbsoluteFill>
  );
};

export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 180], [0.95, 1.22], {...clamp, easing: Easing.out(Easing.quad)});
  const flash = interpolate(f, [0, 3, 12], [1, 0.6, 0], clamp); // the BOOM at 38.0s
  const shake = f < 14 ? (random(`rs${f}`) - 0.5) * 24 : 0;
  const caption = interpolate(f, [20, 50], [0, 1], clamp);
  const eyes = interpolate(f, [75, 95], [0, 1], clamp); // eyes glow at 40.5s
  const turn = interpolate(f, [75, 95], [0, 1], clamp);
  const o = interpolate(f, [160, 180], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center', opacity: o, paddingBottom: 90}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse, rgba(255,150,60,0.18), rgba(0,0,0,0) 55%)'}} />
      <div style={{transform: `scale(${zoom}) translate(${shake}px, ${shake * 0.6}px) rotate(${-2 + turn * 1.5}deg)`, position: 'relative'}}>
        <Photo w={400} h={480} kind={2} eyes={eyes} />
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: BODY_FONT,
            fontStyle: 'italic',
            fontSize: 34,
            color: '#5a1a10',
            opacity: caption,
          }}
        >
          Rhea — 1947
        </div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.8, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: `rgba(120,0,0,${eyes * 0.18})`, mixBlendMode: 'multiply'}} />
    </AbsoluteFill>
  );
};

export const Montage: React.FC = () => {
  const f = useCurrentFrame();
  // hits at local 0, 45, 90, 135 (44s, 45.5s, 47s, 48.5s)
  const beat = Math.floor(f / 45);
  const inBeat = f % 45;
  const hitFlash = interpolate(inBeat, [0, 2, 8], [1, 0.5, 0], clamp);
  const spin = -f * 38; // clock spinning backwards
  const glitch = inBeat < 6 || (f > 150 && random(`g${f}`) > 0.6);
  const gx = glitch ? (random(`gx${f}`) - 0.5) * 40 : 0;
  const cards = [
    {text: 'KOI BHOOLA NAHI', at: 0},
    {text: 'KOI BACHA NAHI', at: 45},
  ];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* layer: spinning clock */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: beat === 0 || beat === 2 ? 1 : 0.25}}>
        <div style={{transform: `scale(${1.1 + (inBeat / 45) * 0.3}) translateX(${gx}px)`}}>
          <ClockFace size={760} hour={spin / 720} minute={spin / 60} second={spin} cracked glow={0.9} />
        </div>
      </AbsoluteFill>
      {/* layer: haveli flash */}
      {beat === 1 || beat === 3 ? (
        <AbsoluteFill style={{opacity: 0.85, transform: `scale(${1.3 + inBeat * 0.004}) translateX(${-gx}px)`, filter: 'contrast(1.4)'}}>
          <AbsoluteFill style={{background: 'linear-gradient(#01070c, #0d2a33)'}} />
          <Haveli frame={f} ghostWindow={beat === 3 ? 1 : 0} />
          <Fog opacity={0.6} y={80} />
        </AbsoluteFill>
      ) : null}
      {/* RGB split glitch */}
      {glitch ? (
        <>
          <AbsoluteFill style={{background: 'rgba(255,0,40,0.12)', transform: `translateX(${gx}px)`, mixBlendMode: 'screen'}} />
          <AbsoluteFill style={{background: 'rgba(0,200,255,0.10)', transform: `translateX(${-gx}px)`, mixBlendMode: 'screen'}} />
          {new Array(6).fill(0).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: random(`gl${f}-${i}`) * 1080,
                height: 4 + random(`gh${f}-${i}`) * 30,
                background: 'rgba(255,255,255,0.08)',
                transform: `translateX(${(random(`gt${f}-${i}`) - 0.5) * 200}px)`,
              }}
            />
          ))}
        </>
      ) : null}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 45%)', opacity: f < 90 ? interpolate(inBeat, [0, 6, 38, 44], [0, 1, 1, 0], clamp) : 0}} />
      {cards.map((c) => (
        <Card key={c.text} text={c.text} from={c.at + 4} to={c.at + 42} size={78} />
      ))}
      <AbsoluteFill style={{background: '#fff', opacity: hitFlash * 0.7}} />
    </AbsoluteFill>
  );
};

/** 1 second: silence, then a face lunges at the camera. */
export const JumpScare: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 12) return <AbsoluteFill style={{background: '#000'}} />;
  const t = f - 12;
  const scale = interpolate(t, [0, 4, 18], [0.6, 1.25, 1.45], clamp);
  const sx = (random(`js${f}`) - 0.5) * 60;
  const sy = (random(`jy${f}`) - 0.5) * 40;
  return (
    <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
      <svg
        width={1100}
        height={1300}
        viewBox="0 0 200 240"
        style={{transform: `scale(${scale}) translate(${sx}px, ${sy}px)`, filter: 'contrast(1.6) brightness(1.1)'}}
      >
        <defs>
          <radialGradient id="skin" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#e7ece8" />
            <stop offset="70%" stopColor="#8c9a98" />
            <stop offset="100%" stopColor="#1a2122" />
          </radialGradient>
        </defs>
        {/* hair */}
        <path d="M100 0 C 20 0 0 80 10 240 L 190 240 C 200 80 180 0 100 0 Z" fill="#030505" />
        {/* face */}
        <ellipse cx={100} cy={115} rx={58} ry={78} fill="url(#skin)" />
        {/* hollow eyes */}
        <ellipse cx={76} cy={98} rx={15} ry={19} fill="#000" />
        <ellipse cx={124} cy={98} rx={15} ry={19} fill="#000" />
        <circle cx={76} cy={100} r={2.6} fill="#ff2a1a" />
        <circle cx={124} cy={100} r={2.6} fill="#ff2a1a" />
        {/* screaming mouth */}
        <ellipse cx={100} cy={160} rx={17} ry={30} fill="#000" />
        {/* hair strands over face */}
        <path d="M60 30 C 55 90 62 150 58 220 M140 30 C 146 90 138 150 144 220 M85 20 C 80 60 84 90 82 120" stroke="#030505" strokeWidth={6} fill="none" />
      </svg>
      <AbsoluteFill style={{background: 'rgba(150,0,0,0.25)', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: '#fff', opacity: t < 2 ? 0.6 : 0}} />
    </AbsoluteFill>
  );
};

export const Title: React.FC = () => {
  const f = useCurrentFrame();
  const slam = interpolate(f, [0, 8], [1.35, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const o = interpolate(f, [0, 4, 135, 150], [0, 1, 1, 0], clamp);
  const sweep = interpolate(f, [20, 90], [-30, 130], clamp);
  const track = interpolate(f, [0, 150], [34, 22]);
  const shake = f < 10 ? (random(`ts${f}`) - 0.5) * 18 : 0;
  return (
    <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(170,80,20,0.25), rgba(0,0,0,0) 60%)', opacity: o}} />
      <Dust count={110} color="255,150,60" rise={1.4} />
      <div style={{opacity: o, transform: `scale(${slam}) translate(${shake}px, ${shake / 2}px)`, textAlign: 'center'}}>
        <div
          style={{
            fontFamily: TITLE_FONT,
            fontWeight: 900,
            fontSize: 150,
            letterSpacing: track,
            lineHeight: 1,
            backgroundImage: `linear-gradient(100deg, #6b4515 0%, ${GOLD} ${sweep - 15}%, #fff3d6 ${sweep}%, ${GOLD} ${sweep + 15}%, #6b4515 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(255,140,40,0.35))',
          }}
        >
          KHAMOSH
        </div>
        <div
          style={{
            fontFamily: TITLE_FONT,
            fontWeight: 700,
            fontSize: 96,
            letterSpacing: track * 1.3,
            marginTop: 8,
            color: AMBER,
            opacity: 0.9,
            textShadow: '0 0 30px rgba(255,140,40,0.4)',
          }}
        >
          HAVELI
        </div>
        <div style={{width: 600, height: 2, margin: '28px auto 0', background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`}} />
      </div>
    </AbsoluteFill>
  );
};

export const Final: React.FC = () => {
  const f = useCurrentFrame();
  // a door slowly closing: a sliver of candlelight narrowing to nothing
  const gap = interpolate(f, [0, 80], [260, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  const soon = interpolate(f, [86, 96, 116, 120], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div
        style={{
          position: 'absolute',
          left: 960 - gap / 2,
          top: 200,
          width: gap,
          height: 700,
          background: `linear-gradient(90deg, rgba(255,150,60,0.15), rgba(255,190,110,${0.6 * flicker(f, 5, 0.7)}), rgba(255,150,60,0.15))`,
          boxShadow: `0 0 ${gap / 2}px rgba(255,150,60,0.4)`,
        }}
      />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: soon}}>
        <div style={{fontFamily: TITLE_FONT, fontWeight: 700, fontSize: 44, letterSpacing: 20, color: '#cdbb98'}}>COMING SOON</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
