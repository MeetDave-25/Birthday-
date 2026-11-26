import * as THREE from 'three';
import {random} from 'remotion';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
};

const tex = (c: HTMLCanvasElement, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Film grain / dust / scratches for aged surfaces. */
const age = (g: CanvasRenderingContext2D, w: number, h: number, seed: string, amount = 1) => {
  for (let i = 0; i < 9000 * amount; i++) {
    const x = random(`${seed}x${i}`) * w;
    const y = random(`${seed}y${i}`) * h;
    const v = random(`${seed}v${i}`);
    g.fillStyle = v > 0.5 ? `rgba(255,245,220,${0.08 * v})` : `rgba(30,18,8,${0.12 * (1 - v)})`;
    g.fillRect(x, y, 1.5, 1.5);
  }
  // stains
  for (let i = 0; i < 6 * amount; i++) {
    const x = random(`${seed}sx${i}`) * w;
    const y = random(`${seed}sy${i}`) * h;
    const r = 30 + random(`${seed}sr${i}`) * 140;
    const grd = g.createRadialGradient(x, y, r * 0.2, x, y, r);
    grd.addColorStop(0, 'rgba(90,55,20,0.0)');
    grd.addColorStop(0.85, 'rgba(90,55,20,0.18)');
    grd.addColorStop(1, 'rgba(90,55,20,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  // scratches
  g.strokeStyle = 'rgba(255,250,235,0.25)';
  g.lineWidth = 1;
  for (let i = 0; i < 14 * amount; i++) {
    g.beginPath();
    const x = random(`${seed}kx${i}`) * w;
    g.moveTo(x, random(`${seed}ky${i}`) * h * 0.3);
    g.lineTo(x + (random(`${seed}kz${i}`) - 0.5) * 40, h * (0.6 + random(`${seed}kw${i}`) * 0.4));
    g.stroke();
  }
};

export const clockFaceTexture = () => {
  const S = 1024;
  const [c, g] = canvas(S, S);
  const grd = g.createRadialGradient(S / 2, S / 2, 50, S / 2, S / 2, S / 2);
  grd.addColorStop(0, '#efe2c4');
  grd.addColorStop(0.8, '#d6c29a');
  grd.addColorStop(1, '#8a6c40');
  g.fillStyle = grd;
  g.fillRect(0, 0, S, S);
  age(g, S, S, 'clock', 0.6);
  g.translate(S / 2, S / 2);
  g.strokeStyle = '#2a1a0a';
  g.fillStyle = '#2a1a0a';
  g.lineWidth = 4;
  g.beginPath();
  g.arc(0, 0, 450, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.arc(0, 0, 400, 0, Math.PI * 2);
  g.stroke();
  for (let i = 0; i < 60; i++) {
    g.save();
    g.rotate((i * Math.PI) / 30);
    g.fillRect(-(i % 5 ? 1.5 : 4), -448, i % 5 ? 3 : 8, i % 5 ? 22 : 44);
    g.restore();
  }
  const numerals = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  g.font = '700 78px Cinzel, serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  numerals.forEach((n, i) => {
    g.save();
    g.rotate((i * Math.PI) / 6);
    g.translate(0, -335);
    g.fillText(n, 0, 0);
    g.restore();
  });
  g.font = 'italic 36px "Cormorant Garamond", serif';
  g.fillText('Jaipur · 1931', 0, 170);
  return tex(c);
};

export const crackedGlassTexture = () => {
  const S = 1024;
  const [c, g] = canvas(S, S);
  g.clearRect(0, 0, S, S);
  g.strokeStyle = 'rgba(255,255,255,0.9)';
  const cx = S * 0.62;
  const cy = S * 0.38;
  for (let i = 0; i < 14; i++) {
    let x = cx;
    let y = cy;
    let a = (i / 14) * Math.PI * 2 + random(`ga${i}`) * 0.4;
    g.lineWidth = 2.2;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 9; k++) {
      a += (random(`gk${i}-${k}`) - 0.5) * 0.6;
      x += Math.cos(a) * (30 + random(`gl${i}-${k}`) * 50);
      y += Math.sin(a) * (30 + random(`gl${i}-${k}`) * 50);
      g.lineTo(x, y);
    }
    g.stroke();
  }
  for (let r = 40; r < 260; r += 55 + random(`gr${r}`) * 30) {
    g.lineWidth = 1.2;
    g.beginPath();
    for (let k = 0; k <= 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      const rr = r * (0.85 + random(`gq${r}-${k % 14}`) * 0.3);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      if (k === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  return tex(c, false);
};

export const woodTexture = () => {
  const W = 1024;
  const H = 1024;
  const [c, g] = canvas(W, H);
  g.fillStyle = '#3a2112';
  g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 1) {
    const v = Math.sin(y * 0.05 + Math.sin(y * 0.013) * 4) * 0.5 + 0.5;
    g.fillStyle = `rgba(${20 + v * 50},${10 + v * 25},${4 + v * 10},0.5)`;
    g.fillRect(0, y, W, 1);
  }
  for (let i = 0; i < 5; i++) {
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.fillRect(0, (i * H) / 5, W, 3);
  }
  age(g, W, H, 'wood', 0.8);
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

export const paperTexture = (seed: string) => {
  const S = 1024;
  const [c, g] = canvas(S, S);
  const grd = g.createRadialGradient(S / 2, S / 2, 100, S / 2, S / 2, S * 0.75);
  grd.addColorStop(0, '#e6d6b0');
  grd.addColorStop(1, '#a88a58');
  g.fillStyle = grd;
  g.fillRect(0, 0, S, S);
  age(g, S, S, seed, 0.7);
  return tex(c);
};

/** Vintage photograph print (with white border + caption) drawn around an image painter. */
const photoPrint = (seed: string, caption: string, paint: (g: CanvasRenderingContext2D, w: number, h: number) => void) => {
  const W = 800;
  const H = 1000;
  const [c, g] = canvas(W, H);
  g.fillStyle = '#e8dcc0';
  g.fillRect(0, 0, W, H);
  const pw = W - 80;
  const ph = H - 220;
  const [ic, ig] = canvas(pw, ph);
  paint(ig, pw, ph);
  // sepia + soft focus + vignette
  g.filter = 'sepia(0.85) contrast(1.05) blur(1.2px)';
  g.drawImage(ic, 40, 40);
  g.filter = 'none';
  const vg = g.createRadialGradient(W / 2, 40 + ph / 2, ph * 0.25, W / 2, 40 + ph / 2, ph * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(40,20,5,0.55)');
  g.fillStyle = vg;
  g.fillRect(40, 40, pw, ph);
  age(g, W, H, seed, 1.2);
  g.fillStyle = '#4a2a12';
  g.font = 'italic 500 58px "Cormorant Garamond", serif';
  g.textAlign = 'center';
  g.fillText(caption, W / 2, H - 85);
  return tex(c);
};

/** A woman's studio portrait from 1947 (painted soft so it reads as an old, slightly blurred print). */
export const portraitTexture = (eyes = 0) =>
  photoPrint('rhea', 'Rhea — 1947', (g, w, h) => {
    const bg = g.createRadialGradient(w / 2, h * 0.35, 40, w / 2, h * 0.4, h * 0.8);
    bg.addColorStop(0, '#b7a083');
    bg.addColorStop(1, '#3e3020');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.filter = 'blur(3px)';
    // hair (long, center parting)
    g.fillStyle = '#17110b';
    g.beginPath();
    g.ellipse(w / 2, h * 0.36, w * 0.21, h * 0.24, 0, 0, Math.PI * 2);
    g.fill();
    g.fillRect(w / 2 - w * 0.21, h * 0.36, w * 0.42, h * 0.4);
    // neck + shoulders with saree drape
    g.fillStyle = '#9c7a58';
    g.fillRect(w / 2 - w * 0.055, h * 0.5, w * 0.11, h * 0.12);
    g.fillStyle = '#4a3624';
    g.beginPath();
    g.moveTo(w * 0.1, h);
    g.quadraticCurveTo(w * 0.2, h * 0.6, w / 2, h * 0.6);
    g.quadraticCurveTo(w * 0.8, h * 0.6, w * 0.9, h);
    g.fill();
    g.fillStyle = 'rgba(200,170,120,0.35)';
    g.beginPath();
    g.moveTo(w * 0.62, h * 0.62);
    g.quadraticCurveTo(w * 0.4, h * 0.8, w * 0.3, h);
    g.lineTo(w * 0.4, h);
    g.quadraticCurveTo(w * 0.5, h * 0.8, w * 0.7, h * 0.64);
    g.fill();
    // face
    const fg = g.createRadialGradient(w / 2 - 10, h * 0.36, 10, w / 2, h * 0.38, w * 0.17);
    fg.addColorStop(0, '#c9a57c');
    fg.addColorStop(1, '#8c6844');
    g.fillStyle = fg;
    g.beginPath();
    g.ellipse(w / 2, h * 0.38, w * 0.13, h * 0.15, 0, 0, Math.PI * 2);
    g.fill();
    g.filter = 'blur(1.5px)';
    // brows, eyes, nose, lips, bindi
    g.strokeStyle = '#2a1a0e';
    g.lineWidth = 5;
    [-1, 1].forEach((s) => {
      g.beginPath();
      g.moveTo(w / 2 + s * w * 0.025, h * 0.325);
      g.quadraticCurveTo(w / 2 + s * w * 0.06, h * 0.31, w / 2 + s * w * 0.095, h * 0.325);
      g.stroke();
      g.fillStyle = '#f0e6d2';
      g.beginPath();
      g.ellipse(w / 2 + s * w * 0.058, h * 0.352, w * 0.026, h * 0.011, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = eyes > 0 ? `rgb(${60 + 195 * eyes},${25},${15})` : '#1a1008';
      g.beginPath();
      g.arc(w / 2 + s * w * 0.058, h * 0.352, w * 0.012, 0, Math.PI * 2);
      g.fill();
    });
    g.strokeStyle = 'rgba(70,45,25,0.6)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(w / 2, h * 0.36);
    g.lineTo(w / 2 - 6, h * 0.41);
    g.lineTo(w / 2 + 6, h * 0.415);
    g.stroke();
    g.fillStyle = '#5a2a1e';
    g.beginPath();
    g.ellipse(w / 2, h * 0.452, w * 0.035, h * 0.009, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#3a120a';
    g.beginPath();
    g.arc(w / 2, h * 0.3, 5, 0, Math.PI * 2);
    g.fill();
    g.filter = 'none';
  });

export const familyPhotoTexture = () =>
  photoPrint('family', 'Thakur parivaar, 1946', (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#a89272');
    bg.addColorStop(1, '#4a3a26');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(60,45,30,0.6)';
    g.fillRect(0, h * 0.62, w, h * 0.38);
    g.filter = 'blur(2.5px)';
    const people = [
      {x: 0.2, hgt: 0.36, dark: '#2b2015', turban: true},
      {x: 0.4, hgt: 0.32, dark: '#3a2a1a', turban: false},
      {x: 0.6, hgt: 0.38, dark: '#241a10', turban: true},
      {x: 0.8, hgt: 0.3, dark: '#40301e', turban: false},
    ];
    people.forEach((p, i) => {
      const x = w * p.x;
      const top = h * (0.62 - p.hgt);
      g.fillStyle = p.dark;
      g.beginPath();
      g.moveTo(x - w * 0.08, h * 0.98);
      g.lineTo(x - w * 0.065, top + h * 0.12);
      g.quadraticCurveTo(x, top + h * 0.08, x + w * 0.065, top + h * 0.12);
      g.lineTo(x + w * 0.08, h * 0.98);
      g.fill();
      g.fillStyle = '#8a6a4a';
      g.beginPath();
      g.ellipse(x, top + h * 0.06, w * 0.035, h * 0.045, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = p.turban ? '#d8c8a8' : '#18110a';
      g.beginPath();
      g.ellipse(x, top + h * (p.turban ? 0.025 : 0.035), w * (p.turban ? 0.045 : 0.04), h * 0.03, 0, Math.PI, Math.PI * 2);
      g.fill();
      // one face is missing / scratched out
      if (i === 3) {
        g.fillStyle = 'rgba(230,220,200,0.85)';
        g.beginPath();
        g.ellipse(x, top + h * 0.06, w * 0.045, h * 0.055, 0, 0, Math.PI * 2);
        g.fill();
      }
    });
    g.filter = 'none';
  });

/** Old print made from an existing image (e.g. the rendered haveli exterior). */
export const imagePhotoTexture = (img: HTMLImageElement, caption: string) =>
  photoPrint('img' + caption, caption, (g, w, h) => {
    const s = Math.max(w / img.width, h / img.height) * 1.15;
    g.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2 - h * 0.05, img.width * s, img.height * s);
    g.fillStyle = 'rgba(255,240,210,0.12)';
    g.fillRect(0, 0, w, h);
  });
