(()=>{
  const dialog=document.getElementById('rosa');
  if(!dialog) return;
  const consoleEl=dialog.querySelector('.rosa-console');
  if(!consoleEl) return;

  if(!document.getElementById('rosa-inter-nos-styles')){
    const link=document.createElement('link');link.id='rosa-inter-nos-styles';link.rel='stylesheet';link.href='./rosa-inter-nos.css';document.head.appendChild(link);
  }

  const SEED_KEY='animic-protein-seed-memory-v1';
  const STRUCTURAL_PAIRS={'rastre|ressonància':'radix-absencia-dirigeix-temps'};
  const selected=[];
  const selectedElements=[];
  let currentRelation=null;
  const normalize=el=>({label:(el.dataset?.title||el.textContent||'Node').trim().replace(/\s+/g,' '),key:(el.dataset?.node||el.dataset?.rosaKey||el.textContent||'node').trim().toLowerCase().replace(/\s+/g,'-')});
  const canonicalPair=(a,b)=>[a,b].sort((x,y)=>x.key.localeCompare(y.key));
  const readSeeds=()=>{try{const v=JSON.parse(localStorage.getItem(SEED_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};

  const panel=document.createElement('section');panel.className='rosa-inter-nos';panel.hidden=true;panel.setAttribute('aria-live','polite');
  panel.innerHTML=`<p class="kicker">INTER NOS · Relació activa</p><h3 data-inter-nos-title>Dos nodes, una tercera cosa</h3><p data-inter-nos-output></p><p class="rosa-inter-nos-memory" data-inter-nos-memory hidden></p><div class="rosa-inter-nos-actions"><button type="button" data-inter-nos-seed hidden>Sembrar relació</button><button type="button" data-inter-nos-clear>Netejar relació</button></div>`;
  consoleEl.appendChild(panel);
  const output=panel.querySelector('[data-inter-nos-output]'),title=panel.querySelector('[data-inter-nos-title]'),memory=panel.querySelector('[data-inter-nos-memory]'),clear=panel.querySelector('[data-inter-nos-clear]'),seedButton=panel.querySelector('[data-inter-nos-seed]');

  const relationText=(a,b)=>{
    const options=[`Què canvia en ${a.label} quan és escoltat des de ${b.label}?`,`${a.label} aporta forma; ${b.label} aporta desviació. Conserva només la diferència perceptible.`,`Fes una prova reversible: deixa que ${a.label} imposi una regla i que ${b.label} la contradigui una sola vegada.`,`Busca el tercer element que només apareix quan ${a.label} i ${b.label} coexisteixen.`];
    return options[[...`${a.key}|${b.key}`].reduce((n,c)=>n+c.charCodeAt(0),0)%options.length];
  };
  const relationId=(a,b,text)=>`seed-inter-nos-${hash(`${a.key}|${b.key}|${text}`)}`;
  const structuralPattern=(a,b)=>{
    const id=STRUCTURAL_PAIRS[`${a.key}|${b.key}`];
    return id?window.AnimicMemoriaRadicum?.patterns?.find(pattern=>pattern.id===id)||null:null;
  };

  const render=()=>{
    dialog.querySelectorAll('.is-inter-nos-selected').forEach(el=>el.classList.remove('is-inter-nos-selected'));
    selectedElements.forEach(el=>el?.isConnected&&el.classList.add('is-inter-nos-selected'));
    currentRelation=null;seedButton.hidden=true;seedButton.textContent='Sembrar relació';seedButton.disabled=false;memory.hidden=true;memory.textContent='';
    if(!selected.length){panel.hidden=true;return;}
    panel.hidden=false;
    if(selected.length===1){title.textContent=`${selected[0].label} + …`;output.textContent='Tria un segon node de la Rosa. INTER NOS no suma: posa dues realitats en tensió perquè aparegui una tercera relació.';return;}
    const [a,b]=canonicalPair(...selected),pattern=structuralPattern(a,b),text=pattern?.statement||relationText(a,b),id=pattern?.id||relationId(a,b,text),alreadySeeded=readSeeds().some(seed=>seed.id===id);
    currentRelation={a,b,text,id,pattern};title.textContent=pattern?`${a.label} ↔ ${b.label} · memòria`:`${a.label} ↔ ${b.label}`;output.textContent=text;seedButton.hidden=false;
    if(pattern){
      memory.hidden=false;
      memory.textContent=`Memoria Radicum · suport ${pattern.count}/${pattern.threshold}. β·01 retorna al Compost; β·02 transforma la Cambra. Retorn d’aquesta relació: ${pattern.returnInstrument}. Patró provisional, no constitucional.`;
      seedButton.textContent='Recurrència reconeguda';
      seedButton.disabled=true;
    }else if(alreadySeeded){seedButton.textContent='Relació sembrada';seedButton.disabled=true;}
    dialog.dispatchEvent(new CustomEvent('rosa:inter-nos',{detail:{a,b,text,id,pattern}}));
  };

  const addNode=el=>{const node=normalize(el);if(selected.some(x=>x.key===node.key))return;if(selected.length===2){selected.shift();selectedElements.shift();}selected.push(node);selectedElements.push(el);render();};
  dialog.addEventListener('click',event=>{const el=event.target.closest?.('.rosa-satellite, .rosa-branch');if(el)window.setTimeout(()=>addNode(el),0);});

  seedButton.addEventListener('click',()=>{
    if(!currentRelation)return;
    const {a,b,text,id}=currentRelation,now=new Date().toISOString();
    const seeds=readSeeds();
    if(!seeds.some(seed=>seed.id===id)){
      const seed={id,text,source:`INTER NOS · ${a.label} ↔ ${b.label}`,sourceId:a.key,originA:{key:a.key,label:a.label},originB:{key:b.key,label:b.label},kind:'inter-nos',createdAt:now};
      try{localStorage.setItem(SEED_KEY,JSON.stringify([...seeds,seed].slice(-12)))}catch{}
      window.dispatchEvent(new CustomEvent('codex:seed-created',{detail:seed}));
    }
    seedButton.textContent='Relació sembrada';seedButton.disabled=true;
    const status=dialog.querySelector('[data-rosa-status]');if(status)status.textContent='INTER NOS · relació convertida en llavor';
  });

  clear.addEventListener('click',()=>{selected.length=0;selectedElements.length=0;render();const status=dialog.querySelector('[data-rosa-status]');if(status)status.textContent='INTER NOS · relació netejada';});
  dialog.addEventListener('close',()=>{selected.length=0;selectedElements.length=0;render();});
  window.dispatchEvent(new CustomEvent('rosa:inter-nos-ready',{detail:{version:'1.3.0',seeding:true,symmetric:true,structuralMemory:'Memoria Radicum'}}));
})();
