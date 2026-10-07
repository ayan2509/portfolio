// Lego tree (instruction-manual style, line only) that grows from a single 1x1 brick:
// bar segments extend into a trunk, branches sprout, then flower-stem and leaf elements pop on.
import { brick } from './lineObjects.js';

const DW = 640, DH = 672; // design space; drawing is anchored bottom-right of the canvas
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeBack = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const P = (x, y) => ({ x, y });

const T = [P(578, 632), P(574, 548), P(566, 462), P(552, 380), P(530, 302), P(502, 232), P(474, 168)];

// timeline (seconds at base speed)
const ITEMS = [];
const add = (type, t, dur, p) => ITEMS.push({ type, t, dur, ...p });
add('brick', 0, 0.35, {});
for (let i = 0; i < 6; i++) add('tube', 0.9 + i * 0.28, 0.28, { a: T[i], b: T[i + 1], r: i < 3 ? 6.5 : 5.5, ring: i > 0 });
// branches
add('tube', 1.5, 0.35, { a: T[2], b: P(606, 412), r: 4.5 });
add('tube', 2.05, 0.3, { a: T[4], b: P(470, 270), r: 4.5 });
add('tube', 2.35, 0.3, { a: P(470, 270), b: P(418, 244), r: 4.5 });
add('tube', 2.3, 0.3, { a: T[5], b: P(560, 176), r: 4.5 });
add('tube', 2.6, 0.3, { a: T[6], b: P(432, 112), r: 4.5 });
add('tube', 2.95, 0.35, { a: P(432, 112), b: P(352, 64), r: 4 });
add('joint', 1.46, 0.2, { c: T[2], r: 9 });
add('joint', 2.02, 0.2, { c: T[4], r: 8.5 });
add('joint', 2.3, 0.2, { c: T[5], r: 8 });
add('joint', 2.6, 0.2, { c: T[6], r: 8 });
add('joint', 2.62, 0.2, { c: P(470, 270), r: 7 });
add('joint', 2.92, 0.2, { c: P(432, 112), r: 7 });
// foliage
add('star', 1.85, 0.35, { c: P(604, 404), n: 5, L: 24, rot: 0.3, sy: 0.6 });
add('leaf', 1.95, 0.3, { c: P(598, 420), ang: 2.2, size: 20 });
add('leaf', 2.05, 0.3, { c: P(612, 392), ang: -1.2, size: 18 });
add('leaf', 2.6, 0.3, { c: P(560, 176), ang: -0.9, size: 22 });
add('leaf', 2.7, 0.3, { c: P(566, 182), ang: 0.4, size: 20 });
add('star', 2.68, 0.35, { c: P(414, 242), n: 6, L: 30, rot: 0.1, sy: 0.58 });
add('leaf', 2.8, 0.3, { c: P(430, 254), ang: 1.4, size: 20 });
add('leaf', 2.85, 0.3, { c: P(396, 232), ang: -2.4, size: 19 });
add('star', 2.95, 0.4, { c: P(430, 104), n: 6, L: 40, rot: 0.5, sy: 0.6 });
add('leaf', 3.05, 0.3, { c: P(452, 92), ang: -0.7, size: 24 });
add('leaf', 3.1, 0.3, { c: P(414, 124), ang: 2.4, size: 22 });
add('leaf', 3.0, 0.3, { c: P(474, 160), ang: -1.6, size: 22 });
add('star', 3.3, 0.4, { c: P(346, 58), n: 5, L: 34, rot: -0.2, sy: 0.58 });
add('leaf', 3.4, 0.3, { c: P(372, 40), ang: -1.0, size: 22 });
add('leaf', 3.45, 0.3, { c: P(322, 70), ang: 3.0, size: 20 });
// extra branches along the stem
add('tube', 1.2, 0.3, { a: T[1], b: P(640, 522), r: 4 });
add('joint', 1.18, 0.2, { c: T[1], r: 8.5 });
add('star', 1.5, 0.35, { c: P(650, 516), n: 5, L: 22, rot: 0.8, sy: 0.6 });
add('leaf', 1.6, 0.3, { c: P(640, 530), ang: 1.4, size: 18 });
add('tube', 1.25, 0.3, { a: T[1], b: P(520, 512), r: 4 });
add('leaf', 1.55, 0.3, { c: P(520, 512), ang: -2.6, size: 20 });
add('tube', 1.85, 0.3, { a: P(606, 412), b: P(662, 392), r: 4 });
add('star', 2.15, 0.35, { c: P(670, 388), n: 6, L: 24, rot: 0.2, sy: 0.6 });
add('leaf', 2.25, 0.3, { c: P(660, 404), ang: 1.8, size: 18 });
add('joint', 1.74, 0.2, { c: T[3], r: 8.5 });
add('tube', 1.78, 0.3, { a: T[3], b: P(632, 350), r: 4.5 });
add('tube', 2.08, 0.3, { a: P(632, 350), b: P(684, 324), r: 4 });
add('joint', 2.06, 0.2, { c: P(632, 350), r: 6.5 });
add('star', 2.38, 0.35, { c: P(688, 320), n: 5, L: 26, rot: -0.4, sy: 0.6 });
add('leaf', 2.45, 0.3, { c: P(676, 336), ang: 1.6, size: 20 });
add('leaf', 2.5, 0.3, { c: P(650, 340), ang: -1.4, size: 18 });
add('tube', 1.8, 0.3, { a: T[3], b: P(492, 352), r: 4 });
add('leaf', 2.1, 0.3, { c: P(492, 352), ang: -2.2, size: 22 });
add('tube', 2.1, 0.3, { a: T[4], b: P(604, 282), r: 4.5 });
add('tube', 2.4, 0.3, { a: P(604, 282), b: P(654, 250), r: 4 });
add('star', 2.7, 0.35, { c: P(660, 244), n: 6, L: 26, rot: 0.6, sy: 0.6 });
add('leaf', 2.78, 0.3, { c: P(640, 262), ang: 2.0, size: 18 });
add('tube', 2.65, 0.3, { a: P(560, 176), b: P(618, 150), r: 4 });
add('star', 2.95, 0.35, { c: P(626, 146), n: 5, L: 24, rot: 0.1, sy: 0.6 });
add('leaf', 3.05, 0.3, { c: P(616, 164), ang: 1.5, size: 18 });
add('leaf', 1.3, 0.3, { c: P(571, 500), ang: 0.1, size: 18 });
add('leaf', 1.6, 0.3, { c: P(561, 420), ang: -0.4, size: 18 });
add('leaf', 1.9, 0.3, { c: P(542, 340), ang: 0.3, size: 18 });
add('leaf', 2.2, 0.3, { c: P(516, 266), ang: -0.6, size: 18 });
add('leaf', 2.45, 0.3, { c: P(488, 200), ang: 0.2, size: 18 });
add('tube', 2.62, 0.3, { a: T[6], b: P(520, 104), r: 4 });
add('star', 2.92, 0.35, { c: P(524, 96), n: 5, L: 26, rot: 0.9, sy: 0.6 });
add('leaf', 3.0, 0.3, { c: P(540, 86), ang: -0.6, size: 20 });
ITEMS.forEach(i => { if (i.type === 'star') i.L *= 1.35; if (i.type === 'leaf') i.size *= 1.5; });
const GROW = Math.max(...ITEMS.map(i => i.t + i.dur));

const hex = (s, d) => { const m = /^#?([0-9a-f]{6})$/i.exec((s || '').trim()); if (!m) return d; const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
function mix(alpha, bg = [239, 232, 216], ink = [36, 38, 42]) {
  return 'rgb(' + bg.map((b, i) => Math.round(b + (ink[i] - b) * alpha)).join(',') + ')';
}

function drawBrick(ctx, k, inkC, bg, lw) {
  const S = 20, ox = 578, oy = 668 - S, dz = (1 - easeOut(k)) * 1.2;
  const pc = brick(0, 0, dz, 1, 1, 1.2, 'one');
  const tf = q => [ox + q[0] * S, oy + q[1] * S];
  const poly = pl => { ctx.beginPath(); pl.forEach((q, i) => { const p = tf(q); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); };
  ctx.lineWidth = lw; ctx.strokeStyle = inkC; ctx.fillStyle = bg;
  pc.fills.forEach(f => { poly(f); ctx.closePath(); ctx.fill(); });
  pc.lines.forEach(pl => { poly(pl); ctx.stroke(); });
}
function drawTube(ctx, it, k, inkC, bg, lw) {
  const e = easeOut(k), a = it.a, b = P(it.a.x + (it.b.x - it.a.x) * e, it.a.y + (it.b.y - it.a.y) * e);
  const ang = Math.atan2(b.y - a.y, b.x - a.x), r = it.r;
  ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = inkC; ctx.lineWidth = 2 * r + 2 * lw; ctx.stroke();
  ctx.strokeStyle = bg; ctx.lineWidth = 2 * r; ctx.stroke();
  ctx.lineWidth = lw; ctx.strokeStyle = inkC; ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(b.x, b.y, r + lw / 2, (r + lw / 2) * 0.42, ang + Math.PI / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (it.ring) { ctx.beginPath(); ctx.ellipse(a.x, a.y, r + 1.5, (r + 1.5) * 0.42, ang + Math.PI / 2, 0, Math.PI); ctx.stroke(); }
}
function drawJoint(ctx, it, k, inkC, bg, lw) {
  const s = easeBack(k), r = it.r * s; if (r <= 0) return;
  ctx.lineWidth = lw; ctx.strokeStyle = inkC; ctx.fillStyle = bg;
  ctx.beginPath(); ctx.arc(it.c.x, it.c.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(it.c.x, it.c.y, r * 0.45, 0, Math.PI * 2); ctx.stroke();
}
function drawStar(ctx, it, k, inkC, bg, lw) {
  const s = Math.max(0.001, easeBack(k));
  ctx.save(); ctx.translate(it.c.x, it.c.y); ctx.scale(s, s); ctx.rotate(it.rot * 0.4); ctx.scale(1, it.sy); ctx.rotate(it.rot + (1 - k) * 0.6);
  const aw = it.L * 0.26, er = it.L * 0.26, cr = it.L * 0.3, ends = [];
  for (let i = 0; i < it.n; i++) { const t = (i / it.n) * Math.PI * 2; ends.push([Math.cos(t) * it.L, Math.sin(t) * it.L]); }
  const layer = (col, extra) => {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = aw + extra * 2;
    ctx.beginPath(); ends.forEach(([x, y]) => { ctx.moveTo(0, 0); ctx.lineTo(x * 0.8, y * 0.8); }); ctx.stroke();
    ends.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, er + extra, 0, Math.PI * 2); ctx.fill(); });
    ctx.beginPath(); ctx.arc(0, 0, cr + extra, 0, Math.PI * 2); ctx.fill();
  };
  layer(inkC, lw); layer(bg, 0);
  ctx.lineWidth = lw; ctx.strokeStyle = inkC;
  ends.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, er * 0.45, 0, Math.PI * 2); ctx.stroke(); });
  ctx.beginPath(); ctx.arc(0, 0, cr * 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
function drawLeaf(ctx, it, k, inkC, bg, lw) {
  const s = Math.max(0, easeBack(k)); if (s <= 0) return;
  ctx.lineWidth = lw; ctx.strokeStyle = inkC; ctx.fillStyle = bg; ctx.lineCap = 'round';
  [-0.62, 0, 0.62].forEach((o, j) => {
    const a = it.ang + o * s, L = it.size * s * (j === 1 ? 1 : 0.82);
    const dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx, b = it.c;
    const tip = P(b.x + dx * L, b.y + dy * L);
    ctx.beginPath(); ctx.moveTo(b.x, b.y);
    ctx.quadraticCurveTo(b.x + dx * L * 0.45 + px * L * 0.42, b.y + dy * L * 0.45 + py * L * 0.42, tip.x, tip.y);
    ctx.quadraticCurveTo(b.x + dx * L * 0.45 - px * L * 0.42, b.y + dy * L * 0.45 - py * L * 0.42, b.x, b.y);
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x + dx * L * 0.12, b.y + dy * L * 0.12); ctx.lineTo(b.x + dx * L * 0.7, b.y + dy * L * 0.7); ctx.stroke();
  });
}

// opts: { alpha (line strength 0..1), bg, lineWidth, speed (1 = base), hold, fade, static }
export function drawTree(ctx, w, h, t, opts = {}) {
  const sp = opts.speed || 1, grow = GROW / sp, hold = opts.hold ?? 4, fade = opts.fade ?? 1, gap = 0.6;
  const cycle = grow + hold + fade + gap, tt = opts.static ? grow : opts.once ? Math.min(t, grow) : t % cycle;
  const fadeA = tt < grow + hold ? 1 : tt < grow + hold + fade ? 1 - (tt - grow - hold) / fade : 0;
  const fA = opts.fadeOverride != null ? opts.fadeOverride : fadeA;
  if (fA <= 0) return;
  const sc = Math.min(w / DW, h / DH), k0 = opts.scale || 1, bg = opts.bg || '#EFE8D8', inkC = mix(opts.alpha ?? 0.3, hex(bg, [239, 232, 216]), hex(opts.text, [36, 38, 42])), lw = (opts.lineWidth || 1.25) / (sc * k0);
  ctx.save(); ctx.translate((opts.centre ? (w - DW * sc) / 2 : w - DW * sc) + (opts.shiftX ?? -100) * sc, h - DH * sc); ctx.scale(sc, sc);
  if (opts.mirror || k0 !== 1) { ctx.translate(578, 668); ctx.scale(opts.mirror ? -k0 : k0, k0); ctx.translate(-578, -668); }
  ctx.globalAlpha = fA; ctx.lineJoin = 'round';
  for (const it of ITEMS) {
    const k = Math.min(1, Math.max(0, (tt - it.t / sp) / (it.dur / sp)));
    if (k <= 0) continue;
    if (it.type === 'brick') drawBrick(ctx, k, inkC, bg, lw);
    else if (it.type === 'tube') drawTube(ctx, it, k, inkC, bg, lw);
    else if (it.type === 'joint') drawJoint(ctx, it, k, inkC, bg, lw);
    else if (it.type === 'star') drawStar(ctx, it, k, inkC, bg, lw);
    else if (it.type === 'leaf') drawLeaf(ctx, it, k, inkC, bg, lw);
  }
  ctx.restore();
}

export function mountTree(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const o = reduced ? { ...opts, static: true } : opts;
  const t0 = performance.now(); let raf, last = 0;
  const frame = now => {
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return; last = now;
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.round(w * dpr), H = Math.round(h * dpr);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    if (o.theme === 'auto') { const cs = getComputedStyle(canvas); o.bg = cs.getPropertyValue('--bg').trim() || o.bg; o.text = cs.getPropertyValue('--text').trim() || o.text; }
    const t = (now - t0) / 1000, list = o.trees || [o];
    if (o.loop && !reduced) {
      const m = { ...o, ...list[0] }, g = GROW / (m.speed || 1), hold = m.hold ?? 4, fade = m.fade ?? 1, cyc = g + hold + fade + 0.6, tc = t % cyc;
      const fa = tc < g + hold ? 1 : tc < g + hold + fade ? 1 - (tc - g - hold) / fade : 0;
      list.forEach(tr => drawTree(ctx, w, h, tc - (tr.delay || 0), { ...o, ...tr, once: true, fadeOverride: fa }));
      return;
    }
    let done = !reduced;
    list.forEach(tr => { const c = { ...o, ...tr }; drawTree(ctx, w, h, t - (tr.delay || 0), c); if (!c.once || t - (tr.delay || 0) < GROW / (c.speed || 1) + 0.1) done = false; });
    if (done || reduced) cancelAnimationFrame(raf);
  };
  raf = requestAnimationFrame(frame);
  return { destroy() { cancelAnimationFrame(raf); } };
}
