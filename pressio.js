(() => {
  'use strict';

  const pressureCss=document.createElement('link');pressureCss.rel='stylesheet';pressureCss.href='pressio.css';document.head.appendChild(pressureCss);

  const KEYS={
    branches:'animic-protein-branches-v1',
    canons:'animic-protein-canon-local-v1',
    germs:'animic-protein-germina-v2',
    relations:'animic-protein-inter-nos-v2',
    seeds:'animic-protein-seed-memory-v1',
    metabolism:'animic-protein-metabolism-v1',
    pressure:'animic-protein-branch-pressure-v1'
  };

  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-24)))}catch{}};
  const clean=(v,max=140)=>typeof v==='string'?v.replace(/[<>\u0000-\u001f\u007f]/g,'').trim().slice(0,max):'';

  const branchMemberSets=()=>{
    const canons=read(KEYS.canons),germs=read(KEYS.germs);
    return read(KEYS.branches).map(branch=>{
      const canonIds=new Set(branch.members||[]);
      const germIds=new Set(
        germs.filter(g=>canonIds.has(g.canonicalId)||canonIds.has(g.id)).map(g=>g.id)
      );
      const labels=new Set(
        canons.filter(c=>canonIds.has(c.id)).map(c=>clean(c.title,100).toLowerCase()).filter(Boolean)
      );
      return {branch,canonIds,germIds,labels};
    });
  };

  const relationSignals=(sets,relations)=>{
    let relation=0,conflict=0,compost=0;
    relations.forEach(r=>{
      const a=sets.canonIds.has(r.aId),b=sets.canonIds.has(r.bId);
      if(!a&&!b)return;
      if(r.state==='emergent') conflict+=a&&b?3:2;
      else if(r.state==='compostada') compost+=2;
      else if(r.state==='sembrada') relation+=2;
      else relation+=1;
    });
    return {relation,conflict,compost};
  };

  const seedSignals=(sets,seeds)=>{
    let score=0;
    seeds.forEach(seed=>{
      const source=clean(seed.source,160).toLowerCase();
      const sourceId=clean(seed.sourceId,100);
      if(sets.canonIds.has(sourceId)||sets.germIds.has(sourceId)){score+=2;return}
      if([...sets.labels].some(label=>label&&source.includes(label)))score+=1;
    });
    return score;
  };

  const compostSignals=(sets,germs)=>{
    let score=0;
    germs.forEach(g=>{
      if(!sets.germIds.has(g.id))return;
      if(g.life==='compost')score+=3;
      if(g.compostReturnedAt)score+=1;
    });
    return score;
  };

  const metabolismSignals=(sets,events)=>{
    let score=0;
    events.forEach(event=>{
      const parents=Array.isArray(event.parents)?event.parents:[];
      const hits=parents.filter(id=>sets.germIds.has(id)).length;
      if(hits)score+=hits>=2?4:2;
      if(hits&&event.mutationLevel==='constitucional')score+=2;
    });
    return score;
  };

  const compute=()=>{
    const relations=read(KEYS.relations),seeds=read(KEYS.seeds),germs=read(KEYS.germs),metabolism=read(KEYS.metabolism);
    return branchMemberSets().map(sets=>{
      const rs=relationSignals(sets,relations);
      const seed=seedSignals(sets,seeds);
      const germCompost=compostSignals(sets,germs);
      const metabolic=metabolismSignals(sets,metabolism);
      const score=rs.relation+rs.conflict+rs.compost+seed+germCompost+metabolic;
      return {
        id:sets.branch.id,
        score,
        components:{
          relations:rs.relation,
          conflicts:rs.conflict,
          compost:rs.compost+germCompost,
          seeds:seed,
          metabolism:metabolic
        },
        calculatedAt:new Date().toISOString()
      };
    });
  };

  const publish=()=>{
    const pressure=compute();
    write(KEYS.pressure,pressure);
    try{window.dispatchEvent(new CustomEvent('animic:pressure-updated',{detail:pressure}))}catch{}
    render();
    return pressure;
  };

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');if(!panel)return null;
    let box=panel.querySelector('.pressure-panel');
    if(!box){box=document.createElement('div');box.className='pressure-panel';panel.appendChild(box)}
    return box;
  };

  const activeBranchId=()=>document.querySelector('#living-map [data-node].is-active')?.dataset?.node||null;

  const render=()=>{
    const box=ensurePanel();if(!box)return;
    const id=activeBranchId();
    const branch=read(KEYS.branches).find(b=>b.id===id);
    if(!branch){box.innerHTML='';return}
    const state=read(KEYS.pressure).find(p=>p.id===id)||compute().find(p=>p.id===id);
    if(!state){box.innerHTML='';return}

    box.innerHTML='<p class="memory-title">Pressió interna</p>';
    const total=document.createElement('div');total.className='pressure-total';
    const label=document.createElement('strong');label.textContent=String(state.score);
    const text=document.createElement('span');text.textContent='unitats de pressió viva';
    total.append(label,text);box.appendChild(total);

    const grid=document.createElement('div');grid.className='pressure-grid';
    const labels={relations:'Relacions',conflicts:'Conflictes',compost:'Compost',seeds:'Llavors',metabolism:'Metabolisme'};
    Object.entries(state.components).forEach(([key,value])=>{
      const item=document.createElement('div');item.className='pressure-item';
      const strong=document.createElement('strong');strong.textContent=String(value);
      const small=document.createElement('span');small.textContent=labels[key]||key;
      item.append(strong,small);grid.appendChild(item);
    });
    box.appendChild(grid);

    const note=document.createElement('p');note.className='pressure-note';
    note.textContent='La pressió no és una puntuació de qualitat: mesura activitat, fricció i transformació dins de la branca.';
    box.appendChild(note);
  };

  const panel=document.getElementById('node-panel');
  if(panel){
    const observer=new MutationObserver(()=>window.setTimeout(render,0));
    observer.observe(panel,{childList:true,subtree:true,characterData:true});
    panel.addEventListener('click',()=>window.setTimeout(render,0));
  }

  ['animic:metabolized','animic:canonicalized','animic:branch-founded','animic:constitution-mutated'].forEach(name=>window.addEventListener(name,()=>window.setTimeout(publish,0)));
  window.addEventListener('storage',publish);
  window.addEventListener('resize',()=>window.setTimeout(render,0));
  window.setInterval(publish,12000);
  publish();
})();