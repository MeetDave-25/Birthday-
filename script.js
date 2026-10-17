/* =========================================================
   ✏️  PERSONALIZE HERE  (or use the link: index.html?name=Vidhi&from=Meet)
   ========================================================= */
const CONFIG = {
  name: "Vidhi",
  from: "Meet",
  // flowers already picked for her (ids from FLOWERS below)
  bouquet: ["tulip", "rose", "peony", "daisy", "lily", "babysbreath", "lavender"],
  candles: 5,
  message: [
    "Happy Birthday Vidhi ✨",
    "Maybe you find bit odd but ya we are friends from short time but it's good time and I quite good to know and it never like i know you from short periods, its always like i know you from long time.",
    "Find you so much yapper, so much interesting with so many hobbies, and every time I explore new things and learn new things from you. Sometime I feel we have same hobbies but sometimes I feel like we are so much opposite, but ya it's okay.",
    "And \"ha\" and \"okay\" is your same reply as always, but aab muje aadat ho gai he. Aab me woh ha or okay ke piche find karta hu ki kya hi bolu ki yeh na bole ha or okay muje 😅 Sometimes I can't understand what you try to tell from ha and okay message but I try my hard to understand.",
    "It's good time whatever time I spend with you. Thanks to became friend — I literally lose hope in friendship and I don't trust friendship, but thanks to you one hope is there 😅",
    "And hope we also have good bond ahead. He to khara na plan continue karne ka friendship ki? Fir boring to nahi hu? Ha me kabhi kabhi boring ho jata hu ya fir face or face avoid karta hu milna — it's have reason, if you have time baat karege. And ya I like to know you more, if aap bus ans ha and okay na de to...",
    "Baki I am always there for you, whatever you consider me. I am always there — if you need any help in anything I am there, just call or message...",
    "Have great year ahead of you and enjoy! And story rakh ne se koi nahi mil jata, find karna padta he uske liye, samje aap 😄 Me instagram nahi use kar raha aabhi nahi to achi wali story rakhta, but koi na...",
    "Or if any wish he to batana — kuch de to nahi laya, but if puri kar pau, if kahena he to aapko...",
    "Baki yehi hu bus, thoda ha or okay ke bich fas jata hu 😅🥲🫠",
    "Happy birthday Vidhi 🎂",
  ],
};

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const show = (el) => el.classList.remove("hidden");
const hide = (el) => el.classList.add("hidden");

const params = new URLSearchParams(location.search);
const NAME = (params.get("name") || CONFIG.name).toLowerCase();
const FROM = (params.get("from") || CONFIG.from).toLowerCase();
$$(".js-name").forEach((el) => (el.textContent = NAME));
$$(".js-from").forEach((el) => (el.textContent = FROM));
document.title = `a bouquet for ${NAME}`;

/* =========================================================
   Hand-drawn flower library
   Every head is drawn around (0,0), roughly 50px across.
   ========================================================= */
const petal = (l, w) => `M0 0 C${w} ${-l * 0.3} ${w} ${-l * 0.8} 0 ${-l} C${-w} ${-l * 0.8} ${-w} ${-l * 0.3} 0 0Z`;
const ring = (n, d, fill, rot = 0) =>
  Array.from({ length: n }, (_, i) => `<path d="${d}" fill="${fill}" transform="rotate(${rot + (360 / n) * i})"/>`).join("");

const FLOWERS = {
  tulip: {
    name: "tulip", meaning: "tulip — perfect love",
    draw: () => `
      <path d="M-13 6 C-17 -12 -13 -30 0 -36 C13 -30 17 -12 13 6 C7 11 -7 11 -13 6Z" fill="#f4a7b9"/>
      <path d="M2 8 C-20 8 -24 -20 -16 -34 C-6 -26 0 -18 4 -8Z" fill="#f7c0cc"/>
      <path d="M-2 8 C20 8 24 -20 16 -34 C6 -26 0 -18 -4 -8Z" fill="#f7c0cc"/>
      <path d="M0 -4 V-24" fill="none"/>`,
  },
  rose: {
    name: "rose", meaning: "rose — you are adored",
    draw: () => `
      <path d="M-22 0 C-24 -18 -8 -26 2 -24 C18 -24 26 -10 22 4 C18 20 -18 22 -22 0Z" fill="#e86a7f"/>
      <path d="M-2 -6 C4 -14 14 -6 8 2 C2 8 -10 4 -9 -6 C-8 -16 8 -18 15 -9" fill="none"/>
      <path d="M-16 4 C-10 14 10 14 17 3" fill="none"/>
      <path d="M-20 -6 C-14 -2 -12 6 -14 12" fill="none"/>`,
  },
  peony: {
    name: "peony", meaning: "peony — a happy life",
    draw: () => `
      ${ring(8, petal(24, 13), "#f7c0cc", 10)}
      ${ring(6, petal(16, 10), "#f4a7b9", 30)}
      <circle r="7" fill="#fbd9e0"/>
      <path d="M-4 -2 C-2 -6 3 -6 4 -1 M-3 3 C0 5 3 4 4 2" fill="none"/>`,
  },
  daisy: {
    name: "daisy", meaning: "daisy — pure joy",
    draw: () => `${ring(14, petal(23, 5), "#ffffff")}<circle r="7" fill="#f6d365"/>`,
  },
  sunflower: {
    name: "sunflower", meaning: "sunflower — you're my sunshine",
    draw: () => `
      ${ring(16, `M0 0 C6 -8 6 -18 0 -26 C-6 -18 -6 -8 0 0Z`, "#f6d365", 11)}
      <circle r="11" fill="#9a6b45"/>
      <g class="noink">${[[-4, -3], [3, -5], [5, 2], [-2, 4], [0, 0], [-6, 2], [2, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#1f1d1a"/>`).join("")}</g>`,
  },
  lily: {
    name: "lily", meaning: "lily — you make everything brighter",
    draw: () => `
      ${ring(6, `M0 0 C9 -8 8 -20 0 -28 C-8 -20 -9 -8 0 0Z`, "#fff3f6", 0)}
      ${ring(6, `M0 -4 L0 -18`, "none", 0)}
      <g>${[-30, 0, 30].map((a) => `<path d="M0 0 L0 -14" fill="none" transform="rotate(${a})"/><circle cx="0" cy="-15" r="2.4" fill="#f7b98b" transform="rotate(${a})"/>`).join("")}</g>`,
  },
  cherry: {
    name: "blossom", meaning: "cherry blossom — new beginnings",
    draw: () => `
      ${ring(5, `M0 0 C10 -4 13 -16 7 -22 L0 -18 L-7 -22 C-13 -16 -10 -4 0 0Z`, "#fbd9e0")}
      <circle r="4" fill="#f4a7b9"/>
      <g>${[0, 72, 144, 216, 288].map((a) => `<path d="M0 0 L0 -8" fill="none" transform="rotate(${a})"/>`).join("")}</g>`,
  },
  hydrangea: {
    name: "hydrangea", meaning: "hydrangea — heartfelt thanks",
    draw: () =>
      [[0, -2], [-12, -8], [12, -8], [-14, 6], [14, 6], [0, 12], [-6, -18], [7, -18], [0, -6]]
        .map(([x, y], i) => `<g transform="translate(${x} ${y}) rotate(${i * 20})">${ring(4, petal(8, 5), i % 2 ? "#9cc3e6" : "#b9a3e3")}<circle r="1.4" fill="#fff"/></g>`)
        .join(""),
  },
  lavender: {
    name: "lavender", meaning: "lavender — calm & devotion",
    tall: true,
    draw: () =>
      `<path d="M0 22 V-34" fill="none"/>` +
      Array.from({ length: 7 }, (_, i) => {
        const y = 14 - i * 7, s = 1 - i * 0.07;
        return `<ellipse cx="${-4 * s}" cy="${y}" rx="${4 * s}" ry="${6 * s}" fill="#b9a3e3" transform="rotate(-25 ${-4 * s} ${y})"/>
                <ellipse cx="${4 * s}" cy="${y - 3}" rx="${4 * s}" ry="${6 * s}" fill="#a58fd6" transform="rotate(25 ${4 * s} ${y - 3})"/>`;
      }).join(""),
  },
  babysbreath: {
    name: "baby's breath", meaning: "baby's breath — everlasting love",
    draw: () => {
      const pts = [[0, -20], [-12, -14], [12, -15], [-20, -2], [20, -3], [-8, -4], [8, -6], [0, 6], [-14, 10], [14, 9], [-4, -26], [6, -26]];
      return pts.map(([x, y]) => `<path d="M0 18 Q${x / 2} ${y / 2 + 8} ${x} ${y}" fill="none" stroke-width="1"/>`).join("") +
        pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#ffffff"/>`).join("");
    },
  },
};

/* =========================================================
   Scene navigation
   ========================================================= */
const scenes = $$(".scene");
const stepLabel = $("#stepLabel");
let current = 0;
const pad = (n) => String(n).padStart(2, "0");
const setStep = () => (stepLabel.textContent = `${pad(current + 1)} / ${pad(scenes.length)}`);
setStep();

async function goTo(i) {
  if (i === current || i < 0 || i >= scenes.length) return;
  const from = scenes[current];
  from.classList.replace("active", "leaving");
  await wait(380);
  from.classList.remove("leaving");
  current = i;
  scenes[i].classList.add("active");
  setStep();
  scrollTo({ top: 0, behavior: "smooth" });
  onEnter[i]?.();
}
$$("[data-next]").forEach((b) => b.addEventListener("click", () => goTo(current + 1)));

/* =========================================================
   Soft effects: petals & confetti (canvas)
   ========================================================= */
const fx = $("#fx");
const ctx = fx.getContext("2d");
const PAL = ["#f4a7b9", "#e86a7f", "#f6d365", "#9cc3e6", "#b9a3e3", "#9cbf8f"];
let parts = [];
let running = false;

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  fx.width = innerWidth * dpr;
  fx.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

function add(p) {
  parts.push({ life: 0, rot: rand(0, 6.3), vr: rand(-0.08, 0.08), ...p });
  if (!running) { running = true; requestAnimationFrame(tick); }
}
function tick() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.life < p.max && p.y < innerHeight + 40);
  for (const p of parts) {
    p.life++;
    p.vy += p.g; p.vx *= 0.99;
    p.x += p.vx + (p.sway ? Math.sin(p.life * p.sway) * 0.8 : 0);
    p.y += p.vy; p.rot += p.vr;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (p.max - p.life) / 40);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.strokeStyle = "#1f1d1a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (p.kind === "petal") ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, Math.PI * 2);
    else if (p.kind === "dot") ctx.arc(0, 0, p.s * 0.5, 0, Math.PI * 2);
    else ctx.rect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
    ctx.fill();
    if (p.kind === "petal") ctx.stroke();
    ctx.restore();
  }
  if (parts.length) requestAnimationFrame(tick);
  else running = false;
}
function petals(ms = 5000) {
  const end = performance.now() + ms;
  (function drop() {
    add({ kind: "petal", x: rand(0, innerWidth), y: -20, vx: rand(-0.4, 0.4), vy: rand(0.8, 1.6), g: 0, s: rand(5, 9), color: pick(["#f4a7b9", "#fbd9e0", "#f7c0cc", "#fff"]), max: 900, sway: rand(0.01, 0.03) });
    if (performance.now() < end) setTimeout(drop, 120);
  })();
}
function confetti(x = innerWidth / 2, y = innerHeight / 2, n = 90) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), s = rand(3, 9);
    add({ kind: pick(["dot", "rect", "petal"]), x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3, g: 0.16, s: rand(5, 10), color: pick(PAL), max: 200 });
  }
}
function cannons() {
  for (let i = 0; i < 60; i++) {
    for (const side of [0, 1]) {
      const a = side ? rand(-2.5, -1.9) : rand(-1.25, -0.65), s = rand(9, 17);
      add({ kind: pick(["dot", "rect", "petal"]), x: side ? innerWidth : 0, y: innerHeight * 0.85, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.2, s: rand(5, 10), color: pick(PAL), max: 220 });
    }
  }
}

/* =========================================================
   Sound: music-box "Happy Birthday" + small effects
   ========================================================= */
let audio = null;
const ac = () => {
  audio ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === "suspended") audio.resume();
  return audio;
};
function tone(f, t, dur, { type = "sine", vol = 0.14, out } = {}) {
  const a = ac(), o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out || a.destination);
  o.start(t); o.stop(t + dur + 0.05);
}
const NOTE = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
const SONG = [
  ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
];
const musicBtn = $("#musicBtn");
let music = null;
function playSong() {
  const a = ac(), master = a.createGain();
  master.connect(a.destination);
  const beat = 0.44;
  let t = a.currentTime + 0.1;
  for (const [n, b] of SONG) {
    tone(NOTE[n] * 2, t, 1.2, { out: master, vol: 0.12 });       // music-box bell
    tone(NOTE[n] * 4, t, 0.4, { out: master, vol: 0.025 });      // sparkle overtone
    t += b * beat;
  }
  music = { master, timer: setTimeout(() => { stopSong(); setTimeout(playSong, 1500); }, (t - a.currentTime) * 1000) };
  musicBtn.classList.add("on");
  musicBtn.textContent = "♫ music on";
}
function stopSong() {
  if (!music) return;
  clearTimeout(music.timer);
  const m = music.master;
  m.gain.setTargetAtTime(0, ac().currentTime, 0.05);
  setTimeout(() => m.disconnect(), 300);
  music = null;
  musicBtn.classList.remove("on");
  musicBtn.textContent = "♪ music";
}
musicBtn.addEventListener("click", () => (music ? stopSong() : playSong()));
function chime() {
  const t = ac().currentTime;
  [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.07, 0.7, { vol: 0.06 }));
}
function pluck() { tone(rand(900, 1400), ac().currentTime, 0.3, { vol: 0.05 }); }
function woof() {
  const a = ac(), t = a.currentTime, o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(440, t);
  o.frequency.exponentialRampToValueAtTime(190, t + 0.15);
  f.type = "lowpass"; f.frequency.value = 1100;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(f).connect(g).connect(a.destination);
  o.start(t); o.stop(t + 0.25);
}

/* =========================================================
   02 · Pick your blooms
   ========================================================= */
const MAX = 10, MIN = 3;
const chosen = new Set(CONFIG.bouquet.filter((id) => FLOWERS[id]));
const grid = $("#grid");
const countEl = $("#count");
function updateCount() {
  countEl.textContent = `(${chosen.size} / ${MAX})`;
  $("#wrapBtn").disabled = chosen.size < MIN;
}
for (const [id, f] of Object.entries(FLOWERS)) {
  const b = document.createElement("button");
  b.className = "bloom-card" + (chosen.has(id) ? " on" : "");
  b.innerHTML = `<svg class="doodle" viewBox="-32 -42 64 70"><g class="wob">${f.draw()}</g></svg><span>${f.name}</span>`;
  b.addEventListener("click", () => {
    if (chosen.has(id)) chosen.delete(id);
    else if (chosen.size < MAX) chosen.add(id);
    b.classList.toggle("on", chosen.has(id));
    pluck();
    updateCount();
  });
  grid.appendChild(b);
}
updateCount();

/* =========================================================
   03 · Bouquet
   ========================================================= */
// head positions, back row first so front flowers overlap
const SLOTS = [
  [200, 118], [140, 138], [262, 136], [96, 182], [306, 180],
  [170, 186], [236, 190], [124, 236], [278, 234], [200, 240],
];
const STEM_END = [200, 400];

function leafSprig(x, y, ang, len, color) {
  const leaves = Array.from({ length: 4 }, (_, i) => {
    const t = (i + 1) / 5;
    return `<ellipse cx="${(i % 2 ? 7 : -7)}" cy="${-len * t}" rx="5" ry="10" fill="${color}" transform="rotate(${i % 2 ? 35 : -35} ${(i % 2 ? 7 : -7)} ${-len * t})"/>`;
  }).join("");
  return `<g transform="translate(${x} ${y}) rotate(${ang})"><g class="grow"><path d="M0 0 V${-len}" fill="none"/>${leaves}</g></g>`;
}

function renderBouquet(svg, ids, animate = true) {
  const order = [...ids];
  const greens = [
    leafSprig(200, 330, -48, 180, "#9cbf8f"), leafSprig(200, 330, 48, 180, "#a9c99c"),
    leafSprig(200, 330, -24, 210, "#a9c99c"), leafSprig(200, 330, 24, 210, "#9cbf8f"),
    leafSprig(200, 330, -66, 140, "#b5d3a7"), leafSprig(200, 330, 66, 140, "#b5d3a7"),
  ].join("");
  const stems = order.map((_, i) => {
    const [x, y] = SLOTS[i];
    return `<path d="M${x} ${y + 10} Q${(x + STEM_END[0]) / 2 + (x - 200) * 0.2} ${(y + STEM_END[1]) / 2} ${STEM_END[0] + (x - 200) * 0.08} ${STEM_END[1]}" fill="none" stroke="#6f9e6a" class="stem"/>`;
  }).join("");
  const heads = order.map((id, i) => {
    const [x, y] = SLOTS[i];
    const f = FLOWERS[id];
    const s = f.tall ? 1.9 : 1.7;
    const delay = animate ? 0.9 + i * 0.14 : 0;
    return `<g class="fl" data-id="${id}" transform="translate(${x} ${y}) scale(${s})">
      <g class="sway" style="animation-delay:${-i * 0.7}s"><g class="pop" style="animation-delay:${delay}s">${f.draw()}</g></g></g>`;
  }).join("");
  svg.innerHTML = `
    <g class="wob">
      <path d="M92 214 L200 448 L308 214 L282 104 L236 150 L200 92 L164 150 L118 104 Z" fill="#f6dfe3" class="${animate ? "wrap-in" : ""}"/>
      ${greens}${stems}${heads}
      <path d="M58 262 Q200 316 342 262 L226 452 Q200 462 174 452 Z" fill="#fff" />
      <path d="M58 262 Q200 316 342 262 L330 284 Q200 334 70 284 Z" fill="#f4a7b9" class="noink" opacity=".35"/>
      <path d="M120 300 L180 446 M280 300 L220 446" fill="none" opacity=".35"/>
      <g transform="translate(200 382)">
        <path d="M0 0 C-30 -24 -46 4 -26 14 C-14 18 -6 8 0 0Z" fill="#e86a7f"/>
        <path d="M0 0 C30 -24 46 4 26 14 C14 18 6 8 0 0Z" fill="#e86a7f"/>
        <path d="M-2 4 L-22 48 L-12 44 L-6 52 Z M2 4 L20 46 L10 43 L5 51 Z" fill="#e86a7f"/>
        <circle r="7" fill="#f4a7b9"/>
      </g>
    </g>`;
  // the stem strokes should stay green, not ink
  $$(".stem", svg).forEach((p) => (p.style.stroke = "#6f9e6a"));
}

const bouquetSvg = $("#bouquet");
const caption = $("#caption");
let arrangement = [];
function arrange(shuffle = false) {
  arrangement = [...chosen];
  if (shuffle) arrangement.sort(() => Math.random() - 0.5);
  renderBouquet(bouquetSvg, arrangement);
}
bouquetSvg.addEventListener("click", (e) => {
  const fl = e.target.closest(".fl");
  if (!fl) return;
  caption.textContent = FLOWERS[fl.dataset.id].meaning;
  pluck();
  const r = fl.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top + r.height / 2, 14);
});
renderBouquet($("#bouquetCover"), [...chosen], false);
$("#wrapBtn").addEventListener("click", () => { chime(); goTo(2); });
$("#shuffleBtn").addEventListener("click", () => { arrange(true); caption.textContent = "tap a flower to see what it means"; });

/* =========================================================
   04 · Cake
   ========================================================= */
const candlesG = $("#candles");
for (let i = 0; i < CONFIG.candles; i++) {
  const x = 120 + (i - (CONFIG.candles - 1) / 2) * 20;
  candlesG.insertAdjacentHTML("beforeend", `
    <g class="candle">
      <rect x="${x - 4}" y="44" width="8" height="30" rx="2" fill="${PAL[i % PAL.length]}"/>
      <path d="M${x - 4} 52 l8 -4 M${x - 4} 60 l8 -4 M${x - 4} 68 l8 -4" fill="none" stroke-width="1"/>
      <path d="M${x} 44 v-5" fill="none"/>
      <path class="flame" d="M${x} 38 c-6 -6 -4 -14 0 -20 c4 6 6 14 0 20z" fill="#f6d365"/>
      <path class="smoke" d="M${x} 36 c-4 -5 4 -8 0 -13 c-4 -5 4 -8 0 -12"/>
    </g>`);
}
let blown = false;
async function blow() {
  if (blown) return;
  blown = true;
  stopMic();
  const candles = $$(".candle", candlesG).sort(() => Math.random() - 0.5);
  for (const c of candles) { c.classList.add("out"); await wait(150); }
  await wait(250);
  $("#cake").classList.add("cheer");
  $("#cakeText").textContent = "yay! your wish is on its way ✿";
  cannons();
  if (!music) playSong();
  hide($("#cakeBtns"));
  show($("#cakeNext"));
}
$("#blowBtn").addEventListener("click", blow);

let mic = null;
async function toggleMic() {
  const btn = $("#micBtn");
  if (mic) return stopMic();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const an = ac().createAnalyser();
    an.fftSize = 512;
    ac().createMediaStreamSource(stream).connect(an);
    const data = new Uint8Array(an.frequencyBinCount);
    let loud = 0;
    mic = { stream, raf: 0 };
    btn.classList.add("listening");
    btn.textContent = "listening… blow!";
    const listen = () => {
      if (!mic) return;
      an.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < 24; i++) sum += data[i];
      loud = sum / 24 > 110 ? loud + 1 : Math.max(0, loud - 1);
      if (loud > 8) return blow();
      mic.raf = requestAnimationFrame(listen);
    };
    listen();
  } catch {
    btn.textContent = "no mic, use the button";
    btn.disabled = true;
  }
}
function stopMic() {
  if (!mic) return;
  cancelAnimationFrame(mic.raf);
  mic.stream.getTracks().forEach((t) => t.stop());
  mic = null;
  $("#micBtn").classList.remove("listening");
  $("#micBtn").textContent = "use mic 🎤";
}
$("#micBtn").addEventListener("click", toggleMic);
if (!navigator.mediaDevices?.getUserMedia) hide($("#micBtn"));

/* =========================================================
   05 · Puppy
   ========================================================= */
const pupStage = $("#pupStage");
const puppy = $("#puppy");
const bubble = $("#bubble");
const WOOFS = [
  `woof! happy birthday ${NAME}!`, "i brought you a tulip ✿", "you're my favourite human",
  "can i have some cake?", "belly rubs please!", "woof woof, love you!",
];
let pupHere = false, woofIdx = 0;
async function openDoor() {
  if (pupHere) return;
  pupHere = true;
  hide($("#pupBtn"));
  pupStage.classList.add("here");
  $("#pupText").textContent = "a birthday puppy came to deliver a flower!";
  await wait(900);
  woof();
  bubble.textContent = WOOFS[0];
  bubble.classList.add("show");
  show($("#pupHint"));
  await wait(1000);
  show($("#pupNext"));
}
puppy.addEventListener("click", (e) => {
  if (!pupHere) return;
  woof();
  puppy.classList.remove("happy");
  void puppy.getBoundingClientRect();
  puppy.classList.add("happy");
  bubble.textContent = WOOFS[++woofIdx % WOOFS.length];
  const r = pupStage.getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    const h = document.createElement("span");
    h.className = "pop-heart";
    h.textContent = pick(["♥", "✿", "♥", "❀"]);
    h.style.cssText = `left:${e.clientX - r.left - 8}px;top:${e.clientY - r.top - 10}px;--x:${rand(-60, 60)}px;--r:${rand(-40, 40)}deg;animation-delay:${i * 60}ms`;
    pupStage.appendChild(h);
    setTimeout(() => h.remove(), 1600);
  }
});
$("#pupBtn").addEventListener("click", openDoor);

/* =========================================================
   06 · Card
   ========================================================= */
const card = $("#card");
const cardBody = $("#cardBody");
let flipped = false, skip = false;
async function flipCard() {
  if (flipped) { skip = true; return; }
  flipped = true;
  card.classList.add("flipped");
  chime();
  await wait(900);
  const text = CONFIG.message.join("\n\n");
  const node = document.createTextNode("");
  const caret = Object.assign(document.createElement("span"), { className: "caret" });
  cardBody.append(node, caret);
  for (const ch of text) {
    if (skip) { node.textContent = text; break; }
    node.textContent += ch;
    await wait(ch === "\n" ? 180 : /[.,!?—]/.test(ch) ? 90 : 16);
  }
  caret.remove();
  show($("#cardSign"));
  petals(4000);
  show($("#cardNext"));
}
card.addEventListener("click", flipCard);
card.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && flipCard());

/* =========================================================
   07 · Write anything
   ========================================================= */
const noteForm = $("#noteForm");
const noteStatus = $("#noteStatus");
noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $("#noteText").value.trim();
  if (!text) return;
  const btn = $("#noteSend");
  btn.disabled = true;
  noteStatus.textContent = "…";
  const db = window.NOTES;
  let ok = !db?.url;
  if (db?.url) {
    try {
      const res = await fetch(`${db.url}/rest/v1/notes`, {
        method: "POST",
        headers: {
          apikey: db.anonKey,
          Authorization: `Bearer ${db.anonKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ name: NAME, message: text }),
      });
      ok = res.ok;
    } catch { ok = false; }
  }
  if (!ok) {
    noteStatus.textContent = "hmm, that didn't work — try again?";
    btn.disabled = false;
    return;
  }
  noteForm.classList.add("sent");
  chime();
  await wait(900);
  hide(noteForm);
  noteStatus.textContent = "beautiful ♥";
  petals(3000);
  hide($("#noteBtns"));
  show($("#noteNext"));
});

/* =========================================================
   08 · Finale
   ========================================================= */
function party() {
  cannons();
  setTimeout(() => confetti(innerWidth / 2, innerHeight / 3, 100), 400);
}
$("#partyBtn").addEventListener("click", party);
$("#replayBtn").addEventListener("click", () => location.reload());

const onEnter = {
  2: () => { arrange(); setTimeout(() => petals(3500), 1600); },
  7: () => { renderBouquet($("#bouquetFinal"), arrangement, true); party(); petals(5000); if (!music) playSong(); },
};
