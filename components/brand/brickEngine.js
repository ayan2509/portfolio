// Isometric Lego brick engine — draws the hero illustration on a <canvas>.
// Pure JS, no deps. Used by BrickScene.jsx, the UI kit and the brand cards.

export const BRICK_COLORS = {
  green: [0.62, 0.11, 180], orange: [0.72, 0.16, 52], pink: [0.65, 0.2, 0], yellow: [0.85, 0.15, 82],
  white: [0.96, 0.02, 85], black: [0.33, 0.012, 250], grey: [0.8, 0.012, 85]
};
const THEMES = {
  light: { stroke: 'rgba(36,38,42,0.32)', shadow: 'rgba(60,40,10,0.13)', caption: '#57534B' },
  dark: { stroke: 'rgba(0,0,0,0.5)', shadow: 'rgba(0,0,0,0.4)', caption: '#A8A296' }
};
const C30 = 0.866, S30 = 0.5;
const hash = (x, y, s) => { const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); };
const shade = (cc, dl) => 'oklch(' + Math.max(0, cc[0] + dl) + ' ' + cc[1] + ' ' + cc[2] + ')';
const path = (ctx, pts) => { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); };
const poly = (ctx, pts, fill) => { path(ctx, pts); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); };

function studs(ctx, P, S, cc, list, zt) {
  const rx = 0.3 * C30 * 1.4142 * S, ry = 0.3 * S30 * 1.4142 * S;
  list.forEach(([cx, cy]) => {
    const b0 = P(cx, cy, zt), b1 = P(cx, cy, zt + 0.2);
    ctx.fillStyle = shade(cc, -0.1);
    ctx.beginPath(); ctx.ellipse(b0[0], b0[1], rx, ry, 0, 0, Math.PI); ctx.lineTo(b1[0] - rx, b1[1]); ctx.ellipse(b1[0], b1[1], rx, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = shade(cc, 0.03);
    ctx.beginPath(); ctx.ellipse(b1[0], b1[1], rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
}
function gridStuds(x, y, bw, bd) {
  const W = Math.round(bw), D = Math.round(bd), out = [];
  for (let s = 0; s < W + D - 1; s++) for (let i = 0; i < W; i++) { const j = s - i; if (j >= 0 && j < D) out.push([x + i + 0.5, y + j + 0.5]); }
  return out;
}

// studMode: 0 smooth (tile), 1 full stud grid, 2 single centred stud
export function isoBrick(ctx, P, S, x, y, z, bw, bd, bh, cc, studMode) {
  const zt = z + bh;
  poly(ctx, [P(x, y + bd, z), P(x + bw, y + bd, z), P(x + bw, y + bd, zt), P(x, y + bd, zt)], shade(cc, -0.17));
  poly(ctx, [P(x + bw, y, z), P(x + bw, y + bd, z), P(x + bw, y + bd, zt), P(x + bw, y, zt)], shade(cc, -0.08));
  poly(ctx, [P(x, y, zt), P(x + bw, y, zt), P(x + bw, y + bd, zt), P(x, y + bd, zt)], shade(cc, 0));
  if (studMode === 1) studs(ctx, P, S, cc, gridStuds(x, y, bw, bd), zt);
  if (studMode === 2) studs(ctx, P, S, cc, [[x + bw / 2, y + bd / 2]], zt);
}

// Arch brick running along X, 1-stud legs, elliptical opening on the visible +Y face.
export function isoArch(ctx, P, S, x, y, z, bw, bd, bh, cc, studMode) {
  const zt = z + bh, cx = x + bw / 2, a = bw / 2 - 1, b = bh - 0.45, N = 18;
  const arc = yy => { const p = []; for (let i = 0; i <= N; i++) { const th = Math.PI * i / N; p.push(P(cx + a * Math.cos(th), yy, z + b * Math.sin(th))); } return p; };
  const front = arc(y + bd), back = arc(y);
  path(ctx, [...front, ...back.slice().reverse()]); ctx.fillStyle = shade(cc, -0.24); ctx.fill(); ctx.stroke();
  poly(ctx, [P(x + bw - 1, y + bd, z), ...front, P(x + 1, y + bd, z), P(x, y + bd, z), P(x, y + bd, zt), P(x + bw, y + bd, zt), P(x + bw, y + bd, z)], shade(cc, -0.15));
  poly(ctx, [P(x + bw, y, z), P(x + bw, y + bd, z), P(x + bw, y + bd, zt), P(x + bw, y, zt)], shade(cc, -0.08));
  poly(ctx, [P(x, y, zt), P(x + bw, y, zt), P(x + bw, y + bd, zt), P(x, y + bd, zt)], shade(cc, 0));
  if (studMode) studs(ctx, P, S, cc, gridStuds(x, y, bw, bd), zt);
}

// Piece: [x, y, z, w, d, h, colour, studMode, kind?]  (units: studs; brick h = 1.2, plate = 0.4)
const order = (a, b) => {
  if (a[2] + a[5] <= b[2] + 1e-6) return -1; if (b[2] + b[5] <= a[2] + 1e-6) return 1;
  if (a[0] + a[3] <= b[0] + 1e-6) return -1; if (b[0] + b[3] <= a[0] + 1e-6) return 1;
  if (a[1] + a[4] <= b[1] + 1e-6) return -1; if (b[1] + b[4] <= a[1] + 1e-6) return 1; return 0;
};
function buildShapes() {
  const tw = [[-1, -1, 0, 6, 6, 0.4, 'black', 1], [0, 0, 0.4, 4, 4, 1.2, 'white', 0], [1.5, 4, 0.4, 1, 0.06, 0.95, 'yellow', 0]];
  const win = z => tw.push([0, 0, z, 1, 1, 1.2, 'white', 1], [3, 0, z, 1, 1, 1.2, 'white', 1], [0, 3, z, 1, 1, 1.2, 'white', 1], [3, 3, z, 1, 1, 1.2, 'white', 1], [1, 0, z, 2, 1, 1.2, 'green', 1], [1, 3, z, 2, 1, 1.2, 'green', 1], [0, 1, z, 1, 2, 1.2, 'green', 1], [3, 1, z, 1, 2, 1.2, 'green', 1], [1, 1, z, 2, 2, 1.2, 'white', 1]);
  win(1.6); tw.push([0, 0, 2.8, 4, 4, 0.4, 'grey', 0]); win(3.2);
  tw.push([0, 0, 4.4, 4, 4, 0.4, 'orange', 1], [1, 1, 4.8, 2, 2, 1.2, 'green', 0], [1, 1, 6.0, 2, 2, 0.4, 'grey', 0], [1.8, 1.8, 6.4, 0.4, 0.4, 1.6, 'black', 0], [1.75, 1.75, 8.0, 0.5, 0.5, 0.5, 'pink', 0]);

  const kb = [[0, 0, 0, 12, 7, 0.4, 'black', 1], [0, 0, 0.4, 12, 1, 0.12, 'black', 0], [0, 6, 0.4, 12, 1, 0.12, 'black', 0], [0, 1, 0.4, 1, 5, 0.12, 'black', 0], [11, 1, 0.4, 1, 5, 0.12, 'black', 0]];
  const row = (y, keys) => { let x = 1; keys.forEach(([kw, c, st]) => { kb.push([x + 0.06, y + 0.06, 0.4, kw - 0.12, 0.88, 0.6, c, st ? 2 : 0]); x += kw; }); };
  const n = c => Array.from({ length: c }, () => [1, 'white']);
  row(1, [[1, 'pink', 1], ...n(8), [1, 'orange']]);
  row(2, [[1.5, 'grey'], ...n(2), [1, 'white', 1], ...n(4), [1.5, 'grey']]);
  row(3, [[1.75, 'grey'], ...n(7), [1.25, 'green', 1]]);
  row(4, [[2.25, 'grey'], ...n(4), [1, 'white', 1], ...n(1), [1.75, 'grey']]);
  row(5, [[1.25, 'grey'], [1.25, 'grey'], [5, 'yellow'], [1.25, 'grey'], [1.25, 'grey']]);

  const br = [[0, 0, 0, 14, 4, 0.4, 'green', 1], [0, 1, 0.4, 2, 2, 2.4, 'grey', 1], [12, 1, 0.4, 2, 2, 2.4, 'grey', 1]];
  [1, 2].forEach(y => br.push([2, y, 0.4, 5, 1, 2.4, 'orange', 1, 'arch'], [7, y, 0.4, 5, 1, 2.4, 'orange', 1, 'arch']));
  br.push([0, 1, 2.8, 14, 2, 0.4, 'black', 0]);
  for (let x = 1; x < 13; x += 2) br.push([x + 0.1, 1.85, 3.2, 0.8, 0.3, 0.06, 'yellow', 0]);
  [0, 4.5, 9, 13].forEach(x => br.push([x + 0.3, 1, 3.2, 0.4, 0.4, 1.0, 'white', 0], [x + 0.3, 2.6, 3.2, 0.4, 0.4, 1.0, 'white', 0]));
  br.push([0, 1, 4.2, 14, 0.4, 0.2, 'pink', 0], [0, 2.6, 4.2, 14, 0.4, 0.2, 'pink', 0]);

  return [{ name: 'Tower', b: tw, ex: 0.4 }, { name: 'Keyboard', b: kb, ex: 0.9 }, { name: 'Bridge', b: br, ex: 0.5 }]
    .map(s => ({ ...s, b: s.b.slice().sort(order) }));
}
export const SHAPES = buildShapes();
export const SHAPE_NAMES = SHAPES.map(s => s.name.toLowerCase());

const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

// o: { theme, shapeIndex (null = cycle), hover 0..1, caption, cache }
export function drawScene(ctx, w, h, t, o) {
  const T = 6.5, th = THEMES[o.theme] || THEMES.light, cache = o.cache || {};
  let si, e = 0, al = 1;
  if (o.shapeIndex == null) {
    si = ((Math.floor(t / T) % 3) + 3) % 3; const p = ((t % T) + T) % T;
    if (p < 0.35) { e = 1; al = p / 0.35; } else if (p < 1.75) e = 1 - ease((p - 0.35) / 1.4); else if (p < 4.75) e = 0; else if (p < 6.15) e = ease((p - 4.75) / 1.4); else { e = 1; al = 1 - (p - 6.15) / 0.35; }
  } else si = o.shapeIndex;
  e = e + (1 - e) * (o.hover || 0) * 0.9;
  const sh = SHAPES[si], ex = sh.ex;
  const dz = (b, i) => b[2] > 0 ? b[2] * ex + 0.5 + hash(i, si, 1) * (ex < 0.75 ? 0.7 : 1.1) : 0;
  const key = si + ':' + w + 'x' + h;
  if (!cache[key]) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    sh.b.forEach((b, i) => { for (const X of [b[0], b[0] + b[3]]) for (const Y of [b[1], b[1] + b[4]]) for (const Z of [b[2], b[2] + b[5] + 0.2 + dz(b, i)]) { const sx = (X - Y) * C30, sy = (X + Y) * S30 - Z; x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy); } });
    const S = Math.min(w * 0.72 / (x1 - x0), h * 0.7 / (y1 - y0), 58);
    cache[key] = { S, ox: w * 0.5 - S * (x0 + x1) / 2, oy: h * 0.53 - S * (y0 + y1) / 2 };
  }
  const { S, ox } = cache[key], oy = cache[key].oy + Math.sin(t * 1.3) * 3;
  const P = (X, Y, Z) => [ox + (X - Y) * C30 * S, oy + (X + Y) * S30 * S - Z * S];
  ctx.globalAlpha = al;
  let fx = 0, fy = 0, mx = 0, my = 0;
  sh.b.forEach(b => { fx = Math.max(fx, b[0] + b[3]); fy = Math.max(fy, b[1] + b[4]); mx = Math.min(mx, b[0]); my = Math.min(my, b[1]); });
  const g = P((fx + mx) / 2, (fy + my) / 2, 0), span = (fx - mx + fy - my) * 0.5 * 1.05 * (1 - e * 0.12);
  ctx.fillStyle = th.shadow;
  ctx.beginPath(); ctx.ellipse(g[0], g[1] + S * 0.15, span * C30 * S, span * S30 * S, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.strokeStyle = th.stroke;
  sh.b.forEach((b, i) => {
    const [bx, by, bz, bw, bd, bh, c, st, kind] = b;
    const x = bx + e * (hash(i, si, 2) - 0.5) * 0.5, y = by + e * (hash(i, si, 3) - 0.5) * 0.5, z = bz + e * dz(b, i);
    (kind === 'arch' ? isoArch : isoBrick)(ctx, P, S, x, y, z, bw, bd, bh, BRICK_COLORS[c], st);
  });
  if (o.caption !== false) {
    ctx.fillStyle = th.caption; ctx.font = "500 11px 'IBM Plex Mono', monospace"; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('FIG. 0' + (si + 1) + ' — ' + sh.name.toUpperCase(), 40, h - 40);
  }
  ctx.globalAlpha = 1;
}

// Mount a self-running scene on a canvas. Returns { destroy }.
// opts: { theme: 'auto'|'light'|'dark', shape: 'cycle'|'tower'|'keyboard'|'bridge', caption, animate, hoverTarget }
export function mountBrickScene(canvas, opts = {}) {
  const ctx = canvas.getContext('2d'), cache = {}, host = opts.hoverTarget || canvas.parentElement || canvas;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = opts.animate !== false && !reduced;
  const shapeIndex = !opts.shape || opts.shape === 'cycle' ? null : Math.max(0, SHAPE_NAMES.indexOf(opts.shape));
  let raf, last = 0, hv = 0, over = false; const t0 = performance.now();
  const enter = () => { over = true; }, leave = () => { over = false; };
  host.addEventListener('pointerenter', enter); host.addEventListener('pointerleave', leave);
  const frame = now => {
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return; last = now;
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.round(w * dpr), H = Math.round(h * dpr);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    hv += ((over ? 1 : 0) - hv) * 0.1;
    let theme = opts.theme || 'auto';
    if (theme === 'auto') { const el = canvas.closest('[data-theme]'); theme = el && el.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
    const t = animate ? Math.max(0, (now - t0) / 1000) : 3;
    drawScene(ctx, w, h, t, { theme, shapeIndex, hover: hv, caption: opts.caption, cache });
  };
  raf = requestAnimationFrame(frame);
  return { destroy() { cancelAnimationFrame(raf); host.removeEventListener('pointerenter', enter); host.removeEventListener('pointerleave', leave); } };
}
