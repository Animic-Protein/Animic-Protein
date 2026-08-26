(() => {
  'use strict';

  const css=document.createElement('link');css.rel='stylesheet';css.href='allostasi.css';document.head.appendChild(css);

  const KEYS={
    branches:'animic-protein-branches-v1',
    homeo:'animic-protein-constitutional-homeostasis-v1',
    allostasis:'animic-protein-constitutional-allostasis-v1',
    consolidation:'animic-protein-constitutional-consolidation-v1',
    resonance:'animic-protein-constitutional-resonance-v1'
  };

  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value,limit=24)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-limit)))}catch{}};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const versionOf=branch=>Math.max(1,Number(branch?.constitutionVersion)||1);
  const baseThreshold=branch=>8+((versionOf(branch)-1)*3);

  const adaptationFor=branch=>{
    const homeo=read(KEYS.homeo).find(h=>h.id===branch.id)||{history:[]};
    const successful=(homeo.history||[]).filter(e=>e.mode&&e.mode!=='reset'&&(Number(e.amount)||0)>0).length;
    const pressureMutations=(branch.constitutionHistory||[]).filter(v=>/pressió/i.test(String(v.reason||''))).length;
    const consolidated=read(KEYS.consolidation).find(c=>c.id===branch.id);
    const resilience=consolidated?Math.max(0,Number(consolidated.resilience)||0):Math.floor(successful/3);
    const sensitization=consolidated?Math.max(0,Number(consolidated.sensitization)||0):pressureMutations;
    const ownAdjustment=consolidated?clamp(Number(consolidated.bias)||0,-2,2):clamp(resilience-sensitization,-2,2);
    const resonance=read(KEYS.resonance).find(r=>r.id===branch.id)||{influence:0};
    const relationalInfluence=clamp(Number(resonance.influence)||0,-1,1);
    const adjustment=clamp(ownAdjustment+relationalInfluence,-2,2);
    return {
      id:branch.id,
      adjustment,
      ownAdjustment,
      relationalInfluence,
      resilience,
      sensitization,
      successfulHomeostasis:successful,
      pressureMutations,
      base:baseThreshold(branch),
      adapted:Math.max(4,baseThreshold(branch)+adjustment),
      updatedAt:new Date().toISOString()
    };
  };

  const compute=()=>read(KEYS.branches).map(adaptationFor);

  const publish=()=>{
    const states=compute();
    write(KEYS.allostasis,states,24);
    try{window.dispatchEvent(new CustomEvent('animic:allostasis-updated',{detail:states}))}catch{}
    render();
    return states;
  };

  const activeBranch=()=>{
    const id=document.querySelector('#living-map [data-node].is-active')?.dataset?.node;
    return read(KEYS.branches).find(b=>b.id===id)||null;
  };

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');if(!panel)return null;
    let box=panel.querySelector('.constitutional-allostasis-panel');
    if(!box){box=document.createElement('div');box.className='constitutional-allostasis-panel';panel.appendChild(box)}
    return box;
  };

  const render=()=>{
    const box=ensurePanel();if(!box)return;
    const branch=activeBranch();
    if(!branch){box.innerHTML='';return}
    const state=read(KEYS.allostasis).find(x=>x.id===branch.id)||adaptationFor(branch);

    box.innerHTML='<p class="memory-title">Al·lòstasi constitucional</p>';

    const row=document.createElement('div');row.className='allostasis-row';
    const base=document.createElement('div');
    const bStrong=document.createElement('strong');bStrong.textContent=String(state.base);
    const bSpan=document.createElement('span');bSpan.textContent='llindar base';
    base.append(bStrong,bSpan);

    const adjust=document.createElement('div');
    const aStrong=document.createElement('strong');
    aStrong.textContent=(state.adjustment>0?'+':'')+String(state.adjustment);
    const aSpan=document.createElement('span');aSpan.textContent=state.relationalInfluence?'adaptació + ressonància':'adaptació';
    adjust.append(aStrong,aSpan);

    const adapted=document.createElement('div');
    const adStrong=document.createElement('strong');adStrong.textContent=String(state.adapted);
    const adSpan=document.createElement('span');adSpan.textContent='llindar après';
    adapted.append(adStrong,adSpan);
    row.append(base,adjust,adapted);box.appendChild(row);

    const memory=document.createElement('div');memory.className='allostasis-memory';
    const r=document.createElement('span');r.textContent='Resiliència: '+state.resilience;
    const s=document.createElement('span');s.textContent='Sensibilització: '+state.sensitization;
    const x=document.createElement('span');x.textContent='Ressonància: '+((state.relationalInfluence>0?'+':'')+state.relationalInfluence);
    memory.append(r,s,x);box.appendChild(memory);

    const note=document.createElement('p');note.className='allostasis-note';
    note.textContent=state.adjustment>0
      ? 'La branca ha après a suportar més tensió abans de reformar la seva constitució.'
      : state.adjustment<0
        ? 'La branca s’ha sensibilitzat: experiències prèvies de pressió fan que reaccioni abans.'
        : 'Encara no hi ha una adaptació constitucional neta: el llindar es manté en el seu valor base.';
    box.appendChild(note);
  };

  const panel=document.getElementById('node-panel');
  if(panel)window.addEventListener('animic:node-activated',()=>window.setTimeout(render,0));

  ['animic:homeostasis-updated','animic:constitution-mutated','animic:branch-founded','animic:consolidation-updated','animic:resonance-updated'].forEach(name=>window.addEventListener(name,()=>window.setTimeout(publish,0)));
  window.addEventListener('storage',publish);
  render();
  publish();
})();