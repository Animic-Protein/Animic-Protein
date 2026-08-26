(() => {
  'use strict';

  const css=document.createElement('link');css.rel='stylesheet';css.href='homeostasi-constitucional.css';document.head.appendChild(css);

  const KEYS={
    branches:'animic-protein-branches-v1',
    pressure:'animic-protein-branch-pressure-v1',
    homeo:'animic-protein-constitutional-homeostasis-v1'
  };

  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value,limit=24)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-limit)))}catch{}};

  const branchVersion=branch=>Math.max(1,Number(branch?.constitutionVersion)||1);
  const threshold=branch=>8+((branchVersion(branch)-1)*3);
  const maxRelief=branch=>Math.max(3,Math.floor(threshold(branch)*0.6));
  const rawPressure=id=>Math.max(0,Number(read(KEYS.pressure).find(p=>p.id===id)?.score)||0);

  const stateFor=branch=>{
    const old=read(KEYS.homeo).find(x=>x.id===branch?.id);
    return old||{id:branch?.id,relief:0,history:[],updatedAt:null};
  };

  const saveState=next=>{
    const list=read(KEYS.homeo);
    write(KEYS.homeo,[...list.filter(x=>x.id!==next.id),next],24);
    try{window.dispatchEvent(new CustomEvent('animic:homeostasis-updated',{detail:next}))}catch{}
  };

  const activeBranch=()=>{
    const id=document.querySelector('#living-map [data-node].is-active')?.dataset?.node;
    return read(KEYS.branches).find(b=>b.id===id)||null;
  };

  const modeInfo={
    absorb:{label:'Absorbeix',amount:2,note:'Reté part de la tensió sense alterar la llei.'},
    compensate:{label:'Compensa',amount:3,note:'Equilibra forces oposades abans de reformar la constitució.'},
    compost:{label:'Deriva al compost',amount:4,note:'Converteix tensió constitucional en residu disponible per a una futura relectura.'}
  };

  const apply=(branch,mode)=>{
    const info=modeInfo[mode];if(!branch||!info)return null;
    const old=stateFor(branch);
    const raw=rawPressure(branch.id);
    if(raw<=0)return old;
    const cap=maxRelief(branch);
    const before=Math.max(0,Number(old.relief)||0);
    const after=Math.min(cap,before+info.amount);
    const gained=after-before;
    if(gained<=0)return old;
    const event={
      id:`homeo-${Date.now().toString(36)}`,
      mode,
      label:info.label,
      amount:gained,
      rawPressure:raw,
      effectiveBefore:Math.max(0,raw-before),
      effectiveAfter:Math.max(0,raw-after),
      at:new Date().toISOString()
    };
    const next={...old,relief:after,history:[...(old.history||[]),event].slice(-12),updatedAt:event.at};
    saveState(next);
    render();
    return next;
  };

  const resetAfterMutation=event=>{
    const branch=event?.detail;if(!branch?.id)return;
    const old=stateFor(branch);
    if(!(Number(old.relief)||0))return;
    const now=new Date().toISOString();
    const reset={
      id:`homeo-${Date.now().toString(36)}`,
      mode:'reset',
      label:'Mutació constitucional',
      amount:-(Number(old.relief)||0),
      rawPressure:rawPressure(branch.id),
      effectiveBefore:Math.max(0,rawPressure(branch.id)-(Number(old.relief)||0)),
      effectiveAfter:rawPressure(branch.id),
      at:now
    };
    saveState({...old,relief:0,history:[...(old.history||[]),reset].slice(-12),updatedAt:now});
  };

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');if(!panel)return null;
    let box=panel.querySelector('.constitutional-homeostasis-panel');
    if(!box){box=document.createElement('div');box.className='constitutional-homeostasis-panel';panel.appendChild(box)}
    return box;
  };

  const render=()=>{
    const box=ensurePanel();if(!box)return;
    const branch=activeBranch();
    if(!branch){box.innerHTML='';return}
    const state=stateFor(branch);
    const raw=rawPressure(branch.id);
    const relief=Math.min(maxRelief(branch),Math.max(0,Number(state.relief)||0));
    const effective=Math.max(0,raw-relief);
    const limit=threshold(branch);

    box.innerHTML='<p class="memory-title">Homeòstasi constitucional</p>';

    const gauge=document.createElement('div');gauge.className='homeo-gauge';
    const a=document.createElement('div');a.innerHTML=`<strong>${raw}</strong><span>pressió bruta</span>`;
    const b=document.createElement('div');b.innerHTML=`<strong>−${relief}</strong><span>absorbida</span>`;
    const c=document.createElement('div');c.innerHTML=`<strong>${effective}</strong><span>efectiva / ${limit}</span>`;
    gauge.append(a,b,c);box.appendChild(gauge);

    const actions=document.createElement('div');actions.className='homeo-actions';
    Object.entries(modeInfo).forEach(([mode,info])=>{
      const button=document.createElement('button');
      button.type='button';button.className=`homeo-action mode-${mode}`;
      button.textContent=info.label;
      button.title=info.note;
      button.disabled=raw<=0||relief>=maxRelief(branch);
      button.addEventListener('click',()=>{
        const result=apply(branch,mode);
        if(relationOutput&&result){
          const currentRaw=rawPressure(branch.id);
          const currentRelief=Math.max(0,Number(result.relief)||0);
          relationOutput.innerHTML=`<strong>Homeòstasi constitucional</strong><br>${info.note}<br>Pressió efectiva: ${Math.max(0,currentRaw-currentRelief)} / ${threshold(branch)}.`;
        }
      });
      actions.appendChild(button);
    });
    box.appendChild(actions);

    const note=document.createElement('p');note.className='homeo-note';
    note.textContent=relief>=maxRelief(branch)
      ? 'Capacitat homeostàtica temporal esgotada. Si la pressió continua creixent, la branca haurà d’acceptar la mutació o transformar la seva activitat.'
      : 'La homeòstasi pot retardar una reforma constitucional, però no pot anul·lar indefinidament la pressió viva.';
    box.appendChild(note);

    if((state.history||[]).length){
      const details=document.createElement('details');details.className='homeo-history';
      const summary=document.createElement('summary');summary.textContent=`Memòria homeostàtica · ${state.history.length} moviments`;details.appendChild(summary);
      state.history.slice().reverse().forEach(event=>{
        const row=document.createElement('div');row.className='homeo-history-row';
        const strong=document.createElement('strong');strong.textContent=event.label||event.mode;
        const small=document.createElement('span');small.textContent=event.mode==='reset'?'buffer alliberat':`−${Math.abs(Number(event.amount)||0)} pressió`;
        row.append(strong,small);details.appendChild(row);
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
  window.addEventListener('animic:pressure-updated',render);
  window.addEventListener('animic:constitution-mutated',event=>{resetAfterMutation(event);window.setTimeout(render,0)});
  window.addEventListener('animic:branch-founded',render);
  window.addEventListener('storage',render);
  render();
})();