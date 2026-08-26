(() => {
  'use strict';

  const map = document.getElementById('living-map');
  const panel = document.getElementById('node-panel');
  if (!map || !panel) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const phases = [
    { id: 'inspiracio', label: 'Inspiració', note: 'Expansió: observa què demana relació.' },
    { id: 'suspensio', label: 'Suspensió', note: 'Interval: no cal produir res.' },
    { id: 'expiracio', label: 'Expiració', note: 'Retorn: deixa anar el que ja ha complert la seva funció.' },
    { id: 'silenci', label: 'Silenci', note: 'Repòs: el Còdex no actua.' }
  ];
  const durations = [7000, 3000, 7000, 5000];
  let index = 0;
  let timer = null;
  let running = !reduced.matches;

  const style = document.createElement('style');
  style.dataset.layer = 'breathing';
  style.textContent = `
    .breath-panel{border-top:1px solid var(--line);margin-top:.9rem;padding-top:.9rem}
    .breath-row{display:flex;align-items:center;justify-content:space-between;gap:.75rem}
    .breath-state{display:flex;align-items:center;gap:.55rem;color:var(--metal)}
    .breath-dot{width:.72rem;height:.72rem;border-radius:50%;background:currentColor;box-shadow:0 0 0 0 rgba(211,173,97,.18)}
    .breath-toggle{border:1px solid var(--line);background:transparent;color:var(--ink);border-radius:999px;min-height:44px;padding:.55rem .8rem;font:inherit;cursor:pointer}
    #living-map[data-breath="inspiracio"]{box-shadow:0 30px 90px rgba(0,0,0,.28) inset,0 0 34px rgba(211,173,97,.08)}
    #living-map[data-breath="expiracio"]{box-shadow:0 30px 90px rgba(0,0,0,.34) inset}
    #living-map[data-breath="silenci"]{filter:saturate(.86) brightness(.96)}
    @media (prefers-reduced-motion:no-preference){
      #living-map[data-breath="inspiracio"] .map-orbit{animation-duration:5.5s}
      #living-map[data-breath="expiracio"] .map-orbit{animation-duration:9s;opacity:.45}
      .breath-dot{transition:transform 1.2s ease,opacity 1.2s ease,box-shadow 1.2s ease}
      [data-breath="inspiracio"] ~ * .breath-dot{transform:scale(1.22)}
    }
  `;
  document.head.appendChild(style);

  const box = document.createElement('div');
  box.className = 'breath-panel';
  box.innerHTML = `
    <p class="memory-title">Respiració</p>
    <div class="breath-row">
      <div class="breath-state"><span class="breath-dot" aria-hidden="true"></span><strong class="breath-label"></strong></div>
      <button type="button" class="breath-toggle"></button>
    </div>
    <p class="memory-empty breath-note" aria-live="polite"></p>
  `;
  panel.appendChild(box);

  const label = box.querySelector('.breath-label');
  const note = box.querySelector('.breath-note');
  const toggle = box.querySelector('.breath-toggle');
  const dot = box.querySelector('.breath-dot');

  const paint = () => {
    const phase = phases[index];
    map.dataset.breath = running ? phase.id : 'silenci';
    label.textContent = running ? phase.label : 'Repòs';
    note.textContent = running ? phase.note : 'Ritme aturat. Cap procés metabòlic automàtic.';
    toggle.textContent = running ? 'Reposar' : 'Respirar';
    toggle.setAttribute('aria-pressed', String(running));
    dot.style.opacity = running ? '1' : '.45';
  };

  const schedule = () => {
    window.clearTimeout(timer);
    if (!running || document.hidden || reduced.matches) return;
    timer = window.setTimeout(() => {
      index = (index + 1) % phases.length;
      paint();
      schedule();
    }, durations[index]);
  };

  toggle.addEventListener('click', () => {
    running = !running;
    if (running && reduced.matches) running = false;
    paint();
    schedule();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearTimeout(timer);
    else schedule();
  });

  reduced.addEventListener?.('change', event => {
    if (event.matches) running = false;
    paint();
    schedule();
  });

  paint();
  schedule();
})();
