(() => {
  'use strict';

  const NODE_ID='temps-nu';
  const MEMORY_KEY='animic-protein-temps-nu-v1';
  const CYCLE_MS=2400;
  const TOTAL_CYCLES=9;
  const mutations={
    timbre:{label:'Timbre',detail:'La mateixa figura canvia de pell.'},
    accent:{label:'Accent',detail:'Un únic atac desplaça el pes del cicle.'},
    altura:{label:'Altura',detail:'La cèl·lula es desvia una tercera menor.'},
    silenci:{label:'Silenci',detail:'Un atac desapareix i deixa el seu rastre.'}
  };

  const dialog=document.getElementById('temps-nu-dialog');
  if(!dialog)return;

  const gates=dialog.querySelector('[data-tn-gates]');
  const center=dialog.querySelector('[data-tn-center]');
  const status=dialog.querySelector('[data-tn-status]');
  const title=dialog.querySelector('[data-tn-title]');
  const description=dialog.querySelector('[data-tn-description]');
  const caption=dialog.querySelector('[data-tn-stage-caption]');
  const workbench=dialog.querySelector('[data-tn-workbench]');
  const viewButtons=[...dialog.querySelectorAll('[data-tn-view]')];
  const routeSteps=[...dialog.querySelectorAll('[data-tn-step]')];

  let view='centre';
  let timer=null;
  let audio=null;
  let audioOut=null;
  let cycle=0;
  let threshold=null;
  let mutation='timbre';
  let completed=false;
  let demoMode=false;
  let runToken=0;

  const el=(tag,className,text)=>{
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  };

  const button=(label,className='')=>{
    const node=el('button',className,label);
    node.type='button';
    return node;
  };

  const safeRead=()=>{
    try{
      const value=JSON.parse(localStorage.getItem(MEMORY_KEY)||'null');
      if(!value||typeof value!=='object')return null;
      return{
        mutation:mutations[value.mutation]?value.mutation:'timbre',
        threshold:Number.isInteger(value.threshold)&&value.threshold>=1&&value.threshold<=9?value.threshold:null,
        mode:value.mode==='demo'?'demo':'lliure',
        createdAt:typeof value.createdAt==='string'?value.createdAt:'',
        version:typeof value.version==='string'?value.version:'TEMPS·NU·IV'
      };
    }catch{return null}
  };
  const safeWrite=value=>{try{localStorage.setItem(MEMORY_KEY,JSON.stringify(value))}catch{}};
  const safeRemove=()=>{try{localStorage.removeItem(MEMORY_KEY)}catch{}};

  const phaseFor=n=>{
    if(!n)return{name:'Aproximació',detail:'La cambra és en repòs.'};
    if(n<=7)return{name:'Escolta · repetició '+n,detail:demoMode?'Re — Fa — La. Tres atacs intactes.':'Sostén la cèl·lula sense embellir-la.'};
    if(n===8)return{name:'Interferència · '+mutations[mutation].label,detail:demoMode?'Re — [absència] — La. El Fa deixa un espai audible.':mutations[mutation].detail};
    return{name:'Plegament · retorn',detail:demoMode?'Re — Fa — La. El Fa retorna amb la memòria del buit.':'La forma inicial torna. Comprova si ara s’escolta diferent.'};
  };

  const stopAudio=()=>{
    if(audio){
      try{audio.close()}catch{}
      audio=null;
      audioOut=null;
    }
  };

  const tone=(ctx,when,freq,duration,gainValue,type='sine')=>{
    const oscillator=ctx.createOscillator();
    const gain=ctx.createGain();
    oscillator.type=type;
    oscillator.frequency.setValueAtTime(freq,when);
    gain.gain.setValueAtTime(0.0001,when);
    gain.gain.exponentialRampToValueAtTime(gainValue,when+.025);
    gain.gain.exponentialRampToValueAtTime(0.0001,when+duration);
    oscillator.connect(gain).connect(audioOut||ctx.destination);
    oscillator.start(when);
    oscillator.stop(when+duration+.03);
  };

  const soundCycle=n=>{
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    if(!AudioContext)return;
    if(!audio){
      audio=new AudioContext();
      const compressor=audio.createDynamicsCompressor();
      const master=audio.createGain();
      compressor.threshold.value=-24;
      compressor.knee.value=18;
      compressor.ratio.value=8;
      compressor.attack.value=.004;
      compressor.release.value=.18;
      master.gain.value=.72;
      compressor.connect(master).connect(audio.destination);
      audioOut=compressor;
    }
    if(audio.state==='suspended')audio.resume();
    const start=audio.currentTime+.04;
    let frequencies=[146.83,174.61,220];
    let type='sine';
    let levels=[.035,.03,.032];
    if(n===8){
      if(mutation==='altura')frequencies=frequencies.map(frequency=>frequency*1.189207);
      if(mutation==='timbre')type='triangle';
      if(mutation==='accent')levels=[.065,.025,.028];
    }
    frequencies.forEach((frequency,index)=>{
      if(n===8&&mutation==='silenci'&&index===1)return;
      tone(audio,start+index*.54,frequency,.34,levels[index],type);
    });
  };

  const stop=({reset=false}={})=>{
    runToken+=1;
    if(timer){clearTimeout(timer);timer=null}
    stopAudio();
    if(reset){
      cycle=0;
      threshold=null;
      completed=false;
      demoMode=false;
    }
  };

  const renderGates=()=>{
    gates.replaceChildren();
    for(let n=1;n<=TOTAL_CYCLES;n+=1){
      const angle=(n-1)*40;
      const kind=n<=7?'Repetició':n===8?'Interferència':'Retorn';
      const slot=el('span','temps-nu-gate-slot');
      slot.style.setProperty('--tn-angle',angle+'deg');
      const gate=el('span','temps-nu-gate '+(n<cycle?'is-past ':'')+(n===cycle?'is-current ':'')+(n===8?'is-mutation ':'')+(n===9?'is-return':''),String(n));
      gate.style.setProperty('--tn-counter',(-angle)+'deg');
      gate.setAttribute('role','img');
      gate.setAttribute('aria-label','Volta '+n+': '+kind+(n===cycle?', activa':''));
      slot.appendChild(gate);
      gates.appendChild(slot);
    }
  };

  const renderCentre=()=>{
    workbench.append(
      el('p','kicker','Centre · origen i retorn'),
      el('h3','','La cambra encara no ha començat'),
      el('p','temps-nu-copy','Tria Demo per escoltar una absència guiada, Travessa per decidir la mutació o Memòria per revisar el darrer fruit privat.')
    );
    workbench.appendChild(el('p','temps-nu-notice','El so només s’activa amb el teu gest. Pots aturar-lo i tornar al centre en qualsevol moment.'));
  };

  const renderDemo=()=>{
    workbench.append(
      el('p','kicker','Demo · mutació de silenci'),
      el('h3','','Una absència audible'),
      el('p','temps-nu-score','Re — Fa — La × 7 · Re — ∅ — La × 1 · Re — Fa — La × 1'),
      el('p','temps-nu-copy','A la vuitena volta desapareixerà el Fa. A la novena tornarà: el material serà igual a l’inici, però l’escolta conservarà el buit.')
    );
    const start=button('Comença la Demo','is-primary');
    start.addEventListener('click',()=>begin({demo:true}));
    const actions=el('div','temps-nu-actions');
    actions.appendChild(start);
    workbench.appendChild(actions);
  };

  const renderFree=()=>{
    workbench.append(
      el('p','kicker','Travessa lliure'),
      el('h3','','Una sola diferència'),
      el('p','temps-nu-copy','Tria què canviarà exclusivament a la vuitena volta.')
    );
    const choices=el('div','temps-nu-mutations');
    choices.setAttribute('role','group');
    choices.setAttribute('aria-label','Mutació única de la vuitena volta');
    const choiceDetail=el('p','temps-nu-choice-detail',mutations[mutation].detail);
    Object.entries(mutations).forEach(([id,item])=>{
      const choice=button(item.label);
      choice.dataset.tnMutation=id;
      choice.setAttribute('aria-pressed',String(id===mutation));
      choice.setAttribute('aria-describedby','temps-nu-mutation-detail');
      choice.addEventListener('click',()=>{
        mutation=id;
        choices.querySelectorAll('button').forEach(control=>control.setAttribute('aria-pressed',String(control.dataset.tnMutation===mutation)));
        choiceDetail.textContent=item.detail;
      });
      choices.appendChild(choice);
    });
    choiceDetail.id='temps-nu-mutation-detail';
    const start=button('Comença la Travessa','is-primary');
    start.addEventListener('click',()=>begin());
    const actions=el('div','temps-nu-actions');
    actions.appendChild(start);
    workbench.append(choices,choiceDetail,actions);
  };

  const renderMemory=()=>{
    const memory=safeRead();
    workbench.append(el('p','kicker','Memòria viva'),el('h3','','Fruit privat'));
    if(!memory){
      workbench.appendChild(el('p','temps-nu-copy','No hi ha cap fruit conservat en aquest dispositiu. La cambra no publica res per defecte.'));
      return;
    }
    workbench.append(
      el('p','temps-nu-score',mutations[memory.mutation].label+' · '+(memory.mode==='demo'?'Demo':'Travessa lliure')),
      el('p','temps-nu-copy',memory.threshold?'El primer llindar es va marcar a la volta '+memory.threshold+'.':'La travessa es va completar sense marcar cap llindar.')
    );
    if(memory.createdAt){
      const date=new Date(memory.createdAt);
      if(!Number.isNaN(date.getTime()))workbench.appendChild(el('p','temps-nu-memory-meta','Conservat '+date.toLocaleString('ca-ES',{dateStyle:'medium',timeStyle:'short'})+' · '+memory.version));
    }
    const withdraw=button('Retira aquesta memòria');
    let withdrawalArmed=false;
    withdraw.addEventListener('click',()=>{
      if(!withdrawalArmed){
        withdrawalArmed=true;
        withdraw.textContent='Confirma la retirada definitiva';
        withdraw.classList.add('is-danger');
        return;
      }
      safeRemove();
      render();
    });
    const actions=el('div','temps-nu-actions');
    actions.appendChild(withdraw);
    workbench.appendChild(actions);
  };

  const renderRunning=()=>{
    const phase=phaseFor(cycle);
    workbench.append(
      el('p','kicker','Volta '+cycle+' / '+TOTAL_CYCLES),
      el('h3','',phase.name),
      el('p','temps-nu-score',demoMode?(cycle===8?'Re — ∅ — La':'Re — Fa — La'):'Mutació preparada · '+mutations[mutation].label),
      el('p','temps-nu-copy',phase.detail)
    );
    const mark=button(threshold?'Llindar marcat · volta '+threshold:'Marca el llindar');
    mark.disabled=cycle<1||cycle>7||Boolean(threshold);
    mark.addEventListener('click',()=>{threshold=cycle;render()});
    const halt=button('Atura i torna al centre');
    halt.addEventListener('click',returnCentre);
    const actions=el('div','temps-nu-actions');
    actions.append(mark,halt);
    workbench.appendChild(actions);
  };

  const renderCompleted=()=>{
    workbench.append(
      el('p','kicker','Retorn · memòria viva'),
      el('h3','','La novena volta ha tornat'),
      el('p','temps-nu-copy',threshold?'El primer impuls de fugir ha aparegut a la volta '+threshold+'. Ara decideix si la diferència mereix memòria.':'No has marcat cap llindar. També és una dada d’escolta.')
    );
    if(demoMode){
      const difference=el('div','temps-nu-difference');
      difference.append(
        el('p','kicker','Entrada → operació → sortida'),
        el('strong','','q: tres atacs → q′: un atac absent → retorn: tres atacs'),
        el('p','','Diferència perceptible: el retorn conté la memòria de l’absència.')
      );
      workbench.appendChild(difference);
    }
    const fruit=button('Conserva com a fruit privat','is-primary');
    fruit.addEventListener('click',()=>{
      safeWrite({mutation,threshold,mode:demoMode?'demo':'lliure',createdAt:new Date().toISOString(),version:'TEMPS·NU·IV'});
      view='memory';
      stop({reset:true});
      render();
    });
    const compost=button('Aquesta travessa al Compost');
    compost.addEventListener('click',returnCentre);
    const actions=el('div','temps-nu-actions');
    actions.append(fruit,compost);
    workbench.appendChild(actions);
  };

  const render=()=>{
    renderGates();
    const running=cycle>0&&!completed;
    const phase=phaseFor(cycle);
    dialog.dataset.tnState=completed?'retorn':running?(cycle===8?'interferencia':cycle===9?'plegament':'escolta'):view;
    center?.classList.toggle('is-active',running||completed);
    if(caption)caption.textContent=completed?'Retorn completat. Decideix entre memòria viva i Compost.':running?phase.name+' · '+phase.detail:'Centre disponible · sempre pots tornar a l’origen.';
    if(status)status.textContent=completed?'Retorn · decisió':running?phase.name:(view==='centre'?'Centre · cambra en repòs':view==='demo'?'Camí · Demo':view==='free'?'Camí · Travessa lliure':'Camí · Memòria');
    if(title)title.textContent=completed?'Retorn amb memòria':running?phase.name:view==='centre'?'Habitar la repetició':view==='demo'?'Demo · absència audible':view==='free'?'Travessa · diferència mínima':'Memòria · fruit privat';
    if(description)description.textContent=running?'La cambra mostra com està existint la teva escolta; no avalua el resultat.':view==='centre'?'Entra per una Demo, una Travessa lliure o la Memòria. Sempre pots tornar al centre.':view==='memory'?'La memòria és local, explícita i revocable.':'PROXIMITAT + DIFERÈNCIA + TEMPS';
    viewButtons.forEach(control=>{
      control.disabled=running;
      control.setAttribute('aria-pressed',String(control.dataset.tnView===view));
    });
    const activeStep=completed?5:running?(cycle<=7?2:cycle===8?3:4):(view==='memory'?5:1);
    routeSteps.forEach(step=>{
      const stepNumber=Number(step.dataset.tnStep);
      step.classList.toggle('is-current',stepNumber===activeStep);
      step.classList.toggle('is-past',stepNumber<activeStep);
      if(stepNumber===activeStep)step.setAttribute('aria-current','step');
      else step.removeAttribute('aria-current');
    });
    workbench.replaceChildren();
    if(running)renderRunning();
    else if(completed)renderCompleted();
    else if(view==='demo')renderDemo();
    else if(view==='free')renderFree();
    else if(view==='memory')renderMemory();
    else renderCentre();
  };

  const advance=token=>{
    if(token!==runToken)return;
    cycle+=1;
    soundCycle(cycle);
    render();
    if(cycle>=TOTAL_CYCLES){
      timer=setTimeout(()=>{
        if(token!==runToken)return;
        completed=true;
        timer=null;
        stopAudio();
        render();
      },CYCLE_MS);
      return;
    }
    timer=setTimeout(()=>advance(token),CYCLE_MS);
  };

  function begin({demo=false}={}){
    stop({reset:true});
    demoMode=demo;
    if(demo)mutation='silenci';
    const token=runToken;
    advance(token);
  }

  function returnCentre(){
    stop({reset:true});
    view='centre';
    render();
  }

  const openChamber=()=>{
    returnCentre();
    if(!dialog.open&&typeof dialog.showModal==='function')dialog.showModal();
  };

  const ensureEntry=()=>{
    const panel=document.querySelector('.brodsky-radix-panel');
    const active=document.querySelector('#living-map [data-node].is-active')?.dataset?.node;
    if(!panel||active!==NODE_ID)return;
    panel.querySelector('.temps-nu-entry')?.remove();
    const entry=el('section','temps-nu-entry');
    entry.append(
      el('p','kicker','Portal actiu · CONT·I'),
      el('h5','','Cambra nua del temps'),
      el('p','','Centre, Demo, Travessa i Memòria dins una navegació pròpia.')
    );
    const open=button('Obrir la Cambra nua del temps','is-primary');
    open.addEventListener('click',openChamber);
    entry.appendChild(open);
    panel.appendChild(entry);
  };

  viewButtons.forEach(control=>control.addEventListener('click',()=>{
    stop({reset:true});
    view=control.dataset.tnView||'centre';
    render();
  }));
  center?.addEventListener('click',returnCentre);
  dialog.addEventListener('close',returnCentre);
  window.addEventListener('animic:node-activated',event=>{
    if(event.detail?.id!==NODE_ID&&dialog.open)dialog.close();
    window.setTimeout(ensureEntry,0);
  });
  window.addEventListener('pagehide',()=>stop());
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&dialog.open)returnCentre();
  });

  render();
  ensureEntry();
})();
