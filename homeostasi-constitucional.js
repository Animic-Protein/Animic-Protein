(() => {
  'use strict';

  const css=document.createElement('link');css.rel='stylesheet';css.href='homeostasi-constitucional.css';document.head.appendChild(css);
  const KEYS={branches:'animic-protein-branches-v1',pressure:'animic-protein-branch-pressure-v1',homeo:'animic-protein-constitutional-homeostasis-v1'};
  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value,limit=24)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-limit)))}catch{}};
  const branchVersion=b=>Math.max(1,Number(b?.constitutionVersion)||1);
  const threshold=b=>8+((branchVersion(b)-1)*3);
  const interventionFloor=b=>Math.max(3,Math.ceil(threshold(b)*.5));
  const maxRelief=b=>Math.max(2,Math.floor(threshold(b)*.4));
  const pressureState=id=>read(KEYS.pressure).find(p=>p.id===id)||{score:0,components:{}};
  const stateFor=b=>read(KEYS.homeo).find(x=>x.id===b?.id)||{id:b?.id,relief:0,history:[],pressureBasis:0,updatedAt:null};
  const saveState=next=>{const list=read(KEYS.homeo);write(KEYS.homeo,[...list.filter(x=>x.id!==next.id),next],24);try{window.dispatchEvent(new CustomEvent('animic:homeostasis-updated',{detail:next}))}catch{}};
  const activeBranch=()=>{const id=document.querySelector('#living-map [data-node].is-active')?.dataset?.node;return read(KEYS.branches).find(b=>b.id===id)||null};
  const modeInfo={absorb:{label:'Absorbeix',amount:1,note:'Dona temps a la branca sense negar la tensió.'},compensate:{label:'Compensa',amount:2,note:'Redueix temporalment una tensió prou madura per poder-la observar.'},compost:{label:'Deriva al compost',amount:2,note:'Desvia part de la tensió cap a relectura, sense reformar encara la constitució.'}};
  const meaningfulTension=components=>(Number(components.conflicts)||0)+(Number(components.metabolism)||0)+(Number(components.compost)||0)>0;

  const contextualState=branch=>{
    const rawState=pressureState(branch.id),raw=Math.max(0,Number(rawState.score)||0),old=stateFor(branch),components=rawState.components||{};
    const basis=Math.max(0,Number(old.pressureBasis)||0),drift=Math.abs(raw-basis);
    const stale=basis>0&&drift>=Math.max(3,Math.ceil(basis*.35));
    const relief=stale?0:Math.min(maxRelief(branch),Math.max(0,Number(old.relief)||0));
    const meaningful=meaningfulTension(components);
    return {rawState,components,raw,old,relief,stale,meaningful,effective:Math.max(0,raw-relief),limit:threshold(branch),floor:interventionFloor(branch)};
  };

  const apply=(branch,mode)=>{
    const info=modeInfo[mode];if(!branch||!info)return null;
    const s=contextualState(branch);if(s.raw<s.floor||!s.meaningful||s.stale)return s.old;
    const before=s.relief,after=Math.min(maxRelief(branch),before+info.amount),gained=after-before;if(gained<=0)return s.old;
    const now=new Date().toISOString();
    const event={id:`homeo-${Date.now().toString(36)}`,mode,label:info.label,amount:gained,rawPressure:s.raw,effectiveBefore:Math.max(0,s.raw-before),effectiveAfter:Math.max(0,s.raw-after),pressureBasis:s.raw,at:now};
    const next={...s.old,relief:after,pressureBasis:s.raw,history:[...(s.old.history||[]),event].slice(-12),updatedAt:now};saveState(next);render();return next;
  };

  const reobserve=branch=>{
    const s=contextualState(branch),now=new Date().toISOString();
    const event={id:`homeo-${Date.now().toString(36)}`,mode:'reobserve',label:'Reescolta',amount:-(Number(s.old.relief)||0),rawPressure:s.raw,effectiveBefore:s.effective,effectiveAfter:s.raw,pressureBasis:s.raw,at:now};
    const next={...s.old,relief:0,pressureBasis:s.raw,history:[...(s.old.history||[]),event].slice(-12),updatedAt:now};saveState(next);render();return next;
  };

  const resetAfterMutation=event=>{
    const branch=event?.detail;if(!branch?.id)return;const old=stateFor(branch);if(!(Number(old.relief)||0))return;
    const raw=Math.max(0,Number(pressureState(branch.id).score)||0),now=new Date().toISOString();
    const reset={id:`homeo-${Date.now().toString(36)}`,mode:'reset',label:'Mutació constitucional',amount:-(Number(old.relief)||0),rawPressure:raw,effectiveBefore:Math.max(0,raw-(Number(old.relief)||0)),effectiveAfter:raw,pressureBasis:raw,at:now};
    saveState({...old,relief:0,pressureBasis:raw,history:[...(old.history||[]),reset].slice(-12),updatedAt:now});
  };

  const ensurePanel=()=>{const panel=document.getElementById('node-panel');if(!panel)return null;let box=panel.querySelector('.constitutional-homeostasis-panel');if(!box){box=document.createElement('div');box.className='constitutional-homeostasis-panel';panel.appendChild(box)}return box};
  const render=()=>{
    const box=ensurePanel();if(!box)return;const branch=activeBranch();if(!branch){box.innerHTML='';return}
    const s=contextualState(branch);
    box.innerHTML='<p class="memory-title">Homeòstasi constitucional</p>';
    const gauge=document.createElement('div');gauge.className='homeo-gauge';
    [[''+s.raw,'pressió viva'],['−'+s.relief,'alleujament temporal'],[''+s.effective,`efectiva / ${s.limit}`]].forEach(([v,l])=>{const d=document.createElement('div');d.innerHTML=`<strong>${v}</strong><span>${l}</span>`;gauge.appendChild(d)});box.appendChild(gauge);
    const signal=document.createElement('p');signal.className='homeo-note';
    signal.textContent=s.raw<s.floor?'Encara no hi ha prou pressió per intervenir. Homeòstasi observa.':s.stale?'La pressió ha canviat prou perquè l’alleujament anterior deixi de ser vàlid. Reescolta abans d’actuar.':!s.meaningful?'La pressió és activitat acumulada sense fricció, metabolisme o retorn al Compost. Homeòstasi no intervé.':'Hi ha tensió significativa: es pot crear marge temporal sense ocultar-la.';box.appendChild(signal);
    const actions=document.createElement('div');actions.className='homeo-actions';
    if(s.stale){const button=document.createElement('button');button.type='button';button.className='homeo-action mode-absorb';button.textContent='Reescolta';button.title='Descarta l’alleujament antic i pren la pressió actual com a nou context.';button.addEventListener('click',()=>reobserve(branch));actions.appendChild(button)}
    else Object.entries(modeInfo).forEach(([mode,info])=>{const button=document.createElement('button');button.type='button';button.className=`homeo-action mode-${mode}`;button.textContent=info.label;button.title=info.note;button.disabled=s.raw<s.floor||!s.meaningful||s.relief>=maxRelief(branch);button.addEventListener('click',()=>{const result=apply(branch,mode),out=document.getElementById('relation-output');if(out&&result)out.innerHTML=`<strong>Homeòstasi constitucional</strong><br>${info.note}<br>L’alleujament és temporal i només val mentre la pressió mantingui el mateix context.`});actions.appendChild(button)});box.appendChild(actions);
    const note=document.createElement('p');note.className='homeo-note';note.textContent='Homeòstasi no esborra pressió ni evita la mutació: només crea marge quan hi ha tensió significativa, i sempre de manera temporal, contextual i reversible.';box.appendChild(note);
    if((s.old.history||[]).length){const details=document.createElement('details');details.className='homeo-history';const summary=document.createElement('summary');summary.textContent=`Memòria homeostàtica · ${s.old.history.length} moviments`;details.appendChild(summary);s.old.history.slice().reverse().forEach(e=>{const row=document.createElement('div');row.className='homeo-history-row';row.innerHTML=`<strong>${e.label||e.mode}</strong><span>${e.mode==='reset'||e.mode==='reobserve'?'buffer alliberat':`−${Math.abs(Number(e.amount)||0)} pressió · base ${e.pressureBasis??e.rawPressure??'—'}`}</span>`;details.appendChild(row)});box.appendChild(details)}
  };
  const panel=document.getElementById('node-panel');if(panel)window.addEventListener('animic:node-activated',()=>window.setTimeout(render,0));
  window.addEventListener('animic:pressure-updated',render);window.addEventListener('animic:constitution-mutated',event=>{resetAfterMutation(event);window.setTimeout(render,0)});window.addEventListener('animic:branch-founded',render);window.addEventListener('storage',render);render();
})();
