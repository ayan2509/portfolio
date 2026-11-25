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

/* Reveals: each .fv-anim element plays its entrance once when it comes
   into view (.is-in). Without motion, or without an observer, the
   finished state shows straight away. */
(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.fv-anim').forEach((el) => {
    if (still || !('IntersectionObserver' in window)) {
      el.classList.remove('fv-anim');
      return;
    }
    new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        el.classList.add('is-in');
        obs.disconnect();
      }
    }, { threshold: 0.25 }).observe(el);
  });
})();

/* Floating section nav: a page opts in with <nav id="prFnav" data-fnav>.
   It shows from the first listed section until the next-project link
   comes into view; the button opens the list, the section under the
   middle of the screen is marked current. (Older pages run their own
   copy of this and don't carry data-fnav.) */
(() => {
  const fnav = document.querySelector('#prFnav[data-fnav]');
  if (!fnav) return;
  const btn   = fnav.querySelector('.pr-fnav-btn');
  const list  = fnav.querySelector('.pr-fnav-list');
  const links = Array.from(list.querySelectorAll('a'));
  const first = links.length ? document.querySelector(links[0].getAttribute('href')) : null;
  const next  = document.querySelector('.pr-next');
  if (!first) return;

  const setOpen = (open) => {
    list.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', () => setOpen(list.hidden));
  links.forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('click', (e) => { if (!fnav.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !list.hidden) { setOpen(false); btn.focus(); } });

  const update = () => {
    const vh = window.innerHeight;
    const on = first.getBoundingClientRect().top < vh * 0.5 && (!next || next.getBoundingClientRect().top > vh - 24);
    fnav.classList.toggle('is-on', on);
    if (!on) setOpen(false);
    let cur = null;
    links.forEach((a) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t && t.getBoundingClientRect().top < vh * 0.5) cur = a;
    });
    links.forEach((a) => a.toggleAttribute('aria-current', a === cur));
    if (cur) cur.setAttribute('aria-current', 'true');
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
