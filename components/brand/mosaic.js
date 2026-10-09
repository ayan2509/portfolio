// Lego mosaic hero — portrait from the About photo + Designer / Strategist / Innovator pictures.
// Colours come from the site tokens; dark mode inverts to bone on night. Pink appears only in the animations.
// mountMosaic(canvas, getState) — getState() -> { mode: 0..3, theme: 'light'|'dark' }
const N = 80;
const PHOTO = ["44444444444444444444444444444444444444444444444444444444444444444444444444444444","44444444444444444444444444444444444444444444444444444444444444444444444444444444","44444444444444444444444444444444444443333444444444444444444444444444444444444444","44444444444444444444444444444444433300021233433444444444444444444444444444444444","44444444444444444444444444444433301000000000101334444444444444444444444444444444","44444444444444444444444444443333100001100000001213444444444444444444444444444444","44444444444444444444444444443310000000000000011111344444444444444444444444444444","44444444444444444444444444431000000000000110000101233444444444444444444444444444","44444444444444444444444443200000000001000000110001233444444444444444444444444444","44444444444444444444444443000000000011110000000011223334444444444444444444444444","44444444444444444444444431001000000011111000110110123334444444444444444444444444","44444444444444444444444431001001111222221100000100011114444444444444444444444444","44444444444444444444444310000012233333333332222210001233444444444444444444444444","44444444444444444444444300000112223333333333333331001334444444444444444444444444","44444444444444444444444200000112223333333333333332001223444444444444444444444444","44444444444444444444444300011212233333333333333333100013444444444444444444444444","44444444444444444444444300011122233333333333333333201024444444444444444444444444","44444444444444444444444300001122233333333333333333201034444444444444444444444444","44444444444444444444444310001122233333333333333333200034444444444444444444444444","44444444444444444444444420000122223333333333333333200134444444444444444444444444","44444444444444444444444420001221100012333333100113300034444444444444444444444444","44444444444444444444444430002220233322233332233322310134444444444444444444444444","44444444444444444444444430002221233222223322223333310234444444444444444444444444","44444444444444444444444430002221000232223332201113311344444444444444444444444444","44444444444444444444444440012222223333223332233333322344444444444444444444444444","44444444444444444444444431012223333333223333333333322344444444444444444444444444","44444444444444444444444401102223333332223333333333323344444444444444444444444444","44444444444444444444444422212223333332233333333333333344444444444444444444444444","44444444444444444444444422202223333322333333333333323344444444444444444444444444","44444444444444444444444422212223333322323332232333333344444444444444444444444444","44444444444444444444444432221222332321000111333223323344444444444444444444444444","44444444444444444444444431220112312222222322222213323444444444444444444444444444","44444444444444444444444443121112301112233333222112224444444444444444444444444444","44444444444444444444444444320011322100122232102222234444444444444444444444444444","44444444444444444444444444441021233321233333223332234444444444444444444444444444","44444444444444444444444444443012223332123333233332234444444444444444444444444444","44444444444444444444444444444201212332222222333321344444444444444444444444444444","44444444444444444444444444444300121233221122333210344444444444444444444444444444","44444444444444444444444444444300010133333333332103444444444444444444444444444444","44444444444444444444444444444310000022333333332024444444444444444444444444444444","44444444444444444444444444443011000001223233321034444444444444444444444444444444","44444444444444444444444444441012100000112222100234444444444444444444444444444444","44444444444444444444444444441012210000000100002303444444444444444444444444444444","44444444444444444444444444443001222100000000122300344444444444444444444444444444","44444444444444444444444444443000122212110012223300144444444444444444444444444444","44444444444444444444444444440000002222233333223300034444444444444444444444444444","44444444444444444444444444430000000122233333323300034444444444444444444444444444","44444444444444444444444444300000000000123333223100044444444444444444444444444444","44444444444444444444444444100000000000000122221000244444444444444444444444444444","44444444444444444444444432000000000000000000000000244444444444444444444444444444","44444444444444444444444310000000000000000000000000034444444444444444444444444444","44444444444444444444433000000000000000000000000000024444444444444444444444444444","44444444444444444444310000000000000000000000000010003444444444444444444444444444","44444444444443333320000110000000000000000000000011001334444444444444444444444444","44444444444420000000000000000000010011000000000011000102334444444444444444444444","44444444443200000001110110000000010010000000100000000210001233333444444444444444","44444444300000000112110000000000010010000000200011002120000000000134444444444444","44444442000000001111110000000000011021000010100011002121100001000002334444444444","44444430000002011210001000000000011001000100100110001111100101100000001344444444","44444300000002202121000100010001100000000000100000001110110000010000100023444444","44444200000000110211100010001001111000000000100000001110110000001000100001444444","44443000000000000021020010000000111110000000100000001110011000000100010000344444","44443000000000000021022001000100111121000000100000001111011000000100011100344444","44443000000000000012003211110000111112100000010000011101011101000010011100344444","44443000000000022012102210101000011111210000010000011101001100100110011210234444","44442000000000112111200210111100011111221000010000111111101000101110012211034444","44442000000000111111110101111110011112122000000000111111101111110110012201014444","44442000000000011111210101012010001112212100001000111111111111111111021201003444","44442000000000112222120001102201001111212200001000111111111111112111121101103444","44442000000000111112222000202301011211221220001000011111111111112212111010100444","44442000000000122211222000201320010221221121001000011111111112222212211101000344","44442000000110121222233100211321020221122022001000011111121211222222211210010344","44442000000000111000122200121322021122122112101000011221121211122122201111110034","44442000000000000011001100021222012122112202201000001121122211122122200221110014","44443000000000001212210010022212012022212202201000001112122211023112100121000014","44443000000000000111222101022012012022212211211100001212122212012112200100110014","44444000000000000110122212110022012112211220211100001211122312202113200011101113","44444000000000000111110001110122002212211220221100001211122212210112201113200011","44444100000000000000011000110222003202221221111100000121122211100002201122000011","44444200000000000011111000001222002202221122022100000121112310100002200010101111"];
// tone index: 0 ink-900 · 1 ink-700 · 2 ink-500 · 3 paper-300 · 4 paper-100 (background) · 5 pink
const KEY = ['#24262A', '#57534B', '#8A8478', '#E7DECB', '#F6F1E6', '#E2467C'];
// light: ink tones on paper · darkPhoto: natural shading (bone face, near-black jacket) on a charcoal silhouette patch
// darkArt: line pictures flip to bone so they read on night
const PAL = {
  light:     ['#24262A', '#57534B', '#8A8478', '#E7DECB', null, 'oklch(0.56 0.2 0)'],
  darkPhoto: ['#0E0D0C', '#4A4740', '#8A857B', '#E4DCCB', null, 'oklch(0.72 0.17 0)'],
  darkArt:   ['#EFE8D8', '#A8A296', '#77726A', '#2A2925', null, 'oklch(0.72 0.17 0)']
};
const PATCH = '#2C2A26', PATCH_R = 5;
const BG = 4, PINK = 5;
const clamp01 = x => Math.max(0, Math.min(1, x));
const easeIO = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

const photoGrid = PHOTO.map(r => [...r].map(Number));
const blankGrid = Array.from({ length: N }, () => Array(N).fill(BG));
const KEYRGB = KEY.map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);

// Pictures are drawn as vectors on an 80×80 canvas, then snapped to the nearest tone per stud.
const pc = document.createElement('canvas'); pc.width = pc.height = N;
const p = pc.getContext('2d', { willReadFrequently: true });
function snap() {
  const d = p.getImageData(0, 0, N, N).data, g = [];
  for (let j = 0; j < N; j++) { const row = []; for (let i = 0; i < N; i++) {
    const k = (j * N + i) * 4; let best = BG, bd = 1e9;
    for (let c = 0; c < 6; c++) { const q = KEYRGB[c], dd = (d[k] - q[0]) ** 2 + (d[k + 1] - q[1]) ** 2 + (d[k + 2] - q[2]) ** 2; if (dd < bd) { bd = dd; best = c; } }
    row.push(best);
  } g.push(row); }
  return g;
}
const bez = (s, t) => { const u = 1 - t; return [u*u*u*s[0][0] + 3*u*u*t*s[1][0] + 3*u*t*t*s[2][0] + t*t*t*s[3][0], u*u*u*s[0][1] + 3*u*u*t*s[1][1] + 3*u*t*t*s[2][1] + t*t*t*s[3][1]]; };
function clear() { p.setTransform(1, 0, 0, 1, 0, 0); p.fillStyle = KEY[BG]; p.fillRect(0, 0, N, N); p.lineCap = 'round'; p.lineJoin = 'round'; }

// Designer — pen tool drawing a two-segment bézier, anchors and handles appear as it goes
const SEG = [[[10, 62], [14, 24], [28, 40], [40, 40]], [[40, 40], [52, 40], [64, 56], [70, 18]]];
function anchor(x, y, active) { p.fillStyle = active ? KEY[PINK] : KEY[BG]; p.fillRect(x - 2.5, y - 2.5, 5, 5); p.strokeStyle = KEY[0]; p.lineWidth = 1.2; p.strokeRect(x - 2.5, y - 2.5, 5, 5); }
function handle(a, b) { p.strokeStyle = KEY[2]; p.lineWidth = 1; p.beginPath(); p.moveTo(a[0], a[1]); p.lineTo(b[0], b[1]); p.stroke(); p.fillStyle = KEY[PINK]; p.beginPath(); p.arc(b[0], b[1], 2, 0, Math.PI * 2); p.fill(); }
function penNib(x, y) {
  p.save(); p.translate(x, y); p.rotate(-0.6);
  p.beginPath(); p.moveTo(0, 0); p.lineTo(6, -9); p.lineTo(4.5, -16); p.lineTo(-4.5, -16); p.lineTo(-6, -9); p.closePath();
  p.fillStyle = KEY[PINK]; p.fill(); p.strokeStyle = KEY[0]; p.lineWidth = 1.4; p.stroke();
  p.fillStyle = KEY[0]; p.fillRect(-5, -22, 10, 5.5);
  p.beginPath(); p.moveTo(0, -1); p.lineTo(0, -9); p.stroke(); p.beginPath(); p.arc(0, -9.5, 1.4, 0, Math.PI * 2); p.fill();
  p.restore();
}
function designer(t, still) {
  clear();
  const c = still ? 3.2 : t % 4.8, u = clamp01((c - 0.4) / 2.8) * 2;
  if (c > 4.2) return blankGrid;
  p.strokeStyle = KEY[0]; p.lineWidth = 2.6;
  let tip = SEG[0][0];
  for (let s = 0; s < 2; s++) {
    const k = clamp01(u - s); if (k <= 0) break;
    p.beginPath(); let q = bez(SEG[s], 0); p.moveTo(q[0], q[1]);
    for (let i = 1; i <= 60 * k; i++) { q = bez(SEG[s], i / 60); p.lineTo(q[0], q[1]); }
    p.strokeStyle = KEY[0]; p.lineWidth = 2.6; p.stroke(); tip = bez(SEG[s], k);
  }
  handle(SEG[0][0], SEG[0][1]); anchor(SEG[0][0][0], SEG[0][0][1], u < 0.05);
  if (u > 0.6) { handle(SEG[0][3], SEG[0][2]); handle(SEG[1][0], SEG[1][1]); anchor(40, 40, u < 1.3); }
  if (u > 1.6) { handle(SEG[1][3], SEG[1][2]); anchor(70, 18, true); }
  penNib(tip[0], tip[1]);
  return snap();
}

// Strategist — full 8×8 board, knight hops an L leaving a pink trail
function knightPath(s) {
  p.beginPath();
  p.moveTo(-0.5 * s, 0.5 * s); p.lineTo(0.5 * s, 0.5 * s); p.lineTo(0.4 * s, 0.32 * s);
  p.lineTo(0.3 * s, 0.1 * s); p.quadraticCurveTo(0.5 * s, -0.25 * s, 0.22 * s, -0.55 * s);
  p.lineTo(0.06 * s, -0.72 * s); p.lineTo(-0.04 * s, -0.56 * s);
  p.quadraticCurveTo(-0.38 * s, -0.5 * s, -0.56 * s, -0.18 * s); p.lineTo(-0.46 * s, -0.04 * s);
  p.quadraticCurveTo(-0.28 * s, -0.1 * s, -0.08 * s, -0.18 * s); p.quadraticCurveTo(-0.3 * s, 0.1 * s, -0.36 * s, 0.32 * s);
  p.lineTo(-0.5 * s, 0.32 * s); p.closePath();
}
function strategist(t, still) {
  clear();
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { p.fillStyle = (i + j) % 2 ? KEY[0] : KEY[3]; p.fillRect(i * 10, j * 10, 10, 10); }
  const cen = (i, j) => [i * 10 + 5, j * 10 + 5];
  const a = cen(3, 6), b = cen(3, 4), e = cen(4, 4), total = 30;
  const c = still ? 2.6 : t % 4.4;
  const pr = c < 0.8 ? 0 : c < 2.2 ? easeIO((c - 0.8) / 1.4) : c < 3.8 ? 1 : 1 - easeIO(clamp01((c - 3.8) / 0.5));
  const at = d => d <= 20 ? [a[0], a[1] - d] : [b[0] + (d - 20), b[1]];
  const L = pr * total;
  if (c < 3.8) { p.fillStyle = KEY[PINK]; for (let d = 0; d <= L; d += 3.4) { const q = at(d); p.beginPath(); p.arc(q[0], q[1], 1.2, 0, Math.PI * 2); p.fill(); } }
  if (pr > 0.98 && c < 3.8) { p.strokeStyle = KEY[PINK]; p.lineWidth = 1.2; p.strokeRect(e[0] - 4.4, e[1] - 4.4, 8.8, 8.8); }
  const pos = at(L), hop = c > 0.8 && c < 2.2 ? Math.sin(Math.PI * pr) * 5 : 0;
  p.save(); p.translate(pos[0], pos[1] - 3 - hop);
  knightPath(14); p.fillStyle = KEY[PINK]; p.fill(); p.strokeStyle = KEY[0]; p.lineWidth = 1.3; p.stroke();
  p.fillStyle = KEY[0]; p.beginPath(); p.arc(-1, -5.6, 0.9, 0, Math.PI * 2); p.fill();
  p.restore();
  return snap();
}

// Innovator — bulb flickers, then glows pink with pulsing rays
function innovator(t, still) {
  clear();
  const on = still || t > 1.0 || (t > 0.5 && t < 0.6) || (t > 0.72 && t < 0.82);
  const cx = 40, cy = 33, R = 16;
  if (on) {
    const pulse = still ? 1 : (Math.sin(t * 4.4) + 1) / 2;
    p.strokeStyle = KEY[PINK]; p.lineWidth = 2.4;
    for (let i = 0; i < 9; i++) { const ang = -Math.PI / 2 + (i - 4) * 0.4, r0 = R + 5, r1 = R + 10 + pulse * 3; p.beginPath(); p.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); p.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1); p.stroke(); }
  }
  p.beginPath(); p.arc(cx, cy, R, Math.PI * 0.76, Math.PI * 2.24); p.lineTo(cx + 7, cy + 24); p.lineTo(cx - 7, cy + 24); p.closePath();
  p.fillStyle = on ? KEY[PINK] : KEY[3]; p.fill(); p.strokeStyle = KEY[0]; p.lineWidth = 2.4; p.stroke();
  p.strokeStyle = on ? KEY[BG] : KEY[1]; p.lineWidth = 1.4;
  p.beginPath(); p.moveTo(cx - 4, cy + 23); p.lineTo(cx - 4, cy + 6); p.lineTo(cx - 2, cy + 2); p.lineTo(cx, cy + 6); p.lineTo(cx + 2, cy + 2); p.lineTo(cx + 4, cy + 6); p.lineTo(cx + 4, cy + 23); p.stroke();
  if (on) { p.strokeStyle = KEY[BG]; p.lineWidth = 2; p.beginPath(); p.arc(cx, cy, R - 5, Math.PI * 1.1, Math.PI * 1.42); p.stroke(); }
  for (let k = 0; k < 3; k++) { p.fillStyle = k % 2 ? KEY[2] : KEY[1]; p.fillRect(cx - 8, cy + 25 + k * 3.4, 16, 3); }
  p.fillStyle = KEY[0]; p.fillRect(cx - 4, cy + 35, 8, 2.6);
  return snap();
}
const PICS = [() => photoGrid, designer, strategist, innovator];

// distance (in studs) from each background cell to the nearest portrait stud, for the dark-mode patch
const patchA = (() => {
  const a = Array.from({ length: N }, () => Array(N).fill(0));
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    if (photoGrid[j][i] !== BG) continue;
    let best = 99;
    for (let dj = -PATCH_R; dj <= PATCH_R; dj++) for (let di = -PATCH_R; di <= PATCH_R; di++) {
      const jj = j + dj, ii = i + di; if (jj < 0 || ii < 0 || jj >= N || ii >= N || photoGrid[jj][ii] === BG) continue;
      const d = Math.hypot(di, dj); if (d < best) best = d;
    }
    a[j][i] = best > PATCH_R ? 0 : Math.pow(1 - (best - 1) / PATCH_R, 1.4);
  }
  return a;
})();

// one flat Lego stud tile, s px square; shared with the loader
export function makeTile(s, base, dark) {
  const c = document.createElement('canvas'); c.width = c.height = s; const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, s, s);
  const e = Math.max(1, Math.round(s * 0.06));
  x.fillStyle = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.3)'; x.fillRect(0, 0, s, e); x.fillRect(0, 0, e, s);
  x.fillStyle = dark ? 'rgba(0,0,0,0.4)' : 'rgba(36,38,42,0.12)'; x.fillRect(0, s - e, s, e); x.fillRect(s - e, 0, e, s);
  const r = s * 0.32, cx = s / 2, cy = s / 2;
  x.fillStyle = dark ? 'rgba(0,0,0,0.45)' : 'rgba(36,38,42,0.18)'; x.beginPath(); x.arc(cx + s * 0.05, cy + s * 0.07, r, 0, Math.PI * 2); x.fill();
  x.fillStyle = base; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
  const g = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.55)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, dark ? 'rgba(0,0,0,0.3)' : 'rgba(36,38,42,0.16)');
  x.strokeStyle = g; x.lineWidth = Math.max(1, s * 0.08); x.beginPath(); x.arc(cx, cy, r - x.lineWidth / 2, 0, Math.PI * 2); x.stroke();
  return c;
}
export { PAL };

export function mountMosaic(canvas, getState, areaEl) {
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tileCache = new Map(); let tileSize = 0, bgLayer = null, bgKey = '';
  let raf, prev = performance.now(), t = 0, from = -1, to = 0, swapAt = 0.3; const picStart = [0, 0, 0, 0];
  function tile(base, dark) {
    const key = base + dark; if (tileCache.has(key)) return tileCache.get(key);
    const c = makeTile(tileSize, base, dark); tileCache.set(key, c); return c;
  }
  // faint outline studs across the whole hero, on the same grid as the mosaic, fading toward the edges
  function buildBg(W, H, p, gx, gy, dark) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.strokeStyle = dark ? 'rgba(239,232,216,0.085)' : 'rgba(36,38,42,0.1)'; x.lineWidth = Math.max(1, p * 0.09);
    const r = p * 0.3, x0 = gx - Math.ceil(gx / p) * p, y0 = gy - Math.ceil(gy / p) * p;
    x.beginPath();
    for (let y = y0; y < H; y += p) for (let X = x0; X < W; X += p) { x.moveTo(X + p / 2 + r, y + p / 2); x.arc(X + p / 2, y + p / 2, r, 0, Math.PI * 2); }
    x.stroke();
    x.globalCompositeOperation = 'destination-in';
    const g = x.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, '#000'); g.addColorStop(0.45, '#000'); g.addColorStop(0.75, 'rgba(0,0,0,0.4)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.setTransform(W * 0.56, 0, 0, H * 0.6, W * 0.55, H * 0.5); x.fillStyle = g; x.fillRect(-2, -2, 4, 4);
    return c;
  }
  const gridOf = m => m < 0 ? blankGrid : PICS[m](t - picStart[m], reduced);
  function frame(n) { raf = schedule(frame); render(n); }
  function render(now) {
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now; t += dt;
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.round(w * dpr), H = Math.round(h * dpr);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    const cr = canvas.getBoundingClientRect(), ar = areaEl ? areaEl.getBoundingClientRect() : cr;
    const ax = (ar.left - cr.left) * dpr, ay = (ar.top - cr.top) * dpr, aw = ar.width * dpr, ah = ar.height * dpr;
    const p = Math.max(2, Math.floor(Math.min(aw, ah) / N)), side = p * N;
    const ox = Math.round(ax + (aw - side) / 2), oy = Math.round(ay + (ah - side) / 2);
    const st = getState ? getState() : {}, dark = st.theme === 'dark';
    if (p !== tileSize) { tileSize = p; tileCache.clear(); }
    const k2 = [W, H, p, ox, oy, dark].join();
    if (k2 !== bgKey) { bgKey = k2; bgLayer = buildBg(W, H, p, ox, oy, dark); }
    const m = st.mode == null ? 0 : st.mode;
    if (m !== to) { from = to; to = m; swapAt = t; picStart[m] = t; }
    const A = from === -1 && t - swapAt > 2 ? null : gridOf(from), B = gridOf(to), k = t - swapAt;
    const palFor = src => dark ? (src === 0 ? PAL.darkPhoto : PAL.darkArt) : PAL.light;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bgLayer, 0, 0);
    const maxD = Math.hypot(N / 2, N / 2), spread = 0.8, flip = 0.18, patchTile = dark ? tile(PATCH, true) : null;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      let ch = B[j][i], src = to, sy = 1;
      if (A && !reduced) {
        const local = k - Math.hypot(i + 0.5 - N / 2, j + 0.5 - N / 2) / maxD * spread;
        if (local < 0) { ch = A[j][i]; src = from; }
        else if (local < flip && (A[j][i] !== B[j][i] || from === 0 || to === 0)) { const f = local / flip; if (f < 0.5) { ch = A[j][i]; src = from; sy = 1 - f * 2; } else sy = (f - 0.5) * 2; }
      }
      const x = ox + i * p, y = oy + j * p, hh = Math.max(1, Math.round(p * sy)), yy = y + Math.round((p - hh) / 2);
      if (ch === BG) {
        if (dark && src === 0 && patchA[j][i] > 0) { ctx.globalAlpha = patchA[j][i]; ctx.drawImage(patchTile, x, yy, p, hh); ctx.globalAlpha = 1; }
        continue;
      }
      ctx.drawImage(tile(palFor(src)[ch], dark), x, yy, p, hh);
    }
  }
  function schedule(cb) {
    let done = false;
    const id = requestAnimationFrame(n => { if (!done) { done = true; cb(n); } });
    const to2 = setTimeout(() => { if (!done) { done = true; cancelAnimationFrame(id); cb(performance.now()); } }, 40);
    return { cancel() { done = true; cancelAnimationFrame(id); clearTimeout(to2); } };
  }
  raf = schedule(frame);
  return { destroy() { raf && raf.cancel(); }, step(sec) { for (let i = 0; i < sec * 30; i++) render(prev + 1000 / 30); } };
}
