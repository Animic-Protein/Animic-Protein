(() => {
  'use strict';

  const GERM_KEY = 'animic-protein-germina-v2';
  const SEED_KEY = 'animic-protein-seed-memory-v1';

  const read = key => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  };
  const write = (key, value, limit) => {
    try { localStorage.setItem(key, JSON.stringify(value.slice(-limit))); } catch {}
  };
  const clean = (value, max = 500) => typeof value === 'string'
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, '').trim().slice(0, max)
    : '';
  const hash = s => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  };

  const activeGerm = () => {
    const id = document.querySelector('#living-map [data-node].is-active')?.dataset?.node;
    if (!id) return null;
    return read(GERM_KEY).find(g => g.id === id) || null;
  };

  const nutrientText = germ => {
    const title = clean(germ?.title || 'Llavor compostada', 120).replace(/^Llavor\s*·\s*/i, '');
    return clean(`Del compost de «${title}»: conserva només el rastre que encara pugui transformar una relació del Còdex.`, 500);
  };

  const returnToSeed = germ => {
    if (!germ?.id || germ.life !== 'compost') return null;
    const germs = read(GERM_KEY);
    const current = germs.find(g => g.id === germ.id);
    if (!current) return null;

    const seedId = current.compostSeedId || `seed-compost-${hash(current.id)}`;
    const seeds = read(SEED_KEY);
    let seed = seeds.find(s => s.id === seedId);
    const now = new Date().toISOString();

    if (!seed) {
      seed = {
        id: seedId,
        text: nutrientText(current),
        source: `Compost · ${clean(current.title, 100)}`,
        sourceId: 'compost',
        createdAt: now,
        compostOriginId: current.id
      };
      write(SEED_KEY, [...seeds, seed], 12);
    }

    write(GERM_KEY, germs.map(g => g.id === current.id
      ? { ...g, compostReturnedAt: g.compostReturnedAt || now, compostSeedId: seedId, updatedAt: now }
      : g), 24);

    const output = document.getElementById('relation-output');
    if (output) output.innerHTML = `<strong>Compost viu</strong><br>«${clean(current.title, 120)}» ha deixat nutrient i torna al cicle com una nova llavor.`;

    window.dispatchEvent(new Event('resize'));
    return seed;
  };

  const decorate = () => {
    const panel = document.querySelector('.germ-life-panel');
    if (!panel) return;
    panel.querySelector('.compost-return')?.remove();

    const germ = activeGerm();
    if (!germ || germ.life !== 'compost') return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'grow-germ compost-return';
    const already = Boolean(germ.compostSeedId || germ.compostReturnedAt);
    button.textContent = already ? 'Nutrient retornat' : 'Retorna com a llavor';
    button.disabled = already;
    button.setAttribute('aria-label', already
      ? 'Aquest node ja ha retornat nutrient al cicle'
      : `Retorna ${clean(germ.title, 100)} al cicle com una nova llavor`);

    button.addEventListener('click', () => {
      const seed = returnToSeed(germ);
      if (!seed) return;
      button.textContent = 'Nutrient retornat';
      button.disabled = true;

      const dialog = document.getElementById('sembra');
      if (dialog && typeof dialog.showModal === 'function' && !dialog.open) {
        dialog.showModal();
      }
    });

    panel.appendChild(button);
  };

  const panel = document.getElementById('node-panel');
  if (!panel) return;
  const observer = new MutationObserver(() => window.setTimeout(decorate, 0));
  observer.observe(panel, { childList: true, subtree: true, characterData: true });
  panel.addEventListener('click', () => window.setTimeout(decorate, 0));
  decorate();
})();
