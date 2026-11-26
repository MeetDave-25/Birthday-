import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Card, clamp, Dust, Fog} from './fx';

const src = (id: string) => staticFile(`plates/${id}.jpg`);

/** A rendered 3D plate with a slow camera move (scale + drift). */
const Plate: React.FC<{
  id: string;
  from?: number;
  to?: number;
  zoom?: [number, number];
  pan?: [number, number];
  panY?: [number, number];
  origin?: string;
  opacity?: number;
  filter?: string;
  shake?: number;
  dur?: number;
}> = ({id, zoom = [1, 1.08], pan = [0, 0], panY = [0, 0], origin = '50% 50%', opacity = 1, filter, shake = 0, dur = 180}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  const s = zoom[0] + (zoom[1] - zoom[0]) * t;
  const x = pan[0] + (pan[1] - pan[0]) * t + (shake ? (random(`sx${f}${id}`) - 0.5) * shake : 0);
  const y = panY[0] + (panY[1] - panY[0]) * t + (shake ? (random(`sy${f}${id}`) - 0.5) * shake * 0.6 : 0);
  // handheld micro-drift so stills never feel frozen
  const hx = Math.sin(f / 41) * 3 + Math.sin(f / 17) * 1.2;
  const hy = Math.cos(f / 37) * 2 + Math.sin(f / 23) * 0.8;
  return (
    <AbsoluteFill style={{opacity, overflow: 'hidden'}}>
      <Img
        src={src(id)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate(${x + hx}px, ${y + hy}px) scale(${s})`,
          transformOrigin: origin,
          filter,
        }}
      />
    </AbsoluteFill>
  );
};

/** Candle flicker: crossfade bright/dim renders of the same shot. */
const candle = (f: number, seed = 1) =>
  Math.min(1, Math.max(0, 0.55 + 0.25 * Math.sin(f * 0.83 + seed) + 0.3 * (random(`cf${seed}-${Math.floor(f / 2)}`) - 0.5)));

export const DesertP: React.FC = () => {
  const f = useCurrentFrame();
  const fadeIn = interpolate(f, [0, 30], [0, 1], clamp);
  const ghost = interpolate(f, [118, 124, 158, 166], [0, 1, 1, 0], clamp);
  const common = {zoom: [1.02, 1.16] as [number, number], panY: [20, -10] as [number, number], origin: '52% 45%', dur: 180};
  return (
    <AbsoluteFill style={{background: '#000', opacity: fadeIn}}>
      <Plate id="ext" {...common} filter={`brightness(${0.95 + 0.05 * candle(f)})`} />
      <Plate id="ext-ghost" {...common} opacity={ghost} />
      <Fog opacity={0.32} y={74} color="150,175,190" />
      <Fog opacity={0.25} y={88} color="120,140,150" />
    </AbsoluteFill>
  );
};

export const ClockP: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 14, 166, 180], [0, 1, 1, 0], clamp);
  const twitch = f >= 150;
  const sh = f >= 150 && f < 158 ? 14 : 0;
  return (
    <AbsoluteFill style={{background: '#000', opacity: o}}>
      <Plate id={twitch ? 'clock-b' : 'clock-a'} zoom={[1.0, 1.22]} origin="50% 48%" shake={sh} filter={`brightness(${0.9 + 0.12 * candle(f, 3)})`} />
      <Dust count={30} rise={0.08} />
    </AbsoluteFill>
  );
};

export const ArrivalP: React.FC = () => {
  const f = useCurrentFrame();
  const lights = interpolate(f, [0, 10, 40], [0, 0.3, 1], clamp);
  const o = interpolate(f, [166, 180], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000', opacity: o}}>
      <Plate id="gate" zoom={[1.0, 1.1]} origin="50% 40%" opacity={lights} filter={`brightness(${0.85 + 0.15 * lights})`} />
      {/* headlight beams through fog */}
      <AbsoluteFill
        style={{
          opacity: 0.35 * lights,
          background:
            'radial-gradient(ellipse 40% 70% at 44% 100%, rgba(255,240,210,0.45), rgba(0,0,0,0) 70%), radial-gradient(ellipse 40% 70% at 58% 100%, rgba(255,240,210,0.45), rgba(0,0,0,0) 70%)',
          mixBlendMode: 'screen',
        }}
      />
      <Fog opacity={0.45} y={70} color="190,200,205" />
      <Card text="RHEA" sub="journalist" from={50} to={170} size={72} />
    </AbsoluteFill>
  );
};

export const CorridorP: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 14, 230, 240], [0, 1, 1, 0], clamp);
  const common = {zoom: [1.0, 1.32] as [number, number], origin: '50% 50%', dur: 240};
  const ghostFar = interpolate(f, [100, 104, 140, 143], [0, 1, 1, 0], clamp) * (f > 120 && f < 124 ? 0.15 : 1);
  const dark = f >= 143 && f < 152;
  const near = f >= 208 && f < 230;
  return (
    <AbsoluteFill style={{background: '#000', opacity: o}}>
      <Plate id="corr-dim" {...common} />
      <Plate id="corr-bright" {...common} opacity={candle(f, 5)} />
      <Plate id="corr-ghost-far" {...common} opacity={ghostFar} />
      {dark ? <Plate id="corr-dark" {...common} /> : null}
      {near ? <Plate id="corr-ghost-near" zoom={[1.15, 1.3]} dur={22} shake={18} /> : null}
      <Fog opacity={0.16} y={82} color="160,130,100" />
      <Dust count={25} rise={0.06} />
    </AbsoluteFill>
  );
};

export const AlbumP: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 14, 226, 240], [0, 1, 1, 0], clamp);
  // page turns at local 45 and 105 (sound sync); third push towards the portrait
  const whip = (at: number) => interpolate(f, [at - 6, at, at + 6], [0, 1, 0], clamp);
  const w = Math.max(whip(45), whip(105));
  const second = f >= 45;
  const finalPush = interpolate(f, [150, 240], [1, 1.6], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: '#000', opacity: o}}>
      <AbsoluteFill style={{transform: `scale(${finalPush}) translateX(${-w * 120}px)`, transformOrigin: '72% 52%', filter: `blur(${w * 10}px)`}}>
        <Plate id={second ? 'album-2' : 'album-1'} zoom={[1.0, 1.06]} filter={`brightness(${0.9 + 0.12 * candle(f, 7)})`} dur={240} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: w * 0.6}} />
    </AbsoluteFill>
  );
};

export const RevealP: React.FC = () => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [0, 3, 14], [1, 0.6, 0], clamp);
  const eyes = interpolate(f, [75, 95], [0, 1], clamp);
  const o = interpolate(f, [160, 180], [1, 0], clamp);
  const common = {zoom: [1.0, 1.28] as [number, number], origin: '50% 45%', dur: 180, shake: f < 14 ? 26 : 0};
  return (
    <AbsoluteFill style={{background: '#000', opacity: o}}>
      <Plate id="photo" {...common} filter={`brightness(${0.92 + 0.1 * candle(f, 9)})`} />
      <Plate id="photo-eyes" {...common} opacity={eyes} />
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.75, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: `rgba(120,0,0,${eyes * 0.2})`, mixBlendMode: 'multiply'}} />
    </AbsoluteFill>
  );
};

export const MontageP: React.FC = () => {
  const f = useCurrentFrame();
  const beat = Math.floor(f / 45);
  const inBeat = f % 45;
  const hitFlash = interpolate(inBeat, [0, 2, 8], [1, 0.5, 0], clamp);
  const ids = ['clock-b', 'ext-ghost', 'corr-ghost-far', 'photo-eyes'];
  // sub-cuts inside each beat for frantic energy
  const sub = Math.floor(inBeat / 11);
  const id = sub % 2 === 0 ? ids[beat % 4] : ids[(beat + 2) % 4];
  const glitch = inBeat < 6 || random(`g${f}`) > 0.75;
  const gx = glitch ? (random(`gx${f}`) - 0.5) * 50 : 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Plate id={id} zoom={[1.15, 1.45]} dur={45} shake={glitch ? 20 : 4} filter="contrast(1.25) saturate(0.8)" />
      {glitch ? (
        <>
          <AbsoluteFill style={{background: 'rgba(255,0,40,0.14)', transform: `translateX(${gx}px)`, mixBlendMode: 'screen'}} />
          <AbsoluteFill style={{background: 'rgba(0,200,255,0.1)', transform: `translateX(${-gx}px)`, mixBlendMode: 'screen'}} />
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
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 45%)', opacity: f < 90 ? interpolate(inBeat, [0, 6, 38, 44], [0, 1, 1, 0], clamp) : 0}} />
      <Card text="KOI BHOOLA NAHI" from={4} to={42} size={78} />
      <Card text="KOI BACHA NAHI" from={49} to={87} size={78} />
      <AbsoluteFill style={{background: '#fff', opacity: hitFlash * 0.6}} />
    </AbsoluteFill>
  );
};

export const JumpScareP: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 12) return <AbsoluteFill style={{background: '#000'}} />;
  const t = f - 12;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Plate id="corr-ghost-near" zoom={[1.5, 2.3]} origin="51% 42%" dur={18} shake={60} filter="contrast(1.6) brightness(1.3)" />
      <AbsoluteFill style={{background: 'rgba(150,0,0,0.3)', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: '#fff', opacity: t < 2 ? 0.7 : 0}} />
    </AbsoluteFill>
  );
};

export const TitleP: React.FC = () => {
  const f = useCurrentFrame();
  const slam = interpolate(f, [0, 8], [1.25, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const o = interpolate(f, [0, 4, 135, 150], [0, 1, 1, 0], clamp);
  const shimmer = interpolate(f, [10, 110], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  const shake = f < 10 ? (random(`ts${f}`) - 0.5) * 18 : 0;
  return (
    <AbsoluteFill style={{background: '#000', opacity: o}}>
      <AbsoluteFill style={{transform: `scale(${slam}) translate(${shake}px, ${shake / 2}px)`}}>
        <Plate id="title-a" zoom={[1.0, 1.06]} dur={150} />
        <Plate id="title-b" zoom={[1.0, 1.06]} dur={150} opacity={shimmer} />
      </AbsoluteFill>
      <Dust count={110} color="255,150,60" rise={1.4} />
    </AbsoluteFill>
  );
};

export const FinalP: React.FC = () => {
  const f = useCurrentFrame();
  const gap = interpolate(f, [0, 80], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  const soon = interpolate(f, [86, 96, 116, 120], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* the corridor seen through a closing door */}
      <AbsoluteFill style={{clipPath: `inset(0 ${50 - gap * 22}% 0 ${50 - gap * 22}%)`}}>
        <Plate id="corr-dim" zoom={[1.3, 1.4]} dur={80} />
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: soon}}>
        <div style={{fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 44, letterSpacing: 20, color: '#cdbb98'}}>COMING SOON</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
