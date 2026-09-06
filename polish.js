/* DialKit 2 vanilla + Motion. No framework or build step required. */
(() => {
  const { animate } = Motion;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const cards = [...document.querySelectorAll('article.card')];
  document.querySelectorAll('.day-bar').forEach((bar, index) => {
    bar.dataset.day = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index];
  });
  const active = new Map();
  let values;

  function move(element, frames, options = {}) {
    active.get(element)?.stop();
    const animation = animate(element, frames, { ...options, ...(reduced.matches ? { duration: 0, delay: 0, type: 'tween' } : {}) });
    active.set(element, animation);
    animation.then(() => { if (active.get(element) === animation) active.delete(element); });
    return animation;
  }
  function spring() {
    const config = values.motion.transition;
    return { ...config, ...(config.type === 'spring' ? { type: 'spring' } : {}) };
  }
  function replay() {
    cards.forEach((card, index) => move(card, { opacity: [0, 1], y: [values.motion.distance, 0] }, { ...spring(), delay: reduced.matches ? 0 : index * values.motion.stagger }));
    document.querySelectorAll('.day-bar').forEach((bar, index) => move(bar, { scaleY: [.05, 1] }, { ...spring(), delay: index * values.motion.stagger }));
  }

  const root = DialKit.createDialRoot({ mode: 'inline', target: document.getElementById('dialkitHost'), theme: 'light', defaultOpen: true });
  const kit = DialKit.createDialKit('Stillpoint', {
    motion: {
      transition: { type: 'spring', visualDuration: .4, bounce: .08 },
      distance: [8, 0, 24, 8],
      stagger: [.035, 0, .1, .005],
      hoverLift: [2, 0, 4, .5],
      pressScale: [.97, .94, 1, .005],
      imageScale: [1.025, 1, 1.06, .005]
    },
    surface: { _collapsed: true, shadowBlur: [36, 8, 48, 8], shadowOpacity: [.035, 0, .08, .005], borderOpacity: [.065, .03, .12, .005], accent: '#a9b8a5' },
    replay: { type: 'action', label: 'Replay entrance' },
    reset: { type: 'action', label: 'Restore defaults' }
  }, { id: 'stillpoint-ui-v1', persist: true, onAction(path) { if (path === 'replay') replay(); if (path === 'reset') { kit.resetValues(); replay(); } } });
  kit.subscribe(next => {
    values = next;
    const style = document.documentElement.style;
    style.setProperty('--surface-blur', `${next.surface.shadowBlur}px`);
    style.setProperty('--surface-opacity', next.surface.shadowOpacity);
    style.setProperty('--surface-border', next.surface.borderOpacity);
    style.setProperty('--accent', next.surface.accent);
  });

  cards.forEach(card => {
    card.addEventListener('pointerenter', () => { if (finePointer.matches && !reduced.matches) move(card, { y: -values.motion.hoverLift, opacity: 1 }, spring()); });
    card.addEventListener('pointerleave', () => move(card, { y: 0, opacity: 1 }, spring()));
  });
  document.querySelectorAll('main button').forEach(button => {
    button.addEventListener('pointerdown', () => move(button, { scale: values.motion.pressScale }, spring()));
    ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(event => button.addEventListener(event, () => move(button, { scale: 1 }, spring())));
  });
  document.querySelectorAll('.card img, .shader').forEach(image => {
    image.addEventListener('pointerenter', () => { if (finePointer.matches && !reduced.matches) move(image, { scale: values.motion.imageScale }, spring()); });
    image.addEventListener('pointerleave', () => move(image, { scale: 1 }, spring()));
  });
  ['playButton', 'timerButton'].forEach(id => document.getElementById(id).addEventListener('click', event => {
    const icon = event.currentTarget.querySelector('svg');
    if (icon) move(icon, { opacity: [.3, 1], scale: [.8, 1] }, spring());
  }));

  // Announce changing state without reading the countdown aloud every second.
  document.getElementById('noteStatus').setAttribute('aria-live', 'polite');
  const timerButton = document.getElementById('timerButton');
  timerButton.addEventListener('click', () => timerButton.setAttribute('aria-label', `${timerButton.textContent.trim()} focus timer`));
  const unreadCount = document.getElementById('inbox-title').parentElement.nextElementSibling;
  unreadCount.textContent = document.querySelectorAll('.inbox-item[data-read="false"]').length;
  unreadCount.setAttribute('aria-live', 'polite');

  const panel = document.getElementById('tuningPanel');
  const toggle = document.getElementById('tuneButton');
  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      move(panel, { opacity: [0, 1], y: [8, 0] }, spring());
      document.getElementById('closeTuning').focus();
    } else toggle.focus();
  }
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  document.getElementById('closeTuning').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) setOpen(false); });
  reduced.addEventListener('change', () => {
    active.forEach(animation => animation.stop()); active.clear();
    cards.forEach(card => { card.style.opacity = 1; card.style.transform = 'none'; });
    document.querySelectorAll('.day-bar, .card img, .shader, main button').forEach(element => { element.style.transform = 'none'; });
  });
  replay();
})();
