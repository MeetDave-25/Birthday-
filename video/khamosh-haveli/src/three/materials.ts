import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {random} from 'remotion';
import React, {useLayoutEffect} from 'react';

/** Seeded value noise (smooth) used to build stone height fields. */
const makeNoise = (seed: number, size: number) => {
  const grid = new Float32Array(size * size).map((_, i) => random(`n${seed}-${i}`));
  const at = (x: number, y: number) => grid[((y % size) + size) % size * size + (((x % size) + size) % size)];
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
};

const fbm = (n: (x: number, y: number) => number, x: number, y: number, oct = 5) => {
  let s = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    s += amp * n(x * f, y * f);
    amp *= 0.5;
    f *= 2.03;
  }
  return s;
};

/**
 * Sandstone ashlar blocks: albedo, normal and roughness maps generated from one height field.
 * `tiles` = blocks texture repeat. `floor` = larger flagstones.
 */
export const stoneTextures = (seed: number, repeat = 4, floor = false, plain = false) => {
  const S = 512;
  const n = makeNoise(seed, 64);
  const n2 = makeNoise(seed + 50, 64);
  const height = new Float32Array(S * S);
  const albedo = new Uint8ClampedArray(S * S * 4);
  const rows = floor ? 4 : 6;
  const bh = S / rows;
  for (let y = 0; y < S; y++) {
    const row = Math.floor(y / bh);
    const bw = floor ? S / 3 : S / 3.2;
    const offset = row % 2 ? bw / 2 : 0;
    for (let x = 0; x < S; x++) {
      const bx = (x + offset) % bw;
      const by = y % bh;
      const edge = Math.min(bx, bw - bx, by, bh - by);
      const mortar = plain ? 1 : Math.min(1, edge / 5);
      const blockId = Math.floor((x + offset) / bw) + row * 17;
      const tint = random(`b${seed}-${blockId}`);
      const grain = fbm(n, x / 18, y / 18);
      const pits = Math.pow(fbm(n2, x / 6, y / 6, 3), 3);
      const h = mortar * (0.75 + 0.25 * grain) - pits * 0.35 + (1 - mortar) * -0.1;
      height[y * S + x] = h;
      const base = 0.55 + 0.25 * tint + 0.35 * (grain - 0.5) - pits * 0.4;
      const m = mortar < 1 ? 0.6 + 0.4 * mortar : 1;
      const i = (y * S + x) * 4;
      albedo[i] = 255 * Math.min(1, base * m * 1.0);
      albedo[i + 1] = 255 * Math.min(1, base * m * 0.8);
      albedo[i + 2] = 255 * Math.min(1, base * m * 0.6);
      albedo[i + 3] = 255;
    }
  }
  const normal = new Uint8ClampedArray(S * S * 4);
  const rough = new Uint8ClampedArray(S * S * 4);
  const H = (x: number, y: number) => height[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * 6;
      const dy = (H(x, y + 1) - H(x, y - 1)) * 6;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * S + x) * 4;
      normal[i] = 255 * (0.5 - (0.5 * dx) / len);
      normal[i + 1] = 255 * (0.5 + (0.5 * dy) / len);
      normal[i + 2] = 255 * (0.5 + 0.5 / len);
      normal[i + 3] = 255;
      const r = 0.7 + 0.3 * (1 - H(x, y));
      rough[i] = rough[i + 1] = rough[i + 2] = 255 * Math.min(1, r);
      rough[i + 3] = 255;
    }
  }
  const mk = (data: Uint8ClampedArray, srgb: boolean) => {
    const t = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, floor ? repeat * 6 : 1);
    t.anisotropy = 8;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };
  return {map: mk(albedo, true), normal: mk(normal, false), rough: mk(rough, false)};
};

/** Candle flicker in ~[0.6, 1.1], deterministic. */
export const flick = (frame: number, seed: number) =>
  0.8 + 0.15 * Math.sin(frame * 0.9 + seed * 3.1) + 0.12 * (random(`fl-${seed}-${Math.floor(frame / 2)}`) - 0.5);

/** Pale woman in white with long black hair, soft edges — used as a glowing billboard. */
export const ghostTexture = () => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 700;
  const g = c.getContext('2d')!;
  g.filter = 'blur(6px)';
  const gown = g.createLinearGradient(0, 80, 0, 700);
  gown.addColorStop(0, 'rgba(235,245,250,0.95)');
  gown.addColorStop(0.7, 'rgba(225,240,245,0.55)');
  gown.addColorStop(1, 'rgba(225,240,245,0)');
  g.fillStyle = gown;
  g.beginPath();
  g.moveTo(128, 40);
  g.bezierCurveTo(60, 40, 62, 140, 70, 200);
  g.lineTo(30, 700);
  g.lineTo(226, 700);
  g.lineTo(186, 200);
  g.bezierCurveTo(194, 140, 196, 40, 128, 40);
  g.fill();
  g.fillStyle = 'rgba(2,3,4,0.95)';
  g.beginPath();
  g.moveTo(128, 30);
  g.bezierCurveTo(55, 30, 58, 140, 72, 300);
  g.lineTo(100, 330);
  g.lineTo(128, 180);
  g.lineTo(156, 330);
  g.lineTo(184, 300);
  g.bezierCurveTo(198, 140, 201, 30, 128, 30);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Sets the default camera every frame (deterministic for rendering). */
export const CameraRig: React.FC<{position: [number, number, number]; target: [number, number, number]; fov?: number; roll?: number}> = ({
  position,
  target,
  fov,
  roll = 0,
}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(...target);
    if (fov) {
      camera.fov = fov;
    }
    camera.updateProjectionMatrix();
  });
  return null;
};
