// Lego-mosaic tree that grows from a single seed brick at the base.
// Same tile language as the hero mosaic (components/brand/mosaic.js): a square
// brick lit top-left, shadowed bottom-right, with a raised stud on top.
//
// The tree is generated once into a cell grid — each cell carries a tone and a
// birth time — then the frame loop simply reveals cells whose birth time has
// passed. Growth therefore reads as the structure assembling itself outward
// from the seed rather than as a shape fading in.
//
// mountTreeMosaic(canvas, opts)
//   opts.hold   seconds the finished tree holds before fading (default 4)
//   opts.fade   fade-out seconds (default 1)
//   opts.gap    blank seconds before the next cycle (default 0.6)
//   opts.tile   target tile size in CSS px (default 10, matching the hero)
//   opts.green  0..1 strength of the canopy tint (default 0.42 — deliberately quiet)

// Tone slots. Wood grades from the dark trunk out to pale twigs, which is what
// makes the branching read as a real tree rather than a uniform diagram.
const WOOD = 0, WOOD_L = 1, TWIG = 2, LEAF = 3, LEAF_D = 4;
const isWood = t => t <= TWIG;
const GROW = 5.4;                                  // seconds for a full grow-in
const POP = 0.34;                                  // per-cell pop-in duration

const clamp01 = x => Math.max(0, Math.min(1, x));
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeBack = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

/* ── colour helpers ─────────────────────────────────────────────────────── */

// The brick palette is authored in oklch, which we cannot blend numerically.
// Let the browser resolve any CSS colour to rgb() for us, once, and cache it.
const _probe = document.createElement('span');
_probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
const _resolved = new Map();
function rgb(css, fallback) {
  if (!css) return fallback;
  if (_resolved.has(css)) return _resolved.get(css);
  let out = fallback;
  try {
    if (!_probe.isConnected) document.body.appendChild(_probe);
    _probe.style.color = '';
    _probe.style.color = css;
    const m = getComputedStyle(_probe).color.match(/[\d.]+/g);
    if (m && m.length >= 3) out = [+m[0], +m[1], +m[2]];
  } catch (e) { /* keep fallback */ }
  _resolved.set(css, out);
  return out;
}
const mix = (k, a, b) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * k));
const css = c => `rgb(${c[0]},${c[1]},${c[2]})`;

/* ── tree generation ────────────────────────────────────────────────────── */

// Small deterministic PRNG so the silhouette is identical on every load.
function rand(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// Branch segments and leaf blobs in a normalised space: x 0..1, y 0 at the base.
function buildTree() {
  const rnd = rand(20260104);
  const wood = [], leaves = [];

  function branch(x, y, ang, len, w, depth, t) {
    const x1 = x + Math.cos(ang) * len;
    const y1 = y + Math.sin(ang) * len;
    const dur = Math.max(0.12, len * 1.5);
    wood.push({ x0: x, y0: y, x1, y1, w, t0: t, t1: t + dur, depth });

    // Foliage hangs on the last two levels, not just the outermost tips —
    // otherwise the crown is a thin rim floating above a lot of bare wood.
    // Kept small so the twigs stay visible through it.
    if (depth <= 1) {
      const tip = depth === 0;
      const n = tip ? 2 + Math.floor(rnd() * 3) : 1 + Math.floor(rnd() * 2);
      const rs = tip ? 1 : 0.74;
      for (let i = 0; i < n; i++) {
        leaves.push({
          x: x1 + (rnd() - 0.5) * 0.10,
          y: y1 + (rnd() - 0.5) * 0.09,
          r: (0.034 + rnd() * 0.028) * rs,
          t0: t + dur + rnd() * 0.26
        });
      }
      if (tip) return;
    }

    // Pull successive forks back toward vertical so the crown stays balanced
    // instead of drifting to whichever side the first fork favoured.
    const bias = (Math.PI / 2 - ang) * 0.26;
    // Outer forks open wider than inner ones, as a real crown does.
    const spread = (depth >= 4 ? 0.30 : depth >= 2 ? 0.44 : 0.56) + rnd() * 0.20;
    const k = 0.76 + rnd() * 0.08;
    branch(x1, y1, ang - spread * (0.85 + rnd() * 0.3) + bias, len * k, w * 0.70, depth - 1, t + dur);
    branch(x1, y1, ang + spread * (0.85 + rnd() * 0.3) + bias, len * (k - 0.03), w * 0.68, depth - 1, t + dur);
    // A third shoot fills the crown's middle and breaks the binary symmetry.
    if (depth >= 2 && rnd() > 0.30) {
      branch(x1, y1, ang + (rnd() - 0.5) * 0.5 + bias, len * 0.64, w * 0.54, depth - 1, t + dur + 0.08);
    }
    // Fine side twigs off the mid-levels — the detail that reads as "tree".
    if (depth === 2 || depth === 3) {
      const side = rnd() > 0.5 ? 1 : -1;
      branch(x1, y1, ang + side * (0.8 + rnd() * 0.4) + bias, len * 0.42, w * 0.40, depth - 2, t + dur + 0.14);
    }
  }

  // Trunk rises from the seed, then forks. Short and thick: the figure stands
  // in front of it, so the trunk is mostly hidden and the crown does the work.
  const baseY = 0.0, trunkTop = 0.15;
  wood.push({ x0: 0.5, y0: baseY, x1: 0.5, y1: trunkTop, w: 0.080, t0: 0.26, t1: 0.92, depth: 5 });
  branch(0.5, trunkTop, Math.PI / 2, 0.176, 0.055, 5, 0.92);

  // Normalise the timeline so growth fills the whole GROW budget rather than
  // finishing early and leaving dead air before the hold.
  let span = 0;
  for (const s of wood) span = Math.max(span, s.t1);
  for (const l of leaves) span = Math.max(span, l.t0);
  const k = span > 0 ? (GROW * 0.94) / span : 1;
  for (const s of wood) { s.t0 *= k; s.t1 *= k; }
  for (const l of leaves) l.t0 *= k;

  return { wood, leaves };
}

const TREE = buildTree();

// Distance from point to segment, in normalised units.
function segDist(px, py, s) {
  const dx = s.x1 - s.x0, dy = s.y1 - s.y0;
  const L = dx * dx + dy * dy;
  let t = L ? ((px - s.x0) * dx + (py - s.y0) * dy) / L : 0;
  t = clamp01(t);
  const qx = s.x0 + dx * t, qy = s.y0 + dy * t;
  return Math.hypot(px - qx, py - qy);
}

// Rasterise the tree into a cols x rows grid of { tone, birth }.
// Shape-major, not cell-major: each segment and leaf stamps only the cells in
// its own bounding box. Testing every cell against every shape is ~3M distance
// checks at this branch density and stalls ~100ms on load and on every resize.
function rasterise(cols, rows, aspect) {
  const grid = new Array(cols * rows).fill(null);
  const rnd = rand(77003);

  // Cell centre <-> normalised space. x is aspect-corrected so the tree stays
  // round on a canvas that is not square; y runs 0 at the base, 1 at the top.
  const axOf = i => (((i + 0.5) / cols) - 0.5) * aspect + 0.5;
  const pyOf = j => 1 - (j + 0.5) / rows;
  const iOf = ax => (((ax - 0.5) / aspect) + 0.5) * cols - 0.5;
  const jOf = py => (1 - py) * rows - 0.5;
  const AX = n => (n - 0.5) * aspect + 0.5;   // normalised x -> corrected x

  const put = (i, j, tone, birth) => {
    const k = j * cols + i;
    const cur = grid[k];
    if (!cur) { grid[k] = { tone, birth }; return; }
    if (birth < cur.birth) cur.birth = birth;
    // Wood wins over foliage wherever the two overlap.
    if (isWood(tone) && !isWood(cur.tone)) cur.tone = tone;
  };

  // Walk only the cells inside a bounding box, given in corrected-x / base-y.
  const box = (ax0, ax1, py0, py1, pad, visit) => {
    const i0 = Math.max(0, Math.floor(iOf(Math.min(ax0, ax1) - pad)));
    const i1 = Math.min(cols - 1, Math.ceil(iOf(Math.max(ax0, ax1) + pad)));
    const j0 = Math.max(0, Math.floor(jOf(Math.max(py0, py1) + pad)));
    const j1 = Math.min(rows - 1, Math.ceil(jOf(Math.min(py0, py1) - pad)));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) visit(i, j);
  };

  for (const s of TREE.wood) {
    const as = { x0: AX(s.x0), y0: s.y0, x1: AX(s.x1), y1: s.y1 };
    // Never let a twig fall below one cell wide, or it rasterises to nothing
    // and its leaf cluster is left floating unattached to the tree.
    const half = Math.max(s.w * 0.5, 0.75 / cols);
    const tone = s.depth >= 4 ? WOOD : s.depth >= 2 ? WOOD_L : TWIG;
    const dx = as.x1 - as.x0, dy = as.y1 - as.y0;
    const L = dx * dx + dy * dy;
    box(as.x0, as.x1, as.y0, as.y1, half, (i, j) => {
      const ax = axOf(i), py = pyOf(j);
      if (segDist(ax, py, as) > half) return;
      // Birth runs along the segment, so a branch extends from its base
      // rather than appearing all at once.
      const u = L ? clamp01(((ax - as.x0) * dx + (py - as.y0) * dy) / L) : 0;
      put(i, j, tone, s.t0 + (s.t1 - s.t0) * u);
    });
  }

  for (const l of TREE.leaves) {
    const lx = AX(l.x);
    box(lx, lx, l.y, l.y, l.r, (i, j) => {
      const d = Math.hypot(axOf(i) - lx, pyOf(j) - l.y);
      if (d > l.r) return;
      // Stipple the canopy rim so it does not read as a solid disc —
      // the further out, the likelier a cell is dropped.
      const edge = d / l.r;
      if (edge > 0.70 && rnd() < ((edge - 0.70) / 0.30) * 0.7) return;
      put(i, j, rnd() > 0.72 ? LEAF_D : LEAF, l.t0 + edge * 0.22);
    });
  }

  return grid;
}

/* ── tile renderer ──────────────────────────────────────────────────────── */

function makeTileFactory() {
  const cache = new Map();
  return (base, size, dark) => {
    const key = base + '|' + size + '|' + dark;
    if (cache.has(key)) return cache.get(key);
    const s = size, c = document.createElement('canvas');
    c.width = c.height = s;
    const x = c.getContext('2d');
    x.fillStyle = base; x.fillRect(0, 0, s, s);
    const e = Math.max(1, Math.round(s * 0.06));
    x.fillStyle = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.3)';
    x.fillRect(0, 0, s, e); x.fillRect(0, 0, e, s);
    x.fillStyle = dark ? 'rgba(0,0,0,0.4)' : 'rgba(36,38,42,0.12)';
    x.fillRect(0, s - e, s, e); x.fillRect(s - e, 0, e, s);
    const r = s * 0.32, cx = s / 2, cy = s / 2;
    x.fillStyle = dark ? 'rgba(0,0,0,0.45)' : 'rgba(36,38,42,0.18)';
    x.beginPath(); x.arc(cx + s * 0.05, cy + s * 0.07, r, 0, Math.PI * 2); x.fill();
    x.fillStyle = base;
    x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
    const g = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.55)');
    g.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.addColorStop(1, dark ? 'rgba(0,0,0,0.3)' : 'rgba(36,38,42,0.16)');
    x.strokeStyle = g; x.lineWidth = Math.max(1, s * 0.08);
    x.beginPath(); x.arc(cx, cy, r - x.lineWidth / 2, 0, Math.PI * 2); x.stroke();
    if (cache.size > 48) cache.clear();
    cache.set(key, c);
    return c;
  };
}

/* ── mount ──────────────────────────────────────────────────────────────── */

export function mountTreeMosaic(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  const tileOf = makeTileFactory();
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hold = opts.hold ?? 4;
  const fade = opts.fade ?? 1;
  const gap = opts.gap ?? 0.6;
  const targetTile = opts.tile ?? 10;
  const greenK = opts.green ?? 0.42;
  const cycle = GROW + hold + fade + gap;

  let grid = null, cols = 0, rows = 0, p = 0, ox = 0, oy = 0, gridKey = '';
  let tones = null, toneKey = '';
  const t0 = performance.now();
  let raf, last = 0;

  function readTones(dark) {
    const cs = getComputedStyle(canvas);
    const bg = rgb(cs.getPropertyValue('--bg').trim(), dark ? [22, 21, 19] : [239, 232, 216]);
    const ink = rgb(cs.getPropertyValue('--text').trim(), dark ? [239, 232, 216] : [36, 38, 42]);
    const grn = rgb(cs.getPropertyValue('--brick-green').trim(), [92, 158, 150]);
    return [
      css(mix(0.64, bg, ink)),              // WOOD   — trunk, the darkest mass
      css(mix(0.46, bg, ink)),              // WOOD_L — limbs, a step lighter
      css(mix(0.30, bg, ink)),              // TWIG   — fine outer branches
      css(mix(greenK, bg, grn)),            // LEAF   — the subtle canopy tint
      css(mix(greenK * 0.68, bg, grn))      // LEAF_D — a second, quieter green
    ];
  }

  function layout(w, h, dpr) {
    p = Math.max(6, Math.round(targetTile * dpr));
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    cols = Math.ceil(W / p); rows = Math.ceil(H / p);
    ox = Math.round((W - cols * p) / 2); oy = H - rows * p;
    const key = cols + 'x' + rows;
    if (key !== gridKey) { gridKey = key; grid = rasterise(cols, rows, (cols * p) / (rows * p)); }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return;
    last = now;

    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; gridKey = ''; }

    layout(w, h, dpr);

    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const tk = dark + '|' + greenK;
    if (tk !== toneKey) { toneKey = tk; tones = readTones(dark); }

    const t = (now - t0) / 1000;
    // Reduced motion: hold the finished tree, no cycling.
    const tt = reduced ? GROW : t % cycle;
    const alpha = reduced ? 1
      : tt < GROW + hold ? 1
        : tt < GROW + hold + fade ? 1 - (tt - GROW - hold) / fade
          : 0;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (alpha <= 0) return;
    ctx.globalAlpha = alpha;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const cell = grid[j * cols + i];
        if (!cell || cell.birth > tt) continue;
        const k = clamp01((tt - cell.birth) / POP);
        // Bricks snap into place rather than fading — they are solid objects.
        // A little overshoot is left in so the pop reads; it settles back to p.
        const sc = reduced ? 1 : Math.min(1.12, easeBack(k));
        if (sc <= 0) continue;
        const size = Math.max(1, Math.round(p * sc));
        const d = Math.round((p - size) / 2);
        ctx.drawImage(tileOf(tones[cell.tone], p, dark), ox + i * p + d, oy + j * p + d, size, size);
      }
    }
    ctx.globalAlpha = 1;
  }

  raf = requestAnimationFrame(frame);
  // The grid is rebuilt lazily on the next frame after a resize.
  const onResize = () => { gridKey = ''; };
  window.addEventListener('resize', onResize);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    }
  };
}
