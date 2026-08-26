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
    :where(.portal,.constellation .hub,.satellites button,.node-actions button,.rose-links a,.z-actions button,.memory-list button,.memory-state,.grow-germ,.close){min-height:44px}
    .close{min-width:44px;display:inline-grid;place-items:center;line-height:1;border-radius:999px}
    dialog{max-height:min(82dvh,760px);overflow:auto;overscroll-behavior:contain;padding-bottom:max(2rem,calc(env(safe-area-inset-bottom) + 1rem))}
    .node-panel{max-height:min(70dvh,680px);overflow:auto;overscroll-behavior:contain}
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

  // Evita que el teclat virtual o un canvi d'orientació deixin el node actiu fora de vista.
  const refocusActiveNode = () => {
    const active = document.querySelector('#living-map [data-node].is-active');
    if (!active) return;
    window.requestAnimationFrame(() => active.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
  };

  window.addEventListener('orientationchange', () => window.setTimeout(refocusActiveNode, 260));

  // En Safari, Escape no existeix al tacte: permet tancar qualsevol diàleg tocant el fons
  // i assegura que no quedin dos diàlegs oberts alhora.
  document.querySelectorAll('[data-open]').forEach(opener => {
    opener.addEventListener('click', () => {
      const target = document.getElementById(opener.dataset.open || '');
      document.querySelectorAll('dialog[open]').forEach(dialog => {
        if (dialog !== target) dialog.close();
      });
    });
  });
})();
