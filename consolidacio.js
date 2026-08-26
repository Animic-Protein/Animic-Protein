(() => {
  'use strict';

  const css=document.createElement('link');css.rel='stylesheet';css.href='consolidacio.css';document.head.appendChild(css);

  const KEYS={
    branches:'animic-protein-branches-v1',
    homeo:'animic-protein-constitutional-homeostasis-v1',
    consolidation:'animic-protein-constitutional-consolidation-v1',
    reconsolidation:'animic-protein-constitutional-reconsolidation-v1'
  };

  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value,limit=24)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-limit)))}catch{}};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

  const recencyWeights=[1,1,.8,.65,.5,.35,.25,.15,.1,.08,.05,.03];

  const weightedRecent=(items,predicate)=>{
    const recent=(items||[]).slice().reverse();
    return recent.reduce((sum,item,index)=>{
      if(!predicate(item))return sum;
      return sum+(recencyWeights[index]||.02);
    },0);
  };

  const consolidateBranch=branch=>{
    const homeo=read(KEYS.homeo).find(h=>h.id===branch.id)||{history:[]};

    const resilienceEvidence=weightedRecent(
      homeo.history,
      e=>e.mode&&e.mode!=='reset'&&(Number(e.amount)||0)>0
    );

    const sensitivityEvidence=weightedRecent(
      branch.constitutionHistory,
      v=>/pressió/i.test(String(v.reason||''))
    );

    const resilience=Math.floor(resilienceEvidence/2.2);
    const sensitization=Math.ceil(sensitivityEvidence);
    const recon=read(KEYS.reconsolidation).find(r=>r.id===branch.id)||{offset:0};
    const reconOffset=clamp(Number(recon.offset)||0,-2,2);
    const bias=clamp(resilience-sensitization+reconOffset,-2,2);

    const trait=bias>=2?'resilient'
      :bias===1?'resilient-lleu'
      :bias<=-2?'sensibilitzat'
      :bias===-1?'sensibilitzat-lleu'
      :'plàstic';

    return {
      id:branch.id,
      resilienceEvidence:Number(resilienceEvidence.toFixed(2)),
      sensitivityEvidence:Number(sensitivityEvidence.toFixed(2)),
      resilience,
      sensitization,
      reconOffset,
      bias,
      trait,
      updatedAt:new Date().toISOString()
    };
  };

  const compute=()=>read(KEYS.branches).map(consolidateBranch);

  const publish=()=>{
    const states=compute();
    write(KEYS.consolidation,states,24);
    try{window.dispatchEvent(new CustomEvent('animic:consolidation-updated',{detail:states}))}catch{}
    render();
    return states;
  };

  const activeBranch=()=>{
    const id=document.querySelector('#living-map [data-node].is-active')?.dataset?.node;
    return read(KEYS.branches).find(b=>b.id===id)||null;
  };

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');if(!panel)return null;
    let box=panel.querySelector('.constitutional-consolidation-panel');
    if(!box){box=document.createElement('div');box.className='constitutional-consolidation-panel';panel.appendChild(box)}
    return box;
  };

  const traitLabel={
    resilient:'Resiliència consolidada',
    'resilient-lleu':'Resiliència emergent',
    sensibilitzat:'Sensibilització consolidada',
    'sensibilitzat-lleu':'Sensibilització emergent',
    plàstic:'Plasticitat oberta'
  };

  const render=()=>{
    const box=ensurePanel();if(!box)return;
    const branch=activeBranch();
    if(!branch){box.innerHTML='';return}
    const state=read(KEYS.consolidation).find(x=>x.id===branch.id)||consolidateBranch(branch);

    box.innerHTML='<p class="memory-title">Consolidació constitucional</p>';

    const badge=document.createElement('div');badge.className='consolidation-badge';
    badge.textContent=traitLabel[state.trait]||state.trait;
    box.appendChild(badge);

    const grid=document.createElement('div');grid.className='consolidation-grid';

    const r=document.createElement('div');
    const rs=document.createElement('strong');rs.textContent=String(state.resilienceEvidence);
    const rl=document.createElement('span');rl.textContent='memòria resilient';
    r.append(rs,rl);

    const s=document.createElement('div');
    const ss=document.createElement('strong');ss.textContent=String(state.sensitivityEvidence);
    const sl=document.createElement('span');sl.textContent='memòria sensible';
    s.append(ss,sl);

    const b=document.createElement('div');
    const bs=document.createElement('strong');bs.textContent=(state.bias>0?'+':'')+String(state.bias);
    const bl=document.createElement('span');bl.textContent=state.reconOffset?'biaix + reconsolidació':'biaix consolidat';
    b.append(bs,bl);

    grid.append(r,s,b);box.appendChild(grid);

    const note=document.createElement('p');note.className='consolidation-note';
    note.textContent='Els episodis recents pesen més que els antics. La memòria constitucional no s’esborra de cop: perd força gradualment si no és reforçada.';
    box.appendChild(note);
  };

  const panel=document.getElementById('node-panel');
  if(panel)window.addEventListener('animic:node-activated',()=>window.setTimeout(render,0));

  ['animic:homeostasis-updated','animic:constitution-mutated','animic:branch-founded','animic:reconsolidation-updated'].forEach(name=>window.addEventListener(name,()=>window.setTimeout(publish,0)));
  window.addEventListener('storage',publish);
  render();
  publish();
})();