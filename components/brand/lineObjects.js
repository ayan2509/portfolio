// Isometric Lego line drawings (joystick, car, book) that draw themselves on, hold, fade, then hand over.
const C30 = 0.866, S30 = 0.5;
const iso = (X, Y, Z) => [(X - Y) * C30, (X + Y) * S30 - Z];

function face(pts) { return pts.map(p => iso(...p)); }
export function brick(x, y, z, w, d, h, studs) {
  const zt = z + h;
  const fy = face([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, zt], [x, y + d, zt]]);
  const fx = face([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, zt], [x + w, y, zt]]);
  const top = face([[x, y, zt], [x + w, y, zt], [x + w, y + d, zt], [x, y + d, zt]]);
  const piece = { fills: [fy, fx, top], lines: [close(fy), close(fx), close(top)] };
  const centres = studs === 'one' ? [[x + w / 2, y + d / 2]] : studs === 'grid' ? grid(x, y, w, d) : [];
  centres.forEach(([cx, cy]) => cyl(piece, cx, cy, zt, 0.3, 0.2));
  return piece;
}
function column(cx, cy, z, r, h) { const p = { fills: [], lines: [] }; cyl(p, cx, cy, z, r, h); return p; }
function ball(cx, cy, z, r) {
  const c = iso(cx, cy, z), R = r * 1.0;
  const ring = Array.from({ length: 37 }, (_, i) => { const t = (i / 36) * Math.PI * 2; return [c[0] + R * Math.cos(t), c[1] + R * Math.sin(t)]; });
  const shine = Array.from({ length: 9 }, (_, i) => { const t = Math.PI * (1.1 + i / 8 * 0.5); return [c[0] + R * 0.62 * Math.cos(t), c[1] + R * 0.62 * Math.sin(t)]; });
  return { fills: [ring], lines: [ring, shine] };
}
function wedge(x0, x1, y, d, zLo, zHi) {
  const slope = face([[x0, y, zHi], [x0, y + d, zHi], [x1, y + d, zLo], [x1, y, zLo]]);
  const side = face([[x0, y + d, zLo], [x1, y + d, zLo], [x0, y + d, zHi]]);
  const glass = face([[x0 + 0.25, y + 0.3, zHi - 0.25], [x0 + 0.25, y + d - 0.3, zHi - 0.25], [x1 - 0.35, y + d - 0.3, zLo + 0.25], [x1 - 0.35, y + 0.3, zLo + 0.25]]);
  return { fills: [side, slope], lines: [close(side), close(slope), close(glass)] };
}
function grid(x, y, w, d) {
  const out = [];
  for (let s = 0; s < w + d - 1; s++) for (let i = 0; i < w; i++) { const j = s - i; if (j >= 0 && j < d) out.push([x + i + 0.5, y + j + 0.5]); }
  return out;
}
function cyl(piece, cx, cy, z, r, h) {
  const N = 24;
  const ring = zz => Array.from({ length: N + 1 }, (_, i) => { const t = (i / N) * Math.PI * 2; return iso(cx + r * Math.cos(t), cy + r * Math.sin(t), zz); });
  const bot = ring(z), top = ring(z + h);
  const b0 = iso(cx, cy, z);
  const lower = bot.filter(p => p[1] >= b0[1] - 1e-6).sort((a, b) => b[0] - a[0]);
  const upper = top.filter(p => p[1] <= iso(cx, cy, z + h)[1] + 1e-6).sort((a, b) => a[0] - b[0]);
  piece.fills.push([...lower, ...upper], top);
  piece.lines.push(lower, [lower[0], upper[upper.length - 1]], [lower[lower.length - 1], upper[0]], top);
}
function wheel(cx, y0, y1, cz, r) {
  const ring = (rr, y) => Array.from({ length: 41 }, (_, i) => { const t = (i / 40) * Math.PI * 2; return iso(cx + rr * Math.cos(t), y, cz + rr * Math.sin(t)); });
  const back = ring(r, y0), front = ring(r, y1);
  const tan = [0.75, 1.75].map(k => { const t = k * Math.PI; return [iso(cx + r * Math.cos(t), y0, cz + r * Math.sin(t)), iso(cx + r * Math.cos(t), y1, cz + r * Math.sin(t))]; });
  const hull = [tan[0][0], tan[0][1], tan[1][1], tan[1][0]];
  return [{ fills: [back], lines: [back] }, { fills: [hull], lines: tan }, { fills: [front], lines: [front, ring(r * 0.62, y1), ring(r * 0.28, y1)] }];
}
function lines(segs) { return { fills: [], lines: segs.map(s => s.map(p => iso(...p))) }; }
const close = pts => [...pts, pts[0]];

const OBJECTS = [
  { name: 'Bricks', pieces: [
    brick(0, 0, 0, 4, 2, 1.2, 'grid'),
    brick(0, 2, 0, 4, 2, 1.2, 'grid'),
    brick(1, 0, 1.2, 2, 4, 1.2, 'grid'),
    brick(1, 1, 2.4, 2, 2, 1.2, 'grid'),
    brick(5, 1, 0, 2, 2, 1.2, 'grid'),
    brick(5.5, 4, 0, 2, 1, 1.2, 'grid')
  ] },
  { name: 'Joystick', pieces: [
    brick(0, 0, 0, 5, 4, 1.4),
    lines([[[5, 0.5, 0.5], [5, 3.5, 0.5]], [[0.5, 4, 0.5], [4.5, 4, 0.5]]]),
    column(1.8, 2, 1.4, 0.75, 0.3),
    column(1.8, 2, 1.7, 0.22, 2.5),
    ball(1.8, 2, 4.75, 0.8),
    column(3.7, 1.1, 1.4, 0.5, 0.35),
    column(3.7, 2.9, 1.4, 0.5, 0.35)
  ] },
  { name: 'Car', pieces: [
    brick(0, 0, 0.9, 10, 4, 0.4),
    brick(0, 0, 1.3, 10, 4, 0.8),
    brick(0, 0, 2.1, 2, 4, 0.4, 'grid'),
    brick(0, 0.3, 2.5, 0.6, 0.4, 0.6),
    brick(0, 3.3, 2.5, 0.6, 0.4, 0.6),
    brick(-0.3, 0, 3.1, 1.1, 4, 0.3),
    brick(2.2, 0.5, 2.1, 3.8, 3, 1.6),
    lines([[[2.5, 3.5, 2.4], [3.9, 3.5, 2.4], [3.9, 3.5, 3.4], [2.5, 3.5, 3.4], [2.5, 3.5, 2.4]], [[4.2, 3.5, 2.4], [5.7, 3.5, 2.4], [5.7, 3.5, 3.4], [4.2, 3.5, 3.4], [4.2, 3.5, 2.4]]]),
    brick(2.2, 0.5, 3.7, 3.8, 3, 0.2),
    wedge(6, 8, 0.5, 3, 2.1, 3.7),
    brick(8, 0, 2.1, 2, 4, 0.4, 'grid'),
    lines([[[10, 0.4, 1.5], [10, 1.2, 1.5], [10, 1.2, 1.9], [10, 0.4, 1.9], [10, 0.4, 1.5]], [[10, 2.8, 1.5], [10, 3.6, 1.5], [10, 3.6, 1.9], [10, 2.8, 1.9], [10, 2.8, 1.5]], [[10, 1.5, 1.6], [10, 2.5, 1.6]], [[10, 1.5, 1.8], [10, 2.5, 1.8]]]),
    ...wheel(2.1, 4.0, 4.5, 0.9, 0.95),
    ...wheel(7.9, 4.0, 4.5, 0.9, 0.95)
  ] },
  { name: 'Book', pieces: [
    brick(0, 0, 0, 6, 3, 0.4),
    brick(0, 0, 0.4, 5.7, 3, 1.0),
    lines([0.6, 0.8, 1.0, 1.2].map(z => [[5.7, 0.15, z], [5.7, 2.95, z]])),
    brick(0, 0, 1.4, 6, 3, 0.4),
    brick(0, 3, 0, 6, 1, 1.8, 'grid'),
    lines([[[0.4, 4, 0.55], [5.6, 4, 0.55]], [[0.4, 4, 1.25], [5.6, 4, 1.25]]])
  ] }
];

const len = pl => { let L = 0; for (let i = 1; i < pl.length; i++) L += Math.hypot(pl[i][0] - pl[i - 1][0], pl[i][1] - pl[i - 1][1]); return L; };
OBJECTS.forEach(o => {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, total = 0;
  o.pieces.forEach(p => {
    p.lens = p.lines.map(len); p.len = p.lens.reduce((a, b) => a + b, 0); total += p.len;
    [...p.fills, ...p.lines].forEach(pl => pl.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }));
  });
  Object.assign(o, { x0, x1, y0, y1, total });
});

const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

function drawPartial(ctx, pl, L, tf) {
  ctx.beginPath();
  let p = tf(pl[0]); ctx.moveTo(p[0], p[1]);
  for (let i = 1; i < pl.length && L > 0; i++) {
    const a = pl[i - 1], b = pl[i], s = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L >= s) { p = tf(b); ctx.lineTo(p[0], p[1]); L -= s; }
    else { const k = L / s; p = tf([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); ctx.lineTo(p[0], p[1]); L = 0; }
  }
  ctx.stroke();
}
function poly(ctx, pl, tf) { ctx.beginPath(); pl.forEach((q, i) => { const p = tf(q); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); }

// opts: { per (s per object), ink, bg, lineWidth, fit (0..1), cy (vertical centre 0..1) }
export function drawLineScene(ctx, w, h, t, opts = {}) {
  const list = OBJECTS.filter(o => opts.only ? o.name === opts.only : o.name !== 'Bricks');
  const per = opts.per || 6, oi = Math.floor(t / per) % list.length, p = (t % per) / per;
  const o = list[oi];
  const draw = per * 0.45, hold = per * 0.82, gone = per * 0.96, tt = p * per;
  const prog = opts.static ? 1 : tt < draw ? ease(tt / draw) : 1;
  const alpha = opts.static ? 1 : tt < hold ? 1 : tt < gone ? 1 - (tt - hold) / (gone - hold) : 0;
  if (alpha <= 0) return;
  const fit = opts.fit || 0.8;
  const S = Math.min(w * fit / (o.x1 - o.x0), h * fit * 0.85 / (o.y1 - o.y0), opts.maxScale || 90);
  const ox = w / 2 - S * (o.x0 + o.x1) / 2, oy = h * (opts.cy || 0.45) - S * (o.y0 + o.y1) / 2;
  const tf = q => [ox + q[0] * S, oy + q[1] * S];
  ctx.globalAlpha = alpha;
  ctx.lineWidth = opts.lineWidth || 1.25; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = opts.ink || 'rgba(36,38,42,0.3)'; ctx.fillStyle = opts.bg || '#EFE8D8';
  let L = prog * o.total;
  for (const pc of o.pieces) {
    if (L <= 0) break;
    if (L >= pc.len) {
      pc.fills.forEach(f => { poly(ctx, f, tf); ctx.closePath(); ctx.fill(); });
      pc.lines.forEach(pl => { poly(ctx, pl, tf); ctx.stroke(); });
      L -= pc.len;
    } else {
      pc.lines.forEach((pl, i) => { if (L > 0) { drawPartial(ctx, pl, Math.min(L, pc.lens[i]), tf); L -= pc.lens[i]; } });
      L = 0;
    }
  }
  ctx.globalAlpha = 1;
}

export function mountLineScene(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now(); let raf, last = 0;
  const frame = now => {
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return; last = now;
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.round(w * dpr), H = Math.round(h * dpr);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    const per = opts.per || 6;
    const t = reduced ? per * 0.6 : (now - t0) / 1000;
    drawLineScene(ctx, w, h, t, opts);
    if (opts.static) cancelAnimationFrame(raf);
  };
  raf = requestAnimationFrame(frame);
  const ro = opts.static && window.ResizeObserver ? new ResizeObserver(() => { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(frame); }) : null;
  if (ro) ro.observe(canvas);
  return { destroy() { cancelAnimationFrame(raf); if (ro) ro.disconnect(); } };
}
