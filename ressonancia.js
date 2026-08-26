(() => {
  'use strict';

  const css=document.createElement('link');css.rel='stylesheet';css.href='ressonancia.css';document.head.appendChild(css);

  const KEYS={
    branches:'animic-protein-branches-v1',
    relations:'animic-protein-inter-nos-v2',
    consolidation:'animic-protein-constitutional-consolidation-v1',
    resonance:'animic-protein-constitutional-resonance-v1'
  };

  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value,limit=24)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-limit)))}catch{}};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const weightFor=state=>({canonica:1,sembrada:.75,emergent:.5,compostada:.25}[state]||.5);

  const computeBranch=branch=>{
    const branchIds=new Set(read(KEYS.branches).map(b=>b.id));
    const consolidations=read(KEYS.consolidation);
    const relations=read(KEYS.relations).filter(r=>{
      const a=r.aId===branch.id&&branchIds.has(r.bId);
      const b=r.bId===branch.id&&branchIds.has(r.aId);
      return a||b;
    });

    const signals=relations.map(r=>{
      const otherId=r.aId===branch.id?r.bId:r.aId;
      const other=consolidations.find(c=>c.id===otherId);
      const bias=clamp(Number(other?.bias)||0,-2,2);
      const weight=weightFor(r.state);
      return {
        relationId:r.id,
        otherId,
        state:r.state||'emergent',
        weight,
        sourceBias:bias,
        signal:Math.sign(bias)*weight
      };
    }).filter(s=>s.sourceBias!==0);

    const raw=signals.reduce((sum,s)=>sum+s.signal,0);
    const influence=raw>=1.25?1:raw<=-1.25?-1:0;

    return {
      id:branch.id,
      raw:Number(raw.toFixed(2)),
      influence,
      signals,
      updatedAt:new Date().toISOString()
    };
  };

  const compute=()=>read(KEYS.branches).map(computeBranch);

  const publish=()=>{
    const states=compute();
    write(KEYS.resonance,states,24);
    try{window.dispatchEvent(new CustomEvent('animic:resonance-updated',{detail:states}))}catch{}
    render();
    return states;
  };

  const activeBranch=()=>{
    const id=document.querySelector('#living-map [data-node].is-active')?.dataset?.node;
    return read(KEYS.branches).find(b=>b.id===id)||null;
  };

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');if(!panel)return null;
    let box=panel.querySelector('.constitutional-resonance-panel');
    if(!box){box=document.createElement('div');box.className='constitutional-resonance-panel';panel.appendChild(box)}
    return box;
  };

  const branchTitle=id=>{
    const branch=read(KEYS.branches).find(b=>b.id===id);
    return branch?.title||id;
  };

  const render=()=>{
    const box=ensurePanel();if(!box)return;
    const branch=activeBranch();
    if(!branch){box.innerHTML='';return}
    const state=read(KEYS.resonance).find(x=>x.id===branch.id)||computeBranch(branch);

    box.innerHTML='<p class="memory-title">Ressonància constitucional</p>';

    const summary=document.createElement('div');summary.className='resonance-summary';
    const a=document.createElement('div');
    const as=document.createElement('strong');as.textContent=(state.raw>0?'+':'')+String(state.raw);
    const al=document.createElement('span');al.textContent='camp relacional';
    a.append(as,al);

    const b=document.createElement('div');
    const bs=document.createElement('strong');bs.textContent=(state.influence>0?'+':'')+String(state.influence);
    const bl=document.createElement('span');bl.textContent='influència efectiva';
    b.append(bs,bl);
    summary.append(a,b);box.appendChild(summary);

    const note=document.createElement('p');note.className='resonance-note';
    note.textContent=state.influence>0
      ? 'Les branques relacionades transmeten un senyal net de resiliència.'
      : state.influence<0
        ? 'Les branques relacionades transmeten un senyal net de sensibilització.'
        : state.signals.length
          ? 'Hi ha influència relacional, però encara no és prou coherent per alterar el llindar après.'
          : 'Aquesta branca encara no té cap relació INTER NOS amb altres branques consagrades.';
    box.appendChild(note);

    if(state.signals.length){
      const details=document.createElement('details');details.className='resonance-signals';
      const sum=document.createElement('summary');sum.textContent='Senyals inter-branques · '+state.signals.length;details.appendChild(sum);
      state.signals.forEach(signal=>{
        const row=document.createElement('div');row.className='resonance-signal';
        const left=document.createElement('strong');left.textContent=branchTitle(signal.otherId);
        const right=document.createElement('span');right.textContent=(signal.signal>0?'+':'')+signal.signal.toFixed(2)+' · '+signal.state;
        row.append(left,right);details.appendChild(row);
      });
      box.appendChild(details);
    }
  };

  const panel=document.getElementById('node-panel');
  if(panel){
    const observer=new MutationObserver(()=>window.setTimeout(render,0));
    observer.observe(panel,{childList:true,subtree:true,characterData:true});
    panel.addEventListener('click',()=>window.setTimeout(render,0));
  }

  ['animic:consolidation-updated','animic:branch-founded','animic:constitution-mutated'].forEach(name=>window.addEventListener(name,()=>window.setTimeout(publish,0)));
  window.addEventListener('storage',publish);
  window.addEventListener('resize',()=>window.setTimeout(render,0));
  render();
  publish();
})();