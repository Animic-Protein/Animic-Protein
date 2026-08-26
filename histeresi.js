(() => {
  'use strict';

  const css=document.createElement('link');css.rel='stylesheet';css.href='histeresi.css';document.head.appendChild(css);

  const KEYS={
    branches:'animic-protein-branches-v1',
    pressure:'animic-protein-branch-pressure-v1',
    homeo:'animic-protein-constitutional-homeostasis-v1',
    hysteresis:'animic-protein-constitutional-hysteresis-v1',
    allostasis:'animic-protein-constitutional-allostasis-v1'
  };
  const REQUIRED_STREAK=3;
  const REFRACTORY_CYCLES=2;

  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value,limit=24)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-limit)))}catch{}};
  const versionOf=branch=>Math.max(1,Number(branch?.constitutionVersion)||1);
  const threshold=branch=>{
    const base=8+((versionOf(branch)-1)*3);
    const adaptation=read(KEYS.allostasis).find(a=>a.id===branch?.id);
    return Math.max(4,base+(Number(adaptation?.adjustment)||0));
  };
  const rawPressure=id=>Math.max(0,Number(read(KEYS.pressure).find(p=>p.id===id)?.score)||0);
  const relief=id=>Math.max(0,Number(read(KEYS.homeo).find(h=>h.id===id)?.relief)||0);
  const effective=id=>Math.max(0,rawPressure(id)-relief(id));

  const stateFor=branch=>{
    const old=read(KEYS.hysteresis).find(x=>x.id===branch?.id);
    return old||{
      id:branch?.id,
      streak:0,
      refractory:0,
      version:versionOf(branch),
      history:[],
      updatedAt:null
    };
  };

  const saveState=next=>{
    const list=read(KEYS.hysteresis);
    write(KEYS.hysteresis,[...list.filter(x=>x.id!==next.id),next],24);
    try{window.dispatchEvent(new CustomEvent('animic:hysteresis-updated',{detail:next}))}catch{}
  };

  const sampleBranch=branch=>{
    const old=stateFor(branch);
    const currentVersion=versionOf(branch);
    let streak=Math.max(0,Number(old.streak)||0);
    let refractory=Math.max(0,Number(old.refractory)||0);

    if(old.version!==currentVersion){
      streak=0;
      refractory=REFRACTORY_CYCLES;
    }

    const value=effective(branch.id);
    const limit=threshold(branch);
    const above=value>=limit;

    if(refractory>0){
      refractory-=1;
      streak=0;
    }else if(above){
      streak=Math.min(REQUIRED_STREAK,streak+1);
    }else{
      streak=Math.max(0,streak-1);
    }

    const now=new Date().toISOString();
    const event={
      at:now,
      effective:value,
      threshold:limit,
      above,
      streak,
      refractory,
      version:currentVersion
    };
    const next={
      ...old,
      id:branch.id,
      streak,
      refractory,
      version:currentVersion,
      history:[...(old.history||[]),event].slice(-12),
      updatedAt:now
    };
    saveState(next);
    return next;
  };

  const sampleAll=()=>{
    const states=read(KEYS.branches).map(sampleBranch);
    render();
    return states;
  };

  const activeBranch=()=>{
    const id=document.querySelector('#living-map [data-node].is-active')?.dataset?.node;
    return read(KEYS.branches).find(b=>b.id===id)||null;
  };

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');if(!panel)return null;
    let box=panel.querySelector('.constitutional-hysteresis-panel');
    if(!box){box=document.createElement('div');box.className='constitutional-hysteresis-panel';panel.appendChild(box)}
    return box;
  };

  const render=()=>{
    const box=ensurePanel();if(!box)return;
    const branch=activeBranch();
    if(!branch){box.innerHTML='';return}
    const state=stateFor(branch);
    const value=effective(branch.id),limit=threshold(branch);
    box.innerHTML='<p class="memory-title">Histèresi constitucional</p>';

    const row=document.createElement('div');row.className='hysteresis-row';
    const persistence=document.createElement('div');
    const pStrong=document.createElement('strong');pStrong.textContent=`${state.streak}/${REQUIRED_STREAK}`;
    const pSpan=document.createElement('span');pSpan.textContent='persistència';
    persistence.append(pStrong,pSpan);

    const pressure=document.createElement('div');
    const prStrong=document.createElement('strong');prStrong.textContent=`${value}/${limit}`;
    const prSpan=document.createElement('span');prSpan.textContent='pressió efectiva';
    pressure.append(prStrong,prSpan);

    const refractory=document.createElement('div');
    const rStrong=document.createElement('strong');rStrong.textContent=String(state.refractory||0);
    const rSpan=document.createElement('span');rSpan.textContent='cicles refractaris';
    refractory.append(rStrong,rSpan);

    row.append(persistence,pressure,refractory);box.appendChild(row);

    const meter=document.createElement('div');meter.className='hysteresis-meter';
    for(let i=0;i<REQUIRED_STREAK;i++){
      const dot=document.createElement('span');
      if(i<state.streak)dot.classList.add('is-on');
      meter.appendChild(dot);
    }
    box.appendChild(meter);

    const note=document.createElement('p');note.className='hysteresis-note';
    note.textContent=state.refractory>0
      ? 'La branca és en període refractari després d’una mutació: la pressió encara no pot forçar una nova reforma.'
      : state.streak>=REQUIRED_STREAK
        ? 'La pressió ha persistit prou. La via de mutació per pressió queda habilitada.'
        : 'Un pic puntual no basta: la pressió ha de mantenir-se en diversos cicles abans de poder alterar la constitució.';
    box.appendChild(note);
  };

  const panel=document.getElementById('node-panel');
  if(panel){
    const observer=new MutationObserver(()=>window.setTimeout(render,0));
    observer.observe(panel,{childList:true,subtree:true,characterData:true});
    panel.addEventListener('click',()=>window.setTimeout(render,0));
  }

  window.addEventListener('animic:pressure-updated',()=>window.setTimeout(sampleAll,0));
  window.addEventListener('animic:homeostasis-updated',()=>window.setTimeout(sampleAll,0));
  window.addEventListener('animic:constitution-mutated',()=>window.setTimeout(sampleAll,0));
  window.addEventListener('animic:branch-founded',()=>window.setTimeout(sampleAll,0));
  window.addEventListener('animic:allostasis-updated',()=>window.setTimeout(sampleAll,0));
  window.addEventListener('storage',render);
  render();
})();