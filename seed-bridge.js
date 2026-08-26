(() => {
  'use strict';

  const SEED_KEY = 'animic-protein-seed-memory-v1';
  const GERM_KEY = 'animic-protein-germina-v2';
  const read = key => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  };
  const write = (key, value, limit) => {
    try { localStorage.setItem(key, JSON.stringify(value.slice(-limit))); } catch {}
  };
  const cleanId = value => typeof value === 'string' && /^[a-z0-9-]{1,80}$/i.test(value) ? value : '';
  const hash = s => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  };

  const sourceIdFor = seed => {
    const stored = cleanId(seed.sourceId);
    if (stored && document.querySelector(`#living-map [data-node="${stored}"]`)) return stored;
    const sourceName = String(seed.source || '').trim();
    const node = [...document.querySelectorAll('#living-map [data-node]')].find(item =>
      (item.dataset.title || item.textContent || '').trim() === sourceName
    );
    return cleanId(node?.dataset?.node) || 'llavor-mutatio';
  };

  const germinate = seed => {
    if (!seed?.id || !seed?.text) return null;
    const germs = read(GERM_KEY);
    const existing = germs.find(g => g.sourceSeedId === seed.id);
    if (existing) return existing;

    const aId = sourceIdFor(seed);
    const bId = aId === 'llavor-mutatio' ? 'compost' : 'llavor-mutatio';
    const now = new Date().toISOString();
    const germ = {
      id: `germen-${hash(`seed:${seed.id}`)}`,
      sourceRelationId: `seed:${seed.id}`,
      sourceSeedId: seed.id,
      title: `Llavor · ${String(seed.text).slice(0, 72)}`,
      desc: `Nascuda d'una llavor conservada. Origen: ${seed.source || 'Atzar dadaista'}. ${seed.text}`,
      aId,
      bId,
      life: 'germen',
      uses: 0,
      createdAt: now,
      updatedAt: now
    };
    write(GERM_KEY, [...germs, germ], 24);
    write(SEED_KEY, read(SEED_KEY).map(item => item.id === seed.id ? { ...item, germinatedAt: now, germId: germ.id } : item), 12);

    // germinacio.js re-renderitza quan rep resize.
    window.dispatchEvent(new Event('resize'));
    window.setTimeout(() => {
      const node = document.querySelector(`#living-map [data-node="${germ.id}"]`);
      document.getElementById('sembra')?.close();
      document.getElementById('mapa-viu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (node) {
        node.click();
        node.focus({ preventScroll: true });
      }
    }, 220);
    return germ;
  };

  const decorate = () => {
    const seeds = read(SEED_KEY);
    document.querySelectorAll('.seed-item').forEach(item => {
      if (item.querySelector('.seed-germinate')) return;
      const text = item.querySelector('p')?.textContent?.trim();
      const seed = seeds.find(entry => entry.text === text);
      if (!seed) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'seed-germinate';
      button.textContent = seed.germinatedAt ? 'Germinada' : 'Germina';
      button.disabled = Boolean(seed.germinatedAt);
      button.setAttribute('aria-label', `Germina al Mapa Viu: ${seed.text}`);
      button.addEventListener('click', () => {
        const germ = germinate(seed);
        if (!germ) return;
        button.textContent = 'Germinada';
        button.disabled = true;
      });
      item.appendChild(button);
    });
  };

  const dialog = document.getElementById('sembra');
  if (!dialog) return;
  const observer = new MutationObserver(decorate);
  observer.observe(dialog, { childList: true, subtree: true });
  dialog.addEventListener('toggle', decorate);
  dialog.addEventListener('click', () => window.setTimeout(decorate, 0));
  decorate();
})();
