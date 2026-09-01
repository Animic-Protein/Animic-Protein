(()=> {
  const panel=document.getElementById('node-panel');
  if(!panel)return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='./error-fertil-i.css';document.head.appendChild(link);
  const box=document.createElement('section');box.className='error-fertil-panel';box.hidden=true;
  box.innerHTML='<p class="ef-status">Compost provisional · Sembra 01</p><h4>Error fèrtil I</h4><p><strong>Què s’ha sentit:</strong> gravació mono d’1:25 amb continuïtats, respiracions i interrupcions breus. Les discontinuïtats no són errors per defecte.</p><p><strong>Què s’ha inferit:</strong> l’error fèrtil pot ser allò que deixa d’aparèixer i revela què continuava sostenint el temps.</p><p><strong>Què es proposa incorporar:</strong> conservar el cas en Compost, sense node nou ni principi canònic.</p><blockquote>Quan una continuïtat falla, no la reparis immediatament: escolta què queda sostenint el temps.</blockquote><details><summary>Relacions en observació</summary><ul><li>Felix Error · la fertilitat es prova</li><li>Temps nu · repetició, llindar, mutació i retorn</li><li>Silenci · absència activa sense diagnòstic automàtic</li><li>Continuum musicalis · ruptura entre estats</li><li>Navalla d’Occam + Principi d’Incertesa</li></ul></details><a href="./compost/error-fertil-i.md" target="_blank" rel="noopener">Obrir la fitxa traçable</a>';
  panel.appendChild(box);
  const render=()=>{const id=document.querySelector('#living-map [data-node].is-active')?.dataset?.node||'';box.hidden=id!=='compost'};
  window.addEventListener('animic:node-activated',()=>window.setTimeout(render,0));render();
})();
