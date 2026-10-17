/* =========================================================
   ✏️  PERSONALIZE HERE
   You can also use the link:  index.html?name=Riya&from=Dave
   ========================================================= */
const CONFIG = {
  name: "Sweetheart",          // birthday person's name
  from: "Me",                  // your name
  candles: 5,
  message: [
    "Happy birthday! 🎂",
    "Today the whole world got a little brighter, because it's the day you arrived in it. Thank you for every laugh, every late-night talk, and every tiny moment that you turned into something special.",
    "I hope this year brings you as much happiness as you bring to everyone around you — more adventures, more cake, more flowers, and more reasons to smile.",
    "Never forget how loved you are. Today, tomorrow, and always. 💗"
  ]
};

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const params = new URLSearchParams(location.search);
const NAME = params.get("name") || CONFIG.name;
const FROM = params.get("from") || CONFIG.from;
$$(".js-name").forEach((el) => (el.textContent = NAME));
$$(".js-from").forEach((el) => (el.textContent = FROM));
document.title = `Happy Birthday, ${NAME}! 🎂`;

/* =========================================================
   Scenes
   ========================================================= */
const scenes = $$(".scene");
const dotsEl = $("#dots");
scenes.forEach(() => dotsEl.appendChild(Object.assign(document.createElement("span"), { className: "dot" })));
let current = 0;

function updateDots() {
  $$(".dot", dotsEl).forEach((d, i) => d.classList.toggle("on", i === current));
}
async function goTo(i) {
  if (i === current || i < 0 || i >= scenes.length) return;
  const from = scenes[current];
  from.classList.add("leaving");
  from.classList.remove("active");
  await wait(420);
  from.classList.remove("leaving");
  current = i;
  scenes[i].classList.add("active");
  updateDots();
  window.scrollTo({ top: 0, behavior: "smooth" });
  onEnter[i]?.();
}
updateDots();
$$("[data-next]").forEach((b) => b.addEventListener("click", () => goTo(current + 1)));
const reveal = (el) => el.classList.remove("hidden");
const conceal = (el) => el.classList.add("hidden");

/* =========================================================
   Particle effects (confetti, petals, hearts, sparkles)
   ========================================================= */
const fx = $("#fx");
const ctx = fx.getContext("2d");
let particles = [];
let running = false;
const COLORS = ["#ff8fb6", "#f0659a", "#c9b8ff", "#ffd36e", "#8fe3c4", "#ffb38a", "#ffffff"];
const PETALS = ["#ffc2d6", "#ff9fc0", "#ffd9e6", "#f7a3c0", "#fff0f5"];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  fx.width = innerWidth * dpr;
  fx.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

function spawn(type, x, y, opts = {}) {
  const p = { type, x, y, life: 0, rot: rand(0, Math.PI * 2), vr: rand(-0.2, 0.2) };
  if (type === "confetti") {
    const a = opts.angle ?? rand(0, Math.PI * 2);
    const s = opts.speed ?? rand(4, 12);
    Object.assign(p, { vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, w: rand(6, 11), h: rand(8, 16), color: pick(COLORS), g: 0.22, drag: 0.985, max: 220 });
  } else if (type === "petal") {
    Object.assign(p, { vx: rand(-0.6, 0.6), vy: rand(0.8, 2), w: rand(10, 18), h: rand(6, 10), color: pick(PETALS), g: 0, drag: 1, max: 900, sway: rand(0.01, 0.03), phase: rand(0, 6) });
  } else if (type === "heart") {
    Object.assign(p, { vx: rand(-1.5, 1.5), vy: rand(-3, -1), size: rand(14, 28), color: pick(["#f0659a", "#ff8fb6", "#ff6f91", "#c98bff"]), g: -0.01, drag: 0.99, max: 160, rot: 0, vr: 0 });
  } else if (type === "sparkle") {
    const a = rand(0, Math.PI * 2), s = rand(1, 5);
    Object.assign(p, { vx: Math.cos(a) * s, vy: Math.sin(a) * s, size: rand(2, 5), color: pick(["#fff7c2", "#ffffff", "#ffd36e"]), g: 0.02, drag: 0.96, max: 70 });
  }
  particles.push(p);
  if (!running) { running = true; requestAnimationFrame(tick); }
}

function tick() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter((p) => p.life < p.max && p.y < innerHeight + 60);
  for (const p of particles) {
    p.life++;
    p.vx *= p.drag; p.vy = p.vy * p.drag + p.g;
    if (p.type === "petal") p.x += Math.sin(p.life * p.sway + p.phase) * 1.2;
    p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    const fade = Math.min(1, (p.max - p.life) / 40);
    ctx.save();
    ctx.globalAlpha = Math.max(0, fade);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.type === "confetti") {
      ctx.scale(1, Math.cos(p.life * 0.2));
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    } else if (p.type === "petal") {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha *= 0.5;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(-p.w / 6, -p.h / 8, p.w / 6, p.h / 6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "heart") {
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("♥", 0, 0);
    } else {
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.moveTo(0, 0); ctx.lineTo(p.size * 0.35, p.size * 0.35); ctx.lineTo(0, p.size * 2.2);
      }
      ctx.fill();
    }
    ctx.restore();
  }
  if (particles.length) requestAnimationFrame(tick);
  else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
}

function confettiBurst(x = innerWidth / 2, y = innerHeight / 2, n = 120) {
  for (let i = 0; i < n; i++) spawn("confetti", x, y);
}
function confettiCannons() {
  for (let i = 0; i < 70; i++) {
    spawn("confetti", 0, innerHeight * 0.8, { angle: rand(-1.3, -0.6), speed: rand(10, 20) });
    spawn("confetti", innerWidth, innerHeight * 0.8, { angle: rand(-2.5, -1.8), speed: rand(10, 20) });
  }
}
function petalRain(ms = 6000) {
  const end = performance.now() + ms;
  (function drop() {
    for (let i = 0; i < 2; i++) spawn("petal", rand(-20, innerWidth + 20), -20);
    if (performance.now() < end) setTimeout(drop, 90);
  })();
}
function sparkleAt(el, n = 30) {
  const r = el.getBoundingClientRect();
  for (let i = 0; i < n; i++) spawn("sparkle", r.left + r.width / 2, r.top + r.height / 2);
}

/* floating background hearts / flowers */
const floaties = $("#floaties");
const FLOAT_EMOJI = ["💗", "🌸", "✨", "💕", "🌷", "🎀", "🤍"];
function addFloatie() {
  const el = document.createElement("span");
  el.className = "floatie";
  el.textContent = pick(FLOAT_EMOJI);
  const dur = rand(10, 18);
  el.style.cssText = `left:${rand(0, 100)}vw;font-size:${rand(14, 28)}px;animation-duration:${dur}s;--sway:${rand(-80, 80)}px;--spin:${rand(-90, 90)}deg`;
  floaties.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000);
}
for (let i = 0; i < 6; i++) setTimeout(addFloatie, i * 600);
setInterval(addFloatie, 1400);

/* balloons */
const balloonsEl = $("#balloons");
const BALLOON_COLORS = ["#ff8fb6", "#c9b8ff", "#ffd36e", "#8fe3c4", "#ffb38a", "#f0659a"];
function releaseBalloons(n = 14) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const b = document.createElement("span");
      b.className = "balloon";
      const dur = rand(7, 11);
      b.style.cssText = `left:${rand(2, 92)}vw;background:${pick(BALLOON_COLORS)};animation-duration:${dur}s;--sway:${rand(-60, 60)}px;--spin:${rand(-15, 15)}deg;transform:scale(${rand(0.8, 1.2)})`;
      balloonsEl.appendChild(b);
      setTimeout(() => b.remove(), dur * 1000);
    }, i * 220);
  }
}

/* =========================================================
   Sound: "Happy Birthday" melody + tiny effects (Web Audio)
   ========================================================= */
let audio = null;
function ac() {
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === "suspended") audio.resume();
  return audio;
}
function tone(freq, start, dur, { type = "triangle", vol = 0.18, out } = {}) {
  const a = ac();
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(out || a.destination);
  o.start(start);
  o.stop(start + dur + 0.05);
}
const N = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
const SONG = [
  ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
];
let music = null;
const musicBtn = $("#musicBtn");
function playSong() {
  const a = ac();
  const master = a.createGain();
  master.gain.value = 0.9;
  master.connect(a.destination);
  const beat = 0.42;
  let t = a.currentTime + 0.1;
  for (const [n, b] of SONG) {
    tone(N[n], t, b * beat * 1.1, { out: master, vol: 0.16 });
    tone(N[n] * 2, t, b * beat * 0.6, { out: master, type: "sine", vol: 0.04 });
    t += b * beat;
  }
  const total = (t - a.currentTime) * 1000;
  music = { master, timer: setTimeout(() => music && (stopSong(), setTimeout(playSong, 1400)), total) };
  musicBtn.classList.add("playing");
  musicBtn.textContent = "♫";
}
function stopSong() {
  if (!music) return;
  clearTimeout(music.timer);
  const m = music.master;
  m.gain.setTargetAtTime(0, ac().currentTime, 0.05);
  setTimeout(() => m.disconnect(), 300);
  music = null;
  musicBtn.classList.remove("playing");
  musicBtn.textContent = "♪";
}
musicBtn.addEventListener("click", () => (music ? stopSong() : playSong()));

function chime() {
  const t = ac().currentTime;
  [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.08, 0.6, { type: "sine", vol: 0.08 }));
}
function woof() {
  const a = ac();
  const t = a.currentTime;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(420, t);
  o.frequency.exponentialRampToValueAtTime(180, t + 0.16);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  const f = a.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 1200;
  o.connect(f).connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + 0.25);
}

/* =========================================================
   0 · Gift
   ========================================================= */
const gift = $("#gift");
let giftOpened = false;
async function openGift() {
  if (giftOpened) return;
  giftOpened = true;
  $("#giftBtn").disabled = true;
  gift.classList.add("open");
  chime();
  const r = gift.getBoundingClientRect();
  confettiBurst(r.left + r.width / 2, r.top + r.height / 2, 160);
  sparkleAt(gift, 40);
  await wait(1400);
  goTo(1);
}
gift.addEventListener("click", openGift);
gift.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && openGift());
$("#giftBtn").addEventListener("click", openGift);

/* =========================================================
   1 · Cake & candles
   ========================================================= */
const candlesEl = $("#candles");
for (let i = 0; i < CONFIG.candles; i++) {
  const c = document.createElement("div");
  c.className = "candle";
  c.innerHTML = '<span class="flame"></span><span class="smoke"></span><span class="smoke"></span>';
  candlesEl.appendChild(c);
}
let blown = false;
async function blowCandles() {
  if (blown) return;
  blown = true;
  stopMic();
  $("#blowBtn").disabled = true;
  $("#micBtn").disabled = true;
  const candles = $$(".candle", candlesEl).sort(() => Math.random() - 0.5);
  for (const c of candles) { c.classList.add("out"); await wait(140); }
  await wait(300);
  $("#cake").classList.add("cheer");
  $("#cakeText").textContent = "Yay! 🎉 Your wish is on its way to the stars ✨";
  confettiCannons();
  if (!music) playSong();
  conceal($("#blowBtn").parentElement);
  reveal($('[data-scene="1"] [data-next]'));
}
$("#blowBtn").addEventListener("click", blowCandles);

/* blow into the microphone */
let mic = null;
async function startMic() {
  const btn = $("#micBtn");
  if (mic) return stopMic();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const a = ac();
    const src = a.createMediaStreamSource(stream);
    const an = a.createAnalyser();
    an.fftSize = 512;
    src.connect(an);
    const data = new Uint8Array(an.frequencyBinCount);
    let loud = 0;
    mic = { stream, raf: 0 };
    btn.classList.add("listening");
    btn.textContent = "Listening… blow! 🌬️";
    const listen = () => {
      if (!mic) return;
      an.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < 24; i++) sum += data[i];
      loud = sum / 24 > 110 ? loud + 1 : Math.max(0, loud - 1);
      if (loud > 8) return blowCandles();
      mic.raf = requestAnimationFrame(listen);
    };
    listen();
  } catch {
    btn.textContent = "Mic not available 🙈";
    btn.disabled = true;
  }
}
function stopMic() {
  if (!mic) return;
  cancelAnimationFrame(mic.raf);
  mic.stream.getTracks().forEach((t) => t.stop());
  mic = null;
  const btn = $("#micBtn");
  btn.classList.remove("listening");
  btn.textContent = "Blow into mic 🎤";
}
$("#micBtn").addEventListener("click", startMic);
if (!navigator.mediaDevices?.getUserMedia) conceal($("#micBtn"));

/* =========================================================
   2 · Flower garden
   ========================================================= */
const SVGNS = "http://www.w3.org/2000/svg";
const flowersG = $("#flowers");
const FLOWERS = [
  { x: 48, h: 120, c: "petal2" }, { x: 96, h: 170, c: "petal" }, { x: 146, h: 138, c: "petal3" },
  { x: 200, h: 190, c: "petal" }, { x: 252, h: 145, c: "petal2" }, { x: 302, h: 175, c: "petal3" }, { x: 352, h: 125, c: "petal" },
];
FLOWERS.forEach((f, i) => {
  const base = 262, top = base - f.h, bend = (i % 2 ? 1 : -1) * 10;
  const g = document.createElementNS(SVGNS, "g");
  g.setAttribute("class", "fl");
  g.style.setProperty("--d", `${(i * 0.18).toFixed(2)}s`);
  g.innerHTML = `
    <ellipse class="bud" cx="${f.x}" cy="${base - 6}" rx="5" ry="8" fill="#8ccf8f"/>
    <path class="stem" d="M${f.x} ${base} Q${f.x + bend} ${base - f.h / 2} ${f.x} ${top}" stroke="#6dbb76" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path class="leaf l" d="M${f.x} ${base} C${f.x - 30} ${base - 14} ${f.x - 36} ${base - 50} ${f.x - 26} ${base - 66} C${f.x - 14} ${base - 46} ${f.x - 4} ${base - 26} ${f.x} ${base}Z" fill="#7fca8c"/>
    <path class="leaf r" d="M${f.x} ${base} C${f.x + 28} ${base - 10} ${f.x + 34} ${base - 40} ${f.x + 24} ${base - 54} C${f.x + 12} ${base - 36} ${f.x + 4} ${base - 20} ${f.x} ${base}Z" fill="#6dbb76"/>
    <g transform="translate(${f.x} ${top + 2})">
      <g class="head">
        <path d="M-12 0 C-16 -18 -12 -36 0 -42 C12 -36 16 -18 12 0 C6 4 -6 4 -12 0Z" fill="url(#${f.c})"/>
        <path class="p l" d="M2 2 C-20 2 -24 -24 -16 -38 C-8 -30 -2 -24 3 -16Z" fill="url(#${f.c})" opacity=".95"/>
        <path class="p r" d="M-2 2 C20 2 24 -24 16 -38 C8 -30 2 -24 -3 -16Z" fill="url(#${f.c})" opacity=".95"/>
      </g>
    </g>`;
  flowersG.appendChild(g);
});
let bloomed = false;
async function bloom() {
  if (bloomed) return;
  bloomed = true;
  conceal($("#bloomBtn"));
  $("#garden").classList.add("bloom");
  $("#flowerText").textContent = "Look at them bloom… just like you 🌷";
  chime();
  await wait(2200);
  petalRain(7000);
  sparkleAt($("#garden"), 40);
  await wait(1200);
  $("#flowerText").textContent = "A bouquet of pink tulips — all for you 💐";
  reveal($('[data-scene="2"] [data-next]'));
}
$("#bloomBtn").addEventListener("click", bloom);

/* =========================================================
   3 · Puppy
   ========================================================= */
const pupStage = $("#pupStage");
const puppy = $("#puppy");
const bubble = $("#bubble");
const WOOFS = [
  `Woof! Happy Birthday, ${NAME}! 🎉`, "You're my favorite human! 💗", "Can I have some cake? 🎂",
  "Belly rubs please! 🐾", "Best birthday ever! ✨", "Woof woof! I love you! 🥰",
];
let pupHere = false;
async function callPuppy() {
  if (pupHere) return;
  pupHere = true;
  conceal($("#pupBtn"));
  pupStage.classList.add("here");
  $("#pupText").textContent = "It's a birthday puppy! 🐶";
  await wait(900);
  woof();
  bubble.textContent = WOOFS[0];
  bubble.classList.add("show");
  reveal($("#pupHint"));
  await wait(1200);
  reveal($('[data-scene="3"] [data-next]'));
}
let woofIdx = 0;
function petPuppy(e) {
  if (!pupHere) return;
  woof();
  puppy.classList.remove("happy");
  void puppy.getBoundingClientRect();
  puppy.classList.add("happy");
  bubble.textContent = WOOFS[++woofIdx % WOOFS.length];
  const r = pupStage.getBoundingClientRect();
  const x = (e.clientX ?? r.left + r.width / 2) - r.left;
  const y = (e.clientY ?? r.top + r.height / 2) - r.top;
  for (let i = 0; i < 7; i++) {
    const h = document.createElement("span");
    h.className = "pop-heart";
    h.textContent = pick(["💗", "💕", "🦴", "💖", "🐾"]);
    h.style.cssText = `left:${x - 10}px;top:${y - 10}px;--x:${rand(-70, 70)}px;animation-delay:${i * 60}ms`;
    pupStage.appendChild(h);
    setTimeout(() => h.remove(), 1700);
  }
}
$("#pupBtn").addEventListener("click", callPuppy);
puppy.addEventListener("click", petPuppy);

/* =========================================================
   4 · Letter
   ========================================================= */
const envelope = $("#envelope");
const body = $("#letterBody");
let letterOpened = false;
let skipTyping = false;
async function openLetter() {
  if (letterOpened) return;
  letterOpened = true;
  conceal($("#letterBtn"));
  envelope.classList.add("open");
  chime();
  await wait(700);
  envelope.classList.add("out");
  await wait(900);
  envelope.classList.add("read");
  $("#letterSub").textContent = "(tap the letter to skip ahead)";
  await typeMessage(CONFIG.message.join("\n\n"));
  $("#letterSub").textContent = "Every word, from my heart 💗";
  reveal($("#letterFrom"));
  for (let i = 0; i < 24; i++) setTimeout(() => spawn("heart", rand(0, innerWidth), innerHeight + 10), i * 80);
  reveal($('[data-scene="4"] [data-next]'));
}
async function typeMessage(text) {
  const caret = document.createElement("span");
  caret.className = "caret";
  const node = document.createTextNode("");
  body.append(node, caret);
  for (let i = 0; i < text.length; i++) {
    if (skipTyping) { node.textContent = text; break; }
    node.textContent += text[i];
    const ch = text[i];
    await wait(ch === "\n" ? 260 : /[.!?,—]/.test(ch) ? 180 : 26);
  }
  caret.remove();
}
$("#letterBtn").addEventListener("click", openLetter);
envelope.addEventListener("click", () => (letterOpened ? (skipTyping = true) : openLetter()));

/* =========================================================
   5 · Finale
   ========================================================= */
function party() {
  confettiCannons();
  releaseBalloons();
  setTimeout(() => confettiBurst(innerWidth / 2, innerHeight / 3, 140), 500);
}
const onEnter = { 5: () => { party(); petalRain(5000); if (!music) playSong(); } };
$("#partyBtn").addEventListener("click", party);
$("#replayBtn").addEventListener("click", () => location.reload());
