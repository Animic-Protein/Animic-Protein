(() => {
  'use strict';

  const css=document.createElement('link');css.rel='stylesheet';css.href='reconsolidacio.css';document.head.appendChild(css);

  const KEYS={
    branches:'animic-protein-branches-v1',
    homeo:'animic-protein-constitutional-homeostasis-v1',
    consolidation:'animic-protein-constitutional-consolidation-v1',
    reconsolidation:'animic-protein-constitutional-reconsolidation-v1'
  };

  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value,limit=24)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-limit)))}catch{}};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

  const activeBranch=()=>{
    const id=document.querySelector('#living-map [data-node].is-active')?.dataset?.node;
    return read(KEYS.branches).find(b=>b.id===id)||null;
  };

  const stateFor=branch=>{
    const old=read(KEYS.reconsolidation).find(x=>x.id===branch?.id);
    return old||{id:branch?.id,offset:0,history:[],updatedAt:null};
  };

  const latestHomeostasis=branch=>{
    const h=read(KEYS.homeo).find(x=>x.id===branch.id);
    return (h?.history||[]).slice().reverse().find(e=>e.mode&&e.mode!=='reset'&&(Number(e.amount)||0)>0)||null;
  };

  const latestPressureMutation=branch=>{
    return (branch.constitutionHistory||[]).slice().reverse().find(v=>/pressió/i.test(String(v.reason||'')))||null;
  };

  const contradictionFor=branch=>{
    const consolidated=read(KEYS.consolidation).find(c=>c.id===branch.id);
    if(!consolidated)return null;
    const trait=String(consolidated.trait||'');
    const homeo=latestHomeostasis(branch);
    const mutation=latestPressureMutation(branch);
    const homeoTime=homeo?.at?Date.parse(homeo.at):0;
    const mutationTime=mutation?.archivedAt?Date.parse(mutation.archivedAt):0;

    if(trait.startsWith('sensibilitzat')&&homeo&&homeoTime>=mutationTime){
      return {direction:1,label:'Evidència resilient nova',reason:'La branca, tot i estar sensibilitzada, ha absorbit una tensió recent sense reformar-se.'};
    }
    if(trait.startsWith('resilient')&&mutation&&mutationTime>=homeoTime){
      return {direction:-1,label:'Evidència sensible nova',reason:'La branca, tot i ser resilient, ha necessitat una reforma recent provocada per pressió.'};
    }
    return null;
  };

  const reconsolidate=branch=>{
    const contradiction=contradictionFor(branch);if(!branch||!contradiction)return null;
    const old=stateFor(branch);
    const now=new Date().toISOString();
    const nextOffset=clamp((Number(old.offset)||0)+contradiction.direction,-2,2);
    const event={
      at:now,
      direction:contradiction.direction,
      label:contradiction.label,
      reason:contradiction.reason,
      offsetBefore:Number(old.offset)||0,
      offsetAfter:nextOffset
    };
    const next={...old,offset:nextOffset,history:[...(old.history||[]),event].slice(-10),updatedAt:now};
    const list=read(KEYS.reconsolidation);
    write(KEYS.reconsolidation,[...list.filter(x=>x.id!==branch.id),next],24);
    try{window.dispatchEvent(new CustomEvent('animic:reconsolidation-updated',{detail:next}))}catch{}
    render();
    return next;
  };

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');if(!panel)return null;
    let box=panel.querySelector('.constitutional-reconsolidation-panel');
    if(!box){box=document.createElement('div');box.className='constitutional-reconsolidation-panel';panel.appendChild(box)}
    return box;
  };

  const render=()=>{
    const box=ensurePanel();if(!box)return;
    const branch=activeBranch();
    if(!branch){box.innerHTML='';return}
    const state=stateFor(branch);
    const contradiction=contradictionFor(branch);

    box.innerHTML='<p class="memory-title">Reconsolidació constitucional</p>';

    const status=document.createElement('p');status.className='reconsolidation-status';
    status.textContent=contradiction
      ? contradiction.reason
      : 'No hi ha cap discrepància prou clara entre la memòria consolidada i l’experiència recent.';
    box.appendChild(status);

    const meter=document.createElement('div');meter.className='reconsolidation-meter';
    const strong=document.createElement('strong');
    strong.textContent=(state.offset>0?'+':'')+String(state.offset||0);
    const span=document.createElement('span');span.textContent='correcció reconsolidada';
    meter.append(strong,span);box.appendChild(meter);

    const button=document.createElement('button');
    button.type='button';button.className='grow-germ reconsolidate-action';
    button.textContent=contradiction?'Reconsolidar memòria':'Memòria estable';
    button.disabled=!contradiction;
    button.addEventListener('click',()=>{
      const current=activeBranch(),next=reconsolidate(current);
      if(relationOutput&&next){
        relationOutput.innerHTML='<strong>Reconsolidació</strong><br>La memòria consolidada s’ha reobert i ha incorporat evidència nova sense esborrar la traça anterior.';
      }
    });
    box.appendChild(button);

    if((state.history||[]).length){
      const details=document.createElement('details');details.className='reconsolidation-history';
      const summary=document.createElement('summary');summary.textContent='Historial de reconsolidació · '+state.history.length;details.appendChild(summary);
      state.history.slice().reverse().forEach(event=>{
        const row=document.createElement('div');row.className='reconsolidation-history-row';
        const a=document.createElement('strong');a.textContent=event.label;
        const b=document.createElement('span');b.textContent=(event.direction>0?'+':'')+event.direction;
        row.append(a,b);details.appendChild(row);
      });
      box.appendChild(details);
    }
  };

  const panel=document.getElementById('node-panel');
  if(panel)window.addEventListener('animic:node-activated',()=>window.setTimeout(render,0));

  ['animic:consolidation-updated','animic:homeostasis-updated','animic:constitution-mutated','animic:branch-founded'].forEach(name=>window.addEventListener(name,()=>window.setTimeout(render,0)));
  window.addEventListener('storage',render);
  render();
})();