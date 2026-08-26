(() => {
  'use strict';

  const GERM_KEY='animic-protein-germina-v2';
  const SEED_KEY='animic-protein-seed-memory-v1';
  const METAB_KEY='animic-protein-metabolism-v1';

  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value,limit)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-limit)))}catch{}};
  const clean=(v,max=500)=>typeof v==='string'?v.replace(/[<>\u0000-\u001f\u007f]/g,'').trim().slice(0,max):'';
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};

  const composts=()=>read(GERM_KEY).filter(g=>g&&g.life==='compost');
  const label=g=>clean(g?.title||g?.id||'compost',90).replace(/^Llavor\s*·\s*/i,'');
  const metaboliteText=(a,b)=>{
    const uses=(Number(a.uses)||0)+(Number(b.uses)||0);
    const mode=uses%3;
    if(mode===0)return `Fermenta «${label(a)}» amb «${label(b)}»: conserva el conflicte entre totes dues formes i converteix-lo en una regla nova.`;
    if(mode===1)return `Empelta el rastre de «${label(a)}» dins «${label(b)}»: canvia una sola propietat i deixa que la resta del sistema s'hi adapti.`;
    return `Descompon «${label(a)}» i «${label(b)}» fins trobar-ne el mínim comú viu; torna'l a sembrar sense reconstruir les formes originals.`;
  };

  const metabolize=(a,b)=>{
    if(!a||!b||a.id===b.id)return null;
    const pair=[a.id,b.id].sort();
    const id=`metab-${hash(pair.join('|'))}`;
    const history=read(METAB_KEY);
    const prior=history.find(x=>x.id===id);
    if(prior)return prior;
    const now=new Date().toISOString();
    const seedId=`seed-${id}`;
    const text=clean(metaboliteText(a,b),500);
    const seed={id:seedId,text,source:`Metabolisme · ${label(a)} × ${label(b)}`,sourceId:'compost',createdAt:now,metabolismId:id,parentComposts:pair};
    const seeds=read(SEED_KEY);
    if(!seeds.some(s=>s.id===seedId))write(SEED_KEY,[...seeds,seed],12);
    const event={id,parents:pair,seedId,text,createdAt:now};
    write(METAB_KEY,[...history,event],24);
    return event;
  };

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');
    if(!panel)return null;
    let box=panel.querySelector('.metabolism-panel');
    if(!box){
      box=document.createElement('div');
      box.className='metabolism-panel';
      box.style.cssText='border-top:1px solid var(--line);margin-top:.9rem;padding-top:.9rem';
      panel.appendChild(box);
    }
    return box;
  };

  const render=()=>{
    const box=ensurePanel();if(!box)return;
    const list=composts();
    if(list.length<2){
      box.innerHTML='<p class="memory-title">Metabolisme</p><p class="memory-empty">Calen dos nodes en Compost perquè el Còdex pugui metabolitzar-los.</p>';
      return;
    }
    const recent=list.slice(-6);
    box.innerHTML='<p class="memory-title">Metabolisme</p><p class="memory-empty">Combina dos composts: el resultat no restaura el passat, produeix nutrient nou.</p><div class="metabolism-controls" style="display:grid;gap:.55rem;margin-top:.65rem"><select class="metab-a" aria-label="Primer compost"></select><select class="metab-b" aria-label="Segon compost"></select><button type="button" class="grow-germ metab-run">Metabolitza</button></div><p class="metab-output" aria-live="polite" style="color:var(--muted);line-height:1.45"></p>';
    const a=box.querySelector('.metab-a'),b=box.querySelector('.metab-b');
    [a,b].forEach(select=>{
      recent.forEach(g=>{const o=document.createElement('option');o.value=g.id;o.textContent=label(g);select.appendChild(o)});
    });
    if(recent.length>1)b.selectedIndex=1;
    box.querySelector('.metab-run')?.addEventListener('click',()=>{
      const ga=list.find(g=>g.id===a.value),gb=list.find(g=>g.id===b.value);
      const out=box.querySelector('.metab-output');
      if(!ga||!gb||ga.id===gb.id){if(out)out.textContent='Tria dos composts diferents.';return}
      const result=metabolize(ga,gb);
      if(!result)return;
      if(out)out.textContent=`Metabòlit creat: ${result.text}`;
      const dialog=document.getElementById('sembra');
      if(dialog&&typeof dialog.showModal==='function'&&!dialog.open)window.setTimeout(()=>dialog.showModal(),180);
    });
  };

  const observer=new MutationObserver(()=>window.setTimeout(render,0));
  const panel=document.getElementById('node-panel');
  if(panel)observer.observe(panel,{childList:true,subtree:true,characterData:true});
  window.addEventListener('storage',render);
  window.addEventListener('resize',()=>window.setTimeout(render,0));
  render();
})();
