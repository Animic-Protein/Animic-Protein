(() => {
  'use strict';

  const GERM_KEY='animic-protein-germina-v2';
  const SEED_KEY='animic-protein-seed-memory-v1';
  const METAB_KEY='animic-protein-metabolism-v1';
  const MEMORY_KEY='animic-protein-inter-nos-v2';
  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const clean=(v,max=180)=>typeof v==='string'?v.replace(/[<>\u0000-\u001f\u007f]/g,'').trim().slice(0,max):'';
  const titleOf=g=>clean(g?.title||g?.id||'node',100).replace(/^Llavor\s*·\s*/i,'');

  const trace=()=>{
    const activeId=document.querySelector('#living-map [data-node].is-active')?.dataset?.node;
    if(!activeId)return null;
    const germs=read(GERM_KEY),seeds=read(SEED_KEY),metabolism=read(METAB_KEY),relations=read(MEMORY_KEY);
    const germ=germs.find(g=>g.id===activeId);
    if(!germ)return {kind:'canonic',title:'Node canònic',lines:['Forma fundacional del Mapa Viu. No deriva d’una germinació local.']};

    const lines=[];
    if(germ.sourceSeedId){
      const seed=seeds.find(s=>s.id===germ.sourceSeedId);
      if(seed){
        lines.push(`Llavor mare: ${clean(seed.text,140)}`);
        if(seed.source)lines.push(`Origen declarat: ${clean(seed.source,120)}`);
        if(seed.metabolismId){
          const event=metabolism.find(m=>m.id===seed.metabolismId);
          if(event?.parents?.length){
            const names=event.parents.map(id=>titleOf(germs.find(g=>g.id===id))).filter(Boolean);
            if(names.length)lines.push(`Metabolisme: ${names.join(' × ')}`);
          }
        }
        if(seed.compostOriginId){
          const parent=germs.find(g=>g.id===seed.compostOriginId);
          if(parent)lines.push(`Retorn de compost: ${titleOf(parent)}`);
        }
      }
    } else if(germ.sourceRelationId){
      const relation=relations.find(r=>r.id===germ.sourceRelationId);
      if(relation)lines.push(`INTER NOS: ${clean(relation.a,70)} ↔ ${clean(relation.b,70)}`);
      else lines.push(`Origen relacional: ${clean(germ.sourceRelationId,120)}`);
    }

    lines.push(`Estat vital: ${clean(germ.life||'germen',40)}`);
    lines.push(`Relacions viscudes: ${Math.max(0,Number(germ.uses)||0)}`);
    if(germ.homeostasisAt)lines.push('Traça: homeòstasi');
    if(germ.compostReturnedAt)lines.push('Traça: nutrient retornat');

    return {kind:'germ',title:titleOf(germ),lines};
  };

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');
    if(!panel)return null;
    let box=panel.querySelector('.lineage-panel');
    if(!box){
      box=document.createElement('div');
      box.className='lineage-panel';
      box.style.cssText='border-top:1px solid var(--line);margin-top:.9rem;padding-top:.9rem';
      panel.appendChild(box);
    }
    return box;
  };

  const render=()=>{
    const box=ensurePanel();if(!box)return;
    const t=trace();if(!t){box.innerHTML='';return}
    box.innerHTML='<p class="memory-title">Memòria metabòlica · Genealogia</p>';
    const head=document.createElement('p');
    head.className='memory-empty';
    head.textContent=t.kind==='canonic'?'Arrel canònica':'Rastre viu de la forma activa';
    box.appendChild(head);
    const list=document.createElement('ol');
    list.style.cssText='margin:.65rem 0 0;padding-left:1.2rem;color:var(--muted);line-height:1.45;font-size:.84rem';
    t.lines.forEach(line=>{const li=document.createElement('li');li.textContent=line;list.appendChild(li)});
    box.appendChild(list);
  };

  const panel=document.getElementById('node-panel');
  if(!panel)return;
  const observer=new MutationObserver(()=>window.setTimeout(render,0));
  observer.observe(panel,{childList:true,subtree:true,characterData:true});
  panel.addEventListener('click',()=>window.setTimeout(render,0));
  window.addEventListener('resize',()=>window.setTimeout(render,0));
  window.addEventListener('storage',render);
  render();
})();
