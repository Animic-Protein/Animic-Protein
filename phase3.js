(() => {
  'use strict';

  // Fase III · capa d'interacció real per Safari/iPhone.
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width,initial-scale=1,viewport-fit=cover');
  }

  const style = document.createElement('style');
  style.dataset.audit = 'phase-iii-mobile';
  style.textContent = `
    html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
    body{overflow-x:hidden;padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}
    .hero{padding-top:max(10vh,calc(env(safe-area-inset-top) + 2rem))}
    footer{padding-bottom:max(3rem,calc(env(safe-area-inset-bottom) + 1.5rem))}
    #mapa-viu{scroll-margin-top:max(1rem,env(safe-area-inset-top))}
    :where(button,a,.portal){-webkit-tap-highlight-color:rgba(211,173,97,.18);touch-action:manipulation}
    :where(.portal,.constellation .hub,.satellites button,.node-actions button,.rose-links a,.z-actions button,.memory-list button,.memory-state,.grow-germ,.close,.seed-keep,.seed-item button){min-height:44px}
    .close{min-width:44px;display:inline-grid;place-items:center;line-height:1;border-radius:999px}
    dialog{max-height:min(82dvh,760px);overflow:auto;overscroll-behavior:contain;padding-bottom:max(2rem,calc(env(safe-area-inset-bottom) + 1rem))}
    .node-panel{max-height:min(70dvh,680px);overflow:auto;overscroll-behavior:contain}
    .seed-tools{display:grid;gap:.75rem;margin-top:1rem}
    .seed-keep{border:1px solid rgba(211,173,97,.36);background:rgba(211,173,97,.07);color:var(--ink);border-radius:999px;padding:.7rem 1rem;font:inherit;cursor:pointer}
    .seed-keep:disabled{opacity:.45;cursor:not-allowed}
    .seed-memory{border-top:1px solid var(--line);padding-top:.9rem;margin-top:.35rem}
    .seed-memory-title{margin:0 0 .55rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.12em;font-size:.68rem;color:var(--metal)}
    .seed-list{display:grid;gap:7px}
    .seed-item{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:start;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:.65rem;background:rgba(255,255,255,.02)}
    .seed-item p{margin:0;color:var(--muted);line-height:1.4;font-size:.9rem}
    .seed-item small{display:block;margin-top:.3rem;color:var(--metal)}
    .seed-item button{border:0;background:transparent;color:var(--muted);font:inherit;cursor:pointer;padding:.3rem .55rem;border-radius:999px}
    @media(max-width:780px){
      .hero,main,footer{width:min(100% - 24px,1120px)}
      .actions{gap:10px}
      .portal{min-height:48px;padding:.85rem 1rem}
      .living-map{padding:.8rem;border-radius:22px;gap:12px}
      .map-core{width:164px;height:164px}
      .map-core strong{font-size:1.65rem}
      .constellation .hub,.satellites button{padding:.8rem 1rem}
      .node-panel{padding:1rem;max-height:none}
      .node-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
      .node-actions button{width:100%;padding:.7rem .55rem}
      .rose-links{grid-template-columns:1fr}
      dialog{width:calc(100% - 20px);padding:1.25rem;margin-top:max(10px,env(safe-area-inset-top));margin-bottom:max(10px,env(safe-area-inset-bottom))}
    }
    @media(max-width:390px){
      h1{font-size:clamp(2.7rem,15vw,4.2rem)}
      .node-actions{grid-template-columns:1fr}
    }
    @media(hover:none),(pointer:coarse){
      .portal:hover,.constellation button:hover{transform:none}
      .portal:active,.constellation button:active,.node-actions button:active,.rose-links a:active{transform:scale(.985)}
    }
  `;
  document.head.appendChild(style);

  const refocusActiveNode = () => {
    const active = document.querySelector('#living-map [data-node].is-active');
    if (!active) return;
    window.requestAnimationFrame(() => active.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
  };

  window.addEventListener('orientationchange', () => window.setTimeout(refocusActiveNode, 260));

  document.querySelectorAll('[data-open]').forEach(opener => {
    opener.addEventListener('click', () => {
      const target = document.getElementById(opener.dataset.open || '');
      document.querySelectorAll('dialog[open]').forEach(dialog => {
        if (dialog !== target) dialog.close();
      });
    });
  });

  // Sembra deixa de ser una resposta efímera: les llavors es poden conservar i compostar.
  const SEED_KEY = 'animic-protein-seed-memory-v1';
  const readSeeds = () => {
    try {
      const value = JSON.parse(localStorage.getItem(SEED_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  };
  const writeSeeds = value => {
    try { localStorage.setItem(SEED_KEY, JSON.stringify(value.slice(-12))); } catch {}
  };
  const cleanSeed = text => typeof text === 'string' ? text.replace(/[<>\u0000-\u001f\u007f]/g, '').trim().slice(0, 500) : '';

  const seedDialog = document.getElementById('sembra');
  const seedOutput = document.getElementById('seed-output');
  const seedButton = document.getElementById('seed-button');
  if (seedDialog && seedOutput && seedButton && !seedDialog.querySelector('.seed-tools')) {
    const tools = document.createElement('div');
    tools.className = 'seed-tools';
    const keep = document.createElement('button');
    keep.type = 'button';
    keep.className = 'seed-keep';
    keep.textContent = 'Conservar aquesta llavor';
    keep.disabled = true;
    const memory = document.createElement('div');
    memory.className = 'seed-memory';
    tools.append(keep, memory);
    seedDialog.appendChild(tools);

    const renderSeeds = () => {
      const seeds = readSeeds().slice().reverse();
      memory.innerHTML = `<p class="seed-memory-title">Llavors conservades</p>${seeds.length ? '<div class="seed-list"></div>' : '<p class="memory-empty">Encara no n’has conservat cap.</p>'}`;
      const list = memory.querySelector('.seed-list');
      if (!list) return;
      seeds.forEach(seed => {
        const item = document.createElement('div');
        item.className = 'seed-item';
        const text = document.createElement('div');
        const p = document.createElement('p');
        p.textContent = seed.text;
        const small = document.createElement('small');
        small.textContent = seed.source ? `Origen: ${seed.source}` : 'Origen: atzar dadaista';
        text.append(p, small);
        const compost = document.createElement('button');
        compost.type = 'button';
        compost.textContent = 'Compost';
        compost.setAttribute('aria-label', `Retorna al compost: ${seed.text}`);
        compost.addEventListener('click', () => {
          writeSeeds(readSeeds().filter(entry => entry.id !== seed.id));
          renderSeeds();
        });
        item.append(text, compost);
        list.appendChild(item);
      });
    };

    seedButton.addEventListener('click', () => {
      window.setTimeout(() => { keep.disabled = !cleanSeed(seedOutput.textContent); }, 0);
    });

    keep.addEventListener('click', () => {
      const text = cleanSeed(seedOutput.textContent);
      if (!text) return;
      const active = document.querySelector('#living-map [data-node].is-active');
      const source = cleanSeed(active?.dataset?.title || active?.textContent || 'Atzar dadaista').slice(0, 120);
      const seeds = readSeeds();
      if (!seeds.some(entry => entry.text === text)) {
        seeds.push({ id: `seed-${Date.now().toString(36)}`, text, source, createdAt: new Date().toISOString() });
        writeSeeds(seeds);
      }
      keep.textContent = 'Llavor conservada';
      keep.disabled = true;
      window.setTimeout(() => { keep.textContent = 'Conservar aquesta llavor'; }, 1200);
      renderSeeds();
    });

    renderSeeds();
  }
})();
