// Capa visual mínima per fer perceptible el routing sense automatitzar decisions.
(() => {
  const mount = () => {
    if (document.querySelector('#sourceRoutingVisible')) return;
    const circulation = document.querySelector('#circulation');
    if (!circulation) return;

    const section = document.createElement('section');
    section.id = 'sourceRoutingVisible';
    section.className = 'panel circulation';
    section.innerHTML = `
      <div class="circulation-head">
        <div>
          <p class="ey">SOURCE ROUTING 1.0 · RESEARCH</p>
          <h2>research → 🐜 → Cambra Nua</h2>
        </div>
        <div class="mut">Suggerència reversible · decisió humana</div>
      </div>
      <div class="circulation-route" aria-label="Ruta de recerca cap a la Cambra Nua del Temps">
        <span class="pulse hot">research</span>
        <span class="pulse">→</span>
        <span class="pulse hot">🐜 relació</span>
        <span class="pulse">→</span>
        <span class="pulse hot">Cambra Nua del Temps</span>
      </div>
      <p class="mut" style="margin:.85rem 0 0">Una font de recerca no esdevé veritat ni cànon. La Formiga només assenyala una porta pertinent perquè la troballa pugui ser exposada al temps, contrastada i retornada amb rastre.</p>
      <div class="actions" style="margin-top:12px">
        <a class="btn organ-link" href="../cambra-nua-2/espera.html?source=research&via=scispace">Entrar a la prova temporal →</a>
      </div>
      <div class="ant-suggest" id="researchAntState">🐜 SciSpace/research pot entrar a la Cambra; la relació continua sent provisional.</div>
    `;
    circulation.insertAdjacentElement('afterend', section);

    window.addEventListener('codex:ant-relation', (event) => {
      const sourceKind = String(event.detail?.source?.kind || '').toLowerCase();
      const target = event.detail?.relation?.target || '';
      if (sourceKind !== 'research' && target !== 'cambra-nua-del-temps') return;
      const state = section.querySelector('#researchAntState');
      if (state) {
        state.textContent = '🐜 Relació research → Cambra Nua detectada amb rastre. Examina-la abans de decidir.';
        state.dataset.active = 'true';
      }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
