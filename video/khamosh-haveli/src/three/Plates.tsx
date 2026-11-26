import React, {useEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {continueRender, delayRender, random, staticFile, useVideoConfig} from 'remotion';
import {useThree} from '@react-three/fiber';
import {EffectComposer, Bloom, Vignette, DepthOfField} from '@react-three/postprocessing';
import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader.js';
import {TTFLoader} from 'three/examples/jsm/loaders/TTFLoader.js';
import {Font} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import nightHdr from '@pmndrs/assets/hdri/night.exr.js';
import sunsetHdr from '@pmndrs/assets/hdri/sunset.exr.js';
import {CameraRig, ghostTexture, stoneTextures} from './materials';
import {clockFaceTexture, crackedGlassTexture, familyPhotoTexture, imagePhotoTexture, paperTexture, portraitTexture, woodTexture} from './textures';

export type PlateId =
  | 'ext'
  | 'ext-ghost'
  | 'gate'
  | 'clock-a'
  | 'clock-b'
  | 'corr-bright'
  | 'corr-dim'
  | 'corr-ghost-far'
  | 'corr-ghost-near'
  | 'corr-dark'
  | 'album-1'
  | 'album-2'
  | 'photo'
  | 'photo-eyes'
  | 'title-a'
  | 'title-b';

export const PLATES: PlateId[] = [
  'ext', 'ext-ghost', 'gate', 'clock-a', 'clock-b', 'corr-bright', 'corr-dim', 'corr-ghost-far', 'corr-ghost-near', 'corr-dark',
  'album-1', 'album-2', 'photo', 'photo-eyes', 'title-a', 'title-b',
];

/* ------------------------------------------------------------- async helpers */
const useAsync = <T,>(fn: () => Promise<T>, label: string): T | null => {
  const [value, setValue] = useState<T | null>(null);
  const [handle] = useState(() => delayRender(label, {timeoutInMilliseconds: 120000}));
  useEffect(() => {
    fn().then((v) => {
      setValue(v);
      continueRender(handle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
};

const useEnv = (url: string) =>
  useAsync(
    () =>
      new Promise<THREE.DataTexture>((res) =>
        new EXRLoader().load(url, (t) => {
          t.mapping = THREE.EquirectangularReflectionMapping;
          res(t);
        })
      ),
    'hdri'
  );

const Env: React.FC<{url: string; intensity: number; rotation?: number; background?: boolean}> = ({url, intensity, rotation = 0, background}) => {
  const env = useEnv(url);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    if (!env) return;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    scene.environmentRotation.set(0, rotation, 0);
    if (background) scene.background = env;
  }, [env, scene, intensity, rotation, background]);
  return null;
};

/* ------------------------------------------------------------- haveli model */
const sandstone = (seed: number, repeatX: number, repeatY = 1, tint = '#d9b58a') => {
  const t = stoneTextures(seed, 1);
  [t.map, t.normal, t.rough].forEach((m) => m.repeat.set(repeatX, repeatY));
  return new THREE.MeshStandardMaterial({map: t.map, normalMap: t.normal, roughnessMap: t.rough, color: tint, normalScale: new THREE.Vector2(1.3, 1.3)});
};

const archShape = (w: number, h: number) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h - w / 2);
  s.quadraticCurveTo(-w / 2, h + w * 0.1, 0, h + w * 0.25);
  s.quadraticCurveTo(w / 2, h + w * 0.1, w / 2, h - w / 2);
  s.lineTo(w / 2, 0);
  s.lineTo(-w / 2, 0);
  return s;
};

const Dome: React.FC<{r: number; pos: [number, number, number]; mat: THREE.Material; stretch?: number}> = ({r, pos, mat, stretch = 1.25}) => (
  <group position={pos}>
    <mesh material={mat} scale={[1, stretch, 1]} castShadow receiveShadow>
      <sphereGeometry args={[r, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
    </mesh>
    <mesh position={[0, r * stretch + r * 0.15, 0]} castShadow>
      <coneGeometry args={[r * 0.08, r * 0.45, 12]} />
      <meshStandardMaterial color="#6a5030" metalness={0.6} roughness={0.5} />
    </mesh>
  </group>
);

const Chhatri: React.FC<{pos: [number, number, number]; size: number; mat: THREE.Material}> = ({pos, size, mat}) => (
  <group position={pos}>
    {[-1, 1].flatMap((x) =>
      [-1, 1].map((z) => (
        <mesh key={`${x}${z}`} material={mat} position={[x * size * 0.4, size * 0.5, z * size * 0.4]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.07, size, 10]} />
        </mesh>
      ))
    )}
    <mesh material={mat} position={[0, size + size * 0.06, 0]} castShadow>
      <boxGeometry args={[size * 1.1, size * 0.12, size * 1.1]} />
    </mesh>
    <Dome r={size * 0.5} pos={[0, size * 1.12, 0]} mat={mat} />
  </group>
);

/**
 * Rajasthani haveli: plinth, two storeys of arched windows, jharokha balconies, crenellated parapet,
 * central domed tower and corner chhatris. Front face at z = +6.
 */
const Haveli: React.FC<{lit: number[]; ghostWindow?: boolean; doorGlow?: number}> = ({lit, ghostWindow, doorGlow = 1}) => {
  const wall = useMemo(() => sandstone(3, 6, 2), []);
  const trim = useMemo(() => sandstone(9, 2, 1, '#e2c296'), []);
  const ghostTex = useMemo(() => ghostTexture(), []);
  const win = useMemo(() => new THREE.ShapeGeometry(archShape(1.3, 2.2)), []);
  const frame = useMemo(() => {
    const outer = archShape(1.8, 2.5);
    outer.holes.push(archShape(1.3, 2.2) as unknown as THREE.Path);
    return new THREE.ExtrudeGeometry(outer, {depth: 0.25, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2});
  }, []);
  const cols = 9;
  const windows: {x: number; y: number; i: number}[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 && c === 4) continue; // main door position
      windows.push({x: (c - (cols - 1) / 2) * 3.1, y: 3.2 + r * 4.4, i: r * cols + c});
    }
  }
  return (
    <group>
      {/* plinth + steps */}
      <mesh material={trim} position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[32, 1.2, 14]} />
      </mesh>
      {[0, 1, 2, 3].map((s) => (
        <mesh key={s} material={trim} position={[0, 0.15 + s * 0.3 - 0.3, 7.6 + (3 - s) * 0.5]} receiveShadow castShadow>
          <boxGeometry args={[5, 0.3, 1 + (3 - s) * 0.0]} />
        </mesh>
      ))}
      {/* main block */}
      <mesh material={wall} position={[0, 6.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 10, 12]} />
      </mesh>
      {/* cornices */}
      {[5.6, 10.1, 11.3].map((y) => (
        <mesh key={y} material={trim} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[30.8, 0.35, 12.8]} />
        </mesh>
      ))}
      {/* crenellated parapet */}
      {new Array(31).fill(0).map((_, i) => (
        <mesh key={i} material={trim} position={[-15 + i, 11.9, 6.1]} castShadow>
          <boxGeometry args={[0.55, 0.9, 0.5]} />
        </mesh>
      ))}
      {/* windows */}
      {windows.map(({x, y, i}) => {
        const isLit = lit.includes(i);
        const isGhost = ghostWindow && i === 13;
        return (
          <group key={i} position={[x, y, 6.02]}>
            <mesh geometry={frame} material={trim} castShadow receiveShadow />
            <mesh geometry={win} position={[0, 0, 0.01]}>
              <meshStandardMaterial
                color="#050302"
                emissive={isGhost ? '#bcd8e6' : isLit ? '#ff9640' : '#000'}
                emissiveIntensity={isGhost ? 2.2 : isLit ? 0.7 + 0.5 * random(`wl${i}`) : 0}
                roughness={0.4}
              />
            </mesh>
            {isGhost ? (
              <mesh position={[0, 1.2, 0.05]}>
                <planeGeometry args={[0.8, 2.2]} />
                <meshBasicMaterial map={ghostTex} transparent color="#050505" fog={false} />
              </mesh>
            ) : null}
            {isLit ? <pointLight position={[0, 1.2, 0.8]} color="#ff9a50" intensity={4} distance={5} decay={1.5} /> : null}
          </group>
        );
      })}
      {/* main door */}
      <group position={[0, 1.2, 6.02]}>
        <mesh material={trim} castShadow>
          <extrudeGeometry
            args={[
              (() => {
                const o = archShape(4.2, 4.6);
                o.holes.push(archShape(3.0, 4.0) as unknown as THREE.Path);
                return o;
              })(),
              {depth: 0.4, bevelEnabled: false},
            ]}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <shapeGeometry args={[archShape(3.0, 4.0)]} />
          <meshStandardMaterial color="#120a05" emissive="#ff8a35" emissiveIntensity={0.04 * doorGlow} roughness={0.8} />
        </mesh>
        <pointLight position={[0, 1.5, -0.6]} color="#ff8a35" intensity={3 * doorGlow} distance={6} decay={1.5} />
      </group>
      {/* jharokhas (projecting balconies) */}
      {[-9.3, 0, 9.3].map((x) => (
        <group key={x} position={[x, 7.3, 6.6]}>
          <mesh material={trim} position={[0, 0, 0.3]} castShadow receiveShadow>
            <boxGeometry args={[3.4, 0.35, 1.6]} />
          </mesh>
          {[-1.4, -0.47, 0.47, 1.4].map((px) => (
            <mesh key={px} material={trim} position={[px, 1.3, 0.9]} castShadow>
              <cylinderGeometry args={[0.09, 0.1, 2.4, 10]} />
            </mesh>
          ))}
          <mesh material={trim} position={[0, 2.6, 0.3]} castShadow>
            <boxGeometry args={[3.6, 0.3, 1.8]} />
          </mesh>
          <mesh material={trim} position={[0, 2.75, 0.3]} scale={[1.6, 1, 0.8]} castShadow>
            <sphereGeometry args={[1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          {/* brackets */}
          {[-1.2, 0, 1.2].map((bx) => (
            <mesh key={bx} material={trim} position={[bx, -0.55, 0.3]} rotation-x={0.6} castShadow>
              <boxGeometry args={[0.25, 0.9, 0.25]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* central tower + dome */}
      <mesh material={wall} position={[0, 14.2, -1]} castShadow receiveShadow>
        <boxGeometry args={[8, 5, 8]} />
      </mesh>
      <mesh material={trim} position={[0, 16.8, -1]} castShadow>
        <boxGeometry args={[8.8, 0.4, 8.8]} />
      </mesh>
      {[-2.4, 0, 2.4].map((x) => (
        <mesh key={x} position={[x, 13.4, 3.02]}>
          <shapeGeometry args={[archShape(1.1, 2.0)]} />
          <meshStandardMaterial color="#050302" emissive="#ff9640" emissiveIntensity={x === 0 ? 0.0 : 0} />
        </mesh>
      ))}
      <Dome r={3.6} pos={[0, 17, -1]} mat={trim} stretch={1.2} />
      {/* corner chhatris */}
      {[-14, 14].flatMap((x) => [5, -5].map((z) => <Chhatri key={`${x}${z}`} pos={[x, 11.5, z]} size={2.2} mat={trim} />))}
      {[-6.5, 6.5].map((x) => (
        <Chhatri key={x} pos={[x, 11.5, 4.6]} size={1.5} mat={trim} />
      ))}
    </group>
  );
};

/* ------------------------------------------------------------- terrain + sky */
const Desert: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(600, 600, 220, 220);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const d = Math.hypot(x, y + 0);
      const hill = 3.2 * Math.exp(-(d * d) / (2 * 30 * 30));
      const dunes = 2.2 * Math.sin(x * 0.045 + Math.sin(y * 0.03) * 2) * Math.cos(y * 0.035) + 0.6 * Math.sin(x * 0.17 + y * 0.11);
      const near = Math.min(1, Math.max(0, (d - 22) / 40));
      p.setZ(i, hill + dunes * near - 0.6);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const sand = useMemo(() => {
    const t = stoneTextures(31, 1, false, true);
    t.normal.repeat.set(40, 40);
    return t;
  }, []);
  return (
    <mesh geometry={geo} rotation-x={-Math.PI / 2} receiveShadow>
      <meshStandardMaterial color="#9c8160" roughness={0.95} normalMap={sand.normal} normalScale={new THREE.Vector2(0.6, 0.6)} />
    </mesh>
  );
};

const NightSky: React.FC<{moon?: [number, number, number]}> = ({moon = [-110, 125, -320]}) => {
  const stars = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 2500;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = random(`st${i}`) * Math.PI * 2;
      const ph = Math.acos(random(`sp${i}`) * 0.9);
      pos[i * 3] = 500 * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = 500 * Math.cos(ph);
      pos[i * 3 + 2] = 500 * Math.sin(ph) * Math.sin(th);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const dome = useMemo(() => {
    const g = new THREE.SphereGeometry(550, 32, 16);
    const colors: number[] = [];
    const p = g.attributes.position as THREE.BufferAttribute;
    const top = new THREE.Color('#01040a');
    const hor = new THREE.Color('#123040');
    for (let i = 0; i < p.count; i++) {
      const t = Math.max(0, p.getY(i) / 550);
      const c = hor.clone().lerp(top, Math.pow(t, 0.45));
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, []);
  return (
    <>
      <mesh geometry={dome}>
        <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} />
      </mesh>
      <points geometry={stars}>
        <pointsMaterial size={1.6} sizeAttenuation={false} color="#dfe9f0" fog={false} transparent opacity={0.85} />
      </points>
      <mesh position={moon}>
        <sphereGeometry args={[14, 48, 24]} />
        <meshBasicMaterial color={new THREE.Color(3.2, 3.0, 2.6)} toneMapped={false} fog={false} />
      </mesh>
    </>
  );
};

/* ------------------------------------------------------------- scenes */
const ExteriorScene: React.FC<{ghost?: boolean; gate?: boolean}> = ({ghost, gate}) => (
  <>
    <fogExp2 attach="fog" args={['#0c1a22', gate ? 0.018 : 0.0075]} />
    <Env url={nightHdr} intensity={0.25} />
    <NightSky />
    <hemisphereLight args={['#2a4a66', '#0a0705', 0.35]} />
    <directionalLight
      position={[-50, 60, -15]}
      color="#a9c2dc"
      intensity={1.1}
      castShadow
      shadow-mapSize-width={4096}
      shadow-mapSize-height={4096}
      shadow-camera-left={-40}
      shadow-camera-right={40}
      shadow-camera-top={40}
      shadow-camera-bottom={-40}
      shadow-bias={-0.0004}
    />
    <group position={[0, 2.4, 0]}>
      <Haveli lit={[1, 6, 11, 15, 16]} ghostWindow={ghost} doorGlow={gate ? 2.5 : 1} />
    </group>
    <Desert />
    {gate ? (
      <>
        {[-0.9, 0.9].map((x) => (
          <spotLight
            key={x}
            position={[x, 1.0, 42]}
            target-position={[x * 0.3, 3, 6]}
            angle={0.32}
            penumbra={0.7}
            intensity={160}
            distance={80}
            decay={1.6}
            color="#fff1d6"
            castShadow
          />
        ))}
        <CameraRig position={[2.5, 1.8, 36]} target={[0, 5.5, 6]} fov={40} />
      </>
    ) : (
      <CameraRig position={[-6, 4, 52]} target={[0, 9, 0]} fov={34} />
    )}
  </>
);

const ClockScene: React.FC<{twitch?: boolean}> = ({twitch}) => {
  const face = useMemo(() => clockFaceTexture(), []);
  const glass = useMemo(() => crackedGlassTexture(), []);
  const wall = useMemo(() => sandstone(17, 3, 2, '#b8946a'), []);
  const brass = <meshStandardMaterial color="#b58a45" metalness={1} roughness={0.32} />;
  const iron = <meshStandardMaterial color="#120c06" metalness={0.8} roughness={0.45} />;
  const sec = twitch ? -6 : 0;
  return (
    <>
      <fogExp2 attach="fog" args={['#0a0604', 0.03]} />
      <Env url={sunsetHdr} intensity={0.35} rotation={1.2} />
      <mesh material={wall} position={[0, 0, -0.4]} receiveShadow>
        <planeGeometry args={[14, 10]} />
      </mesh>
      {/* case */}
      <mesh position={[0, 0, 0]} rotation-x={Math.PI / 2} castShadow receiveShadow>
        <cylinderGeometry args={[1.65, 1.7, 0.4, 96]} />
        {brass}
      </mesh>
      <mesh position={[0, 0, 0.21]} castShadow>
        <torusGeometry args={[1.58, 0.09, 24, 128]} />
        {brass}
      </mesh>
      <mesh position={[0, 0, 0.205]}>
        <circleGeometry args={[1.52, 96]} />
        <meshStandardMaterial map={face} roughness={0.75} />
      </mesh>
      {/* hands: frozen at 12:00 */}
      <group position={[0, 0, 0.24]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.09, 0.85, 0.02]} />
          {iron}
        </mesh>
        <mesh position={[0, 0.6, 0.02]} castShadow>
          <boxGeometry args={[0.055, 1.22, 0.02]} />
          {iron}
        </mesh>
        <group rotation-z={(-sec * Math.PI) / 30}>
          <mesh position={[0, 0.58, 0.04]} castShadow>
            <boxGeometry args={[0.02, 1.36, 0.01]} />
            <meshStandardMaterial color="#7a1a10" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 24]} />
          {brass}
        </mesh>
      </group>
      {/* cracked glass */}
      <mesh position={[0, 0, 0.32]}>
        <circleGeometry args={[1.52, 96]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.08} roughness={0.05} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.325]}>
        <circleGeometry args={[1.52, 96]} />
        <meshBasicMaterial map={glass} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {/* candle light from below-left, cool rim from the right */}
      <pointLight position={[-2.2, -2.2, 1.6]} color="#ff9440" intensity={14} distance={12} decay={1.6} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[3, 2.5, 1.2]} color="#7fa0c0" intensity={2.5} distance={10} decay={1.6} />
      <CameraRig position={[0.9, -0.35, 4.3]} target={[0, 0.05, 0]} fov={40} roll={-0.06} />
      <EffectComposer multisampling={4}>
        <DepthOfField focusDistance={0.0} focalLength={0.06} bokehScale={2.5} />
        <Bloom intensity={0.6} luminanceThreshold={0.7} mipmapBlur />
        <Vignette offset={0.25} darkness={0.85} />
      </EffectComposer>
    </>
  );
};

const archGeometry = () => {
  const w = 4.4;
  const h = 5.2;
  const outer = new THREE.Shape();
  outer.moveTo(-w / 2, 0);
  outer.lineTo(w / 2, 0);
  outer.lineTo(w / 2, h);
  outer.lineTo(-w / 2, h);
  outer.lineTo(-w / 2, 0);
  const hole = new THREE.Path();
  const iw = 1.6;
  hole.moveTo(-iw, 0);
  hole.lineTo(-iw, 2.6);
  hole.quadraticCurveTo(-iw, 4.3, 0, 4.5);
  hole.quadraticCurveTo(iw, 4.3, iw, 2.6);
  hole.lineTo(iw, 0);
  hole.lineTo(-iw, 0);
  outer.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(outer, {depth: 0.6, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2});
  g.translate(0, 0, -0.3);
  return g;
};

const CorridorScene: React.FC<{level: number; ghost?: 'far' | 'near'; dark?: boolean}> = ({level, ghost, dark}) => {
  const arch = useMemo(() => archGeometry(), []);
  const wall = useMemo(() => sandstone(7, 14, 1.2, '#c9a27a'), []);
  const pier = useMemo(() => sandstone(8, 1.2, 1.2, '#c9a27a'), []);
  const floor = useMemo(() => {
    const t = stoneTextures(11, 1, true);
    [t.map, t.normal, t.rough].forEach((m) => m.repeat.set(2, 24));
    return new THREE.MeshStandardMaterial({map: t.map, normalMap: t.normal, roughnessMap: t.rough, color: '#8a6a4a', roughness: 0.55});
  }, []);
  const ghostTex = useMemo(() => ghostTexture(), []);
  const N = 12;
  return (
    <>
      <color attach="background" args={['#010101']} />
      <fogExp2 attach="fog" args={['#0b0705', 0.07]} />
      <ambientLight intensity={0.02} color="#5a7a90" />
      <mesh material={floor} rotation-x={-Math.PI / 2} position={[0, 0, -20]} receiveShadow>
        <planeGeometry args={[4.4, 70]} />
      </mesh>
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} material={wall} position={[x, 2.6, -20]} rotation-y={x < 0 ? Math.PI / 2 : -Math.PI / 2} receiveShadow>
          <planeGeometry args={[70, 5.2]} />
        </mesh>
      ))}
      <mesh material={wall} position={[0, 5.2, -20]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[4.4, 70]} />
      </mesh>
      {new Array(N).fill(0).map((_, i) => (
        <mesh key={i} geometry={arch} material={pier} position={[0, 0, 2 - i * 4]} castShadow receiveShadow />
      ))}
      {/* wall candles in niches between arches */}
      {new Array(N).fill(0).map((_, i) =>
        [-1, 1].map((s) => {
          const z = -0.2 - i * 4;
          const seed = i * 2 + (s > 0 ? 1 : 0);
          const out = dark ? i > 0 || s < 0 : false;
          const f = out ? 0 : level * (0.85 + 0.3 * random(`cl${seed}`));
          return (
            <group key={`${i}${s}`} position={[s * 2.05, 1.45, z]}>
              <mesh castShadow position={[0, -0.18, 0]}>
                <boxGeometry args={[0.3, 0.06, 0.3]} />
                <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
              </mesh>
              <mesh castShadow>
                <cylinderGeometry args={[0.045, 0.05, 0.3, 16]} />
                <meshStandardMaterial color="#e9dfc6" roughness={0.55} />
              </mesh>
              {f > 0 ? (
                <>
                  <mesh position={[0, 0.2, 0]} scale={[1, 1.9, 1]}>
                    <sphereGeometry args={[0.028, 12, 12]} />
                    <meshBasicMaterial color={new THREE.Color(5 * f, 3.0 * f, 1.1 * f)} toneMapped={false} />
                  </mesh>
                  <pointLight
                    position={[-s * 0.15, 0.3, 0]}
                    color="#ff9645"
                    intensity={3.2 * f}
                    distance={8}
                    decay={1.5}
                    castShadow={i < 3}
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                    shadow-bias={-0.002}
                  />
                </>
              ) : null}
            </group>
          );
        })
      )}
      {ghost === 'far' ? (
        <mesh position={[0, 1.55, -26]}>
          <planeGeometry args={[1.1, 3.0]} />
          <meshBasicMaterial map={ghostTex} transparent color={new THREE.Color(1.5, 1.7, 1.8)} toneMapped={false} fog={false} depthWrite={false} />
        </mesh>
      ) : null}
      {ghost === 'near' ? (
        <mesh position={[0.15, 1.45, -1.2]}>
          <planeGeometry args={[1.1, 3.0]} />
          <meshBasicMaterial map={ghostTex} transparent color={new THREE.Color(1.2, 1.35, 1.45)} toneMapped={false} fog={false} depthWrite={false} />
        </mesh>
      ) : null}
      {ghost === 'near' ? <pointLight position={[0.15, 1.5, -0.6]} color="#b8d4e6" intensity={2} distance={4} /> : null}
      <CameraRig position={[0.25, 1.55, 3.2]} target={[0, 1.6, -10]} fov={46} />
      <EffectComposer multisampling={4}>
        <DepthOfField focusDistance={0.015} focalLength={0.06} bokehScale={2.5} />
        <Bloom intensity={1.0} luminanceThreshold={0.65} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette offset={0.25} darkness={0.85} />
      </EffectComposer>
    </>
  );
};

/** Slightly curled page geometry. */
const pageGeometry = (side: -1 | 1) => {
  const g = new THREE.PlaneGeometry(2.6, 3.4, 40, 4);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + 1.3; // 0..2.6 from spine
    p.setZ(i, 0.18 * Math.sin((x / 2.6) * Math.PI * 0.5) * (1 - x / 5) + (x < 0.25 ? -0.08 * (1 - x / 0.25) : 0));
    p.setX(i, side * x);
  }
  g.computeVertexNormals();
  return g;
};

const AlbumScene: React.FC<{page: 1 | 2 | 'photo'; eyes?: boolean}> = ({page, eyes}) => {
  const wood = useMemo(() => woodTexture(), []);
  const paperL = useMemo(() => paperTexture('pl'), []);
  const paperR = useMemo(() => paperTexture('pr'), []);
  const leftG = useMemo(() => pageGeometry(-1), []);
  const rightG = useMemo(() => pageGeometry(1), []);
  const family = useMemo(() => familyPhotoTexture(), []);
  const portrait = useMemo(() => portraitTexture(eyes ? 1 : 0), [eyes]);
  const extImg = useAsync(
    () =>
      new Promise<HTMLImageElement>((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = staticFile('plates/ext.jpg');
      }),
    'ext-photo'
  );
  const extPhoto = useMemo(() => (extImg ? imagePhotoTexture(extImg, 'Haveli, 1947') : null), [extImg]);
  const leftPhoto = page === 1 ? extPhoto : family;
  const close = page === 'photo';
  return (
    <>
      <color attach="background" args={['#020100']} />
      <fogExp2 attach="fog" args={['#050302', 0.04]} />
      <Env url={sunsetHdr} intensity={0.12} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial map={wood} roughness={0.55} />
      </mesh>
      {/* leather cover */}
      <mesh position={[0, 0.03, 0]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 0.08, 3.7]} />
        <meshStandardMaterial color="#3d120c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation-x={-Math.PI / 2}>
        <boxGeometry args={[5.3, 3.5, 0.08]} />
        <meshStandardMaterial color="#c9b68e" roughness={0.9} />
      </mesh>
      <mesh geometry={leftG} rotation-x={-Math.PI / 2} position={[0, 0.16, 0]} receiveShadow castShadow>
        <meshStandardMaterial map={paperL} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={rightG} rotation-x={-Math.PI / 2} position={[0, 0.16, 0]} receiveShadow castShadow>
        <meshStandardMaterial map={paperR} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      {/* photos glued to pages */}
      {leftPhoto ? (
        <mesh position={[-1.3, 0.36, 0.05]} rotation={[-Math.PI / 2, 0, 0.04]} castShadow receiveShadow>
          <planeGeometry args={[1.7, 2.12]} />
          <meshStandardMaterial map={leftPhoto} roughness={0.45} />
        </mesh>
      ) : null}
      {page === 1 ? (
        <mesh position={[1.35, 0.34, 0.0]} rotation={[-Math.PI / 2, 0, -0.05]} castShadow receiveShadow>
          <planeGeometry args={[1.7, 2.12]} />
          <meshStandardMaterial map={family} roughness={0.45} />
        </mesh>
      ) : (
        <mesh position={[1.35, 0.34, 0.0]} rotation={[-Math.PI / 2, 0, -0.03]} castShadow receiveShadow>
          <planeGeometry args={[1.7, 2.12]} />
          <meshStandardMaterial map={portrait} roughness={0.45} emissiveMap={eyes ? portrait : null} emissive={eyes ? '#ff2010' : '#000'} emissiveIntensity={eyes ? 0.08 : 0} />
        </mesh>
      )}
      {/* candle on the table */}
      <group position={[-3.6, 0, -1.6]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 1.0, 24]} />
          <meshStandardMaterial color="#e8dcc0" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.12, 0]} scale={[1, 2, 1]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color={new THREE.Color(6, 3.4, 1.2)} toneMapped={false} />
        </mesh>
        <pointLight position={[0.2, 1.3, 0.2]} color="#ff9a45" intensity={9} distance={14} decay={1.4} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.001} />
      </group>
      <pointLight position={[3, 3, 3]} color="#6f8fb0" intensity={0.6} distance={12} />
      {close ? (
        <CameraRig position={[1.4, 2.6, 0.9]} target={[1.35, 0.3, -0.05]} fov={34} />
      ) : (
        <CameraRig position={[0.2, 5.3, 4.6]} target={[0, 0.2, 0.2]} fov={38} />
      )}
      <EffectComposer multisampling={4}>
        <DepthOfField focusDistance={close ? 0.006 : 0.02} focalLength={close ? 0.04 : 0.05} bokehScale={close ? 4 : 3} />
        <Bloom intensity={0.9} luminanceThreshold={0.7} mipmapBlur />
        <Vignette offset={0.25} darkness={0.9} />
      </EffectComposer>
    </>
  );
};

const TitleScene: React.FC<{variant: 'a' | 'b'}> = ({variant}) => {
  const font = useAsync(
    () =>
      new Promise<Font>((res) => {
        new TTFLoader().load(staticFile('fonts/cinzel-900.woff'), (json) => res(new Font(json as never)));
      }),
    'font'
  );
  const geos = useMemo(() => {
    if (!font) return null;
    const mk = (t: string, size: number, spacing: number) => {
      // build per-letter so we control tracking
      const group: THREE.BufferGeometry[] = [];
      let x = 0;
      const widths: number[] = [];
      t.split('').forEach((ch) => {
        const g = new TextGeometry(ch, {font, size, depth: size * 0.22, curveSegments: 10, bevelEnabled: true, bevelSize: size * 0.025, bevelThickness: size * 0.03, bevelSegments: 4});
        g.computeBoundingBox();
        const w = g.boundingBox!.max.x - g.boundingBox!.min.x;
        g.translate(x, 0, 0);
        group.push(g);
        widths.push(w);
        x += w + spacing;
      });
      const total = x - spacing;
      group.forEach((g) => g.translate(-total / 2, 0, 0));
      return group;
    };
    return {top: mk('KHAMOSH', 1.0, 0.18), bottom: mk('HAVELI', 0.62, 0.34)};
  }, [font]);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({color: '#d9a14a', metalness: 1, roughness: 0.22}), []);
  const dust = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 500;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (random(`tdx${i}`) - 0.5) * 16;
      pos[i * 3 + 1] = (random(`tdy${i}`) - 0.5) * 8;
      pos[i * 3 + 2] = (random(`tdz${i}`) - 0.5) * 6;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <>
      <color attach="background" args={['#020100']} />
      <Env url={sunsetHdr} intensity={variant === 'a' ? 1.3 : 1.6} rotation={variant === 'a' ? 0.3 : 2.1} />
      <spotLight position={[variant === 'a' ? -6 : 6, 5, 6]} angle={0.5} penumbra={0.8} intensity={250} color="#ffd9a0" />
      <pointLight position={[0, -3, 2]} color="#ff6a20" intensity={8} distance={10} />
      {geos ? (
        <>
          <group position={[0, 0.35, 0]}>
            {geos.top.map((g, i) => (
              <mesh key={i} geometry={g} material={gold} castShadow />
            ))}
          </group>
          <group position={[0, -0.75, 0]}>
            {geos.bottom.map((g, i) => (
              <mesh key={i} geometry={g} material={gold} castShadow />
            ))}
          </group>
        </>
      ) : null}
      <points geometry={dust}>
        <pointsMaterial size={2.2} sizeAttenuation={false} color={new THREE.Color(3, 1.6, 0.6)} toneMapped={false} transparent opacity={0.7} />
      </points>
      <CameraRig position={[0, 0.05, 7.2]} target={[0, -0.05, 0]} fov={40} />
      <EffectComposer multisampling={4}>
        <Bloom intensity={1.2} luminanceThreshold={0.75} mipmapBlur />
        <Vignette offset={0.2} darkness={0.9} />
      </EffectComposer>
    </>
  );
};

const PlateScene: React.FC<{plate: PlateId}> = ({plate}) => {
  switch (plate) {
    case 'ext':
      return <ExteriorScene />;
    case 'ext-ghost':
      return <ExteriorScene ghost />;
    case 'gate':
      return <ExteriorScene gate />;
    case 'clock-a':
      return <ClockScene />;
    case 'clock-b':
      return <ClockScene twitch />;
    case 'corr-bright':
      return <CorridorScene level={1.1} />;
    case 'corr-dim':
      return <CorridorScene level={0.7} />;
    case 'corr-ghost-far':
      return <CorridorScene level={0.9} ghost="far" />;
    case 'corr-ghost-near':
      return <CorridorScene level={0.6} ghost="near" />;
    case 'corr-dark':
      return <CorridorScene level={0.8} dark />;
    case 'album-1':
      return <AlbumScene page={1} />;
    case 'album-2':
      return <AlbumScene page={2} />;
    case 'photo':
      return <AlbumScene page="photo" />;
    case 'photo-eyes':
      return <AlbumScene page="photo" eyes />;
    case 'title-a':
      return <TitleScene variant="a" />;
    case 'title-b':
      return <TitleScene variant="b" />;
    default:
      return null;
  }
};

export const Plate: React.FC<{plate: PlateId}> = ({plate}) => {
  const {width, height} = useVideoConfig();
  const exterior = plate === 'ext' || plate === 'ext-ghost' || plate === 'gate';
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows={{type: THREE.PCFSoftShadowMap}}
      gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exterior ? 1.25 : 1.1, preserveDrawingBuffer: true}}
      camera={{fov: 40, near: 0.05, far: 2000}}
    >
      <PlateScene plate={plate} />
      {exterior ? (
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.9} luminanceThreshold={0.7} mipmapBlur />
          <Vignette offset={0.3} darkness={0.8} />
        </EffectComposer>
      ) : null}
    </ThreeCanvas>
  );
};
