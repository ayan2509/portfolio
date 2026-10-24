/* Case-study helpers shared by every page under projects/.
   Diagram labels: SVG text is sized in viewBox units, so a diagram that is
   drawn smaller than its viewBox shrinks its labels with it. This sets
   --svg-k (viewBox units per screen pixel) on each diagram; the label rules
   multiply their --cs-* size by it whenever it is above 1, so a label never
   renders below its role on screen. */
(() => {
  const set = (svg) => {
    const vb = svg.viewBox && svg.viewBox.baseVal;
    const r = svg.getBoundingClientRect();
    if (!vb || !vb.width || !r.width) return;
    const k = Math.max(vb.width / r.width, vb.height / r.height);
    svg.style.setProperty('--svg-k', k.toFixed(3));
  };
  const svgs = [...document.querySelectorAll('svg[viewBox]')].filter((s) => s.querySelector('text'));
  if (!svgs.length) return;
  const ro = 'ResizeObserver' in window ? new ResizeObserver((es) => es.forEach((e) => set(e.target))) : null;
  svgs.forEach((s) => { set(s); if (ro) ro.observe(s); });
})();
