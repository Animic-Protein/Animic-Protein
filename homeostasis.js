(() => {
  'use strict';

  const GERM_KEY='animic-protein-germina-v2';
  const SEED_KEY='animic-protein-seed-memory-v1';
  const MEMORY_KEY='animic-protein-inter-nos-v2';
  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const label=g=>String(g?.title||g?.id||'germen').replace(/^Llavor\s*·\s*/i,'').slice(0,100);
  const ageDays=g=>{const t=Date.parse(g?.updatedAt||g?.createdAt||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/86400000):0};
  const relationIds=r=>[r?.aId,r?.bId,r?.sourceId,r?.targetId].filter(Boolean);

  const snapshot=()=>{
    const germs=read(GERM_KEY),seeds=read(SEED_KEY),relations=read(MEMORY_KEY);
    const living=germs.filter(g=>g.life!=='compost');
    const compost=germs.filter(g=>g.life==='compost');
    const livingIds=new Set(living.map(g=>g.id));
    const relevantRelations=relations.filter(r=>relationIds(r).some(id=>livingIds.has(id)));
    const linked=new Set(relevantRelations.flatMap(relationIds));
    const dormant=living.filter(g=>(Number(g.uses)||0)===0&&!linked.has(g.id));
    const prolonged=dormant.filter(g=>ageDays(g)>=7);
    const density=living.length?relevantRelations.length/living.length:0;
    let state='equilibri';
    if(living.length>=12&&density<.5)state='dispersió';
    else if(living.length>=10&&relevantRelations.length>=20)state='saturació';
    else if(prolonged.length>=4)state='latència';
    else if(compost.length>=2&&living.length<=2)state='regeneració';
    return {germs,seeds,relations,relevantRelations,living,compost,dormant,prolonged,density,state};
  };

  const suggestion=s=>{
    if(s.state==='latència'&&s.prolonged.length){
      const candidate=s.prolonged.slice().sort((a,b)=>ageDays(b)-ageDays(a))[0];
      return {candidate,action:'consider-compost',text:`«${label(candidate)}» porta ${Math.floor(ageDays(candidate))} dies sense ús ni relacions pertinents. Potser convé escoltar-lo abans de decidir si torna al Compost.`};
    }
    if(s.state==='dispersió')return {action:'relate-first',text:'Hi ha molta matèria viva però poca densitat relacional pertinent. Abans de compostar, prova de relacionar o agrupar.'};
    if(s.state==='saturació')return {action:'pause',text:'Hi ha activitat i relacions pertinents abundants. No cal eliminar res automàticament: atura la sembra i observa què continua actiu.'};
    if(s.state==='regeneració')return {action:'metabolize',text:'Predomina el Compost. Busca què pot tornar transformat abans d’afegir matèria nova.'};
    return {action:'none',text:'El Còdex respira sense intervenció necessària.'};
  };

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');if(!panel)return null;
    let box=panel.querySelector('.homeostasis-panel');
    if(!box){box=document.createElement('div');box.className='homeostasis-panel';box.style.cssText='border-top:1px solid var(--line);margin-top:.9rem;padding-top:.9rem';panel.appendChild(box)}
    return box;
  };

  const render=()=>{
    const box=ensurePanel();if(!box)return;
    const s=snapshot(),guide=suggestion(s);
    box.innerHTML=`<p class="memory-title">Pols vital · Homeòstasi</p><p class="memory-empty">${guide.text}</p><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.4rem;margin-top:.65rem;font-size:.78rem"><span>${s.living.length}<br><small>vius</small></span><span>${s.compost.length}<br><small>compost</small></span><span>${s.seeds.length}<br><small>llavors</small></span><span>${s.relevantRelations.length}<br><small>relacions pertinents</small></span></div><p class="homeostasis-state" style="margin:.7rem 0 0;color:var(--metal)">Estat: ${s.state} · densitat ${s.density.toFixed(2)}</p>`;
    if(guide.candidate){
      const button=document.createElement('button');button.type='button';button.className='grow-germ homeostasis-balance';button.textContent='Examinar abans de compostar';
      button.addEventListener('click',()=>{
        const output=document.getElementById('relation-output');
        if(output)output.innerHTML=`<strong>Homeòstasi</strong><br>«${label(guide.candidate)}» és una possibilitat, no una ordre. Revisa si encara sosté una diferència, una relació o una promesa abans de moure’l.`;
        try{window.dispatchEvent(new CustomEvent('animic:homeostasis-suggestion',{detail:{candidate:guide.candidate,reason:'prolonged-unrelated-latency',reversible:true,automatic:false}}))}catch{}
      });
      box.appendChild(button);
    }
  };

  const panel=document.getElementById('node-panel');if(!panel)return;
  window.addEventListener('animic:node-activated',()=>window.setTimeout(render,0));
  ['animic:metabolized','animic:canonicalized','animic:homeostasis-updated'].forEach(name=>window.addEventListener(name,()=>window.setTimeout(render,0)));
  window.addEventListener('resize',()=>window.setTimeout(render,0));
  window.addEventListener('storage',render);
  render();
})();
