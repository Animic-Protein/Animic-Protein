(() => {
  'use strict';

  const MEMORY_KEY = 'animic-protein-inter-nos-v2';
  const GERM_KEY = 'animic-protein-germina-v2';
  const STATES = new Set(['canonica', 'emergent', 'sembrada', 'compostada']);
  const LIFE = new Set(['germen', 'brot', 'arrelat', 'compost']);
  const nodeId = value => typeof value === 'string' && /^[a-z0-9-]{1,80}$/i.test(value) ? value : '';
  const clean = (value, max = 1200) => typeof value === 'string'
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, '').slice(0, max)
    : '';
  const iso = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) ? value : new Date().toISOString();

  const readArray = key => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeArray = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value.slice(-24))); } catch {}
  };

  const memory = readArray(MEMORY_KEY).map(item => {
    if (!item || typeof item !== 'object') return null;
    const aId = nodeId(item.aId), bId = nodeId(item.bId);
    if (!aId || !bId) return null;
    return {
      id: clean(item.id, 180) || [aId, bId].sort().join('::'),
      a: clean(item.a, 160),
      b: clean(item.b, 160),
      aId,
      bId,
      title: clean(item.title, 240),
      text: clean(item.text, 1200),
      action: clean(item.action, 800),
      state: STATES.has(item.state) ? item.state : 'emergent',
      timestamp: iso(item.timestamp)
    };
  }).filter(Boolean);
  writeArray(MEMORY_KEY, memory);

  const germs = readArray(GERM_KEY).map(item => {
    if (!item || typeof item !== 'object') return null;
    const aId = nodeId(item.aId), bId = nodeId(item.bId), id = nodeId(item.id);
    if (!aId || !bId || !id) return null;
    return {
      id,
      sourceRelationId: clean(item.sourceRelationId, 180),
      title: clean(item.title, 240),
      desc: clean(item.desc, 1200),
      aId,
      bId,
      life: LIFE.has(item.life) ? item.life : 'germen',
      uses: Number.isFinite(Number(item.uses)) ? Math.max(0, Math.min(999, Number(item.uses))) : 0,
      createdAt: iso(item.createdAt),
      updatedAt: iso(item.updatedAt)
    };
  }).filter(Boolean);
  writeArray(GERM_KEY, germs);

  const style = document.createElement('style');
  style.dataset.foundation = 'a11y';
  style.textContent = `
    .skip-link{position:fixed;left:12px;top:12px;z-index:9999;padding:.7rem 1rem;border-radius:999px;background:#e9efe9;color:#0d1512;text-decoration:none;transform:translateY(-160%);transition:transform .16s ease}
    .skip-link:focus{transform:translateY(0)}
    :where(a,button,[tabindex]):focus-visible{outline:3px solid #d3ad61;outline-offset:4px}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}.skip-link{transition:none!important}*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
  `;
  document.head.appendChild(style);

  const main = document.querySelector('main');
  if (main) {
    if (!main.id) main.id = 'contingut';
    if (!document.querySelector('.skip-link')) {
      const skip = document.createElement('a');
      skip.className = 'skip-link';
      skip.href = `#${main.id}`;
      skip.textContent = 'Salta al contingut';
      document.body.prepend(skip);
    }
  }

  document.querySelectorAll('[data-open]').forEach(button => {
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', button.dataset.open || '');
  });

  document.querySelectorAll('dialog').forEach(dialog => {
    const heading = dialog.querySelector('h2');
    if (heading) {
      if (!heading.id) heading.id = `dialog-${dialog.id}-title`;
      dialog.setAttribute('aria-labelledby', heading.id);
    }
  });

  const afterBoot = () => {
    const output = document.getElementById('relation-output');
    if (output) {
      output.setAttribute('role', 'status');
      output.setAttribute('aria-live', 'polite');
      output.setAttribute('aria-atomic', 'true');
    }

    document.querySelectorAll('dialog a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        const dialog = link.closest('dialog');
        if (dialog?.open) dialog.close();
      });
    });
  };

  window.AnimicFoundation = Object.freeze({ version: '1.0.0', afterBoot });
})();
