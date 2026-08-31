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

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='temps-nu.css';
  document.head.appendChild(css);

  let timer=null;
  let audio=null;
  let audioOut=null;
  let cycle=0;
  let threshold=null;
  let mutation='timbre';
  let completed=false;
  let runToken=0;

  const el=(tag,className,text)=>{
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  };

  const safeRead=()=>{
    try{
      const value=JSON.parse(localStorage.getItem(MEMORY_KEY)||'null');
      if(!value||typeof value!=='object')return null;
      return{
        mutation:mutations[value.mutation]?value.mutation:'timbre',
        threshold:Number.isInteger(value.threshold)&&value.threshold>=1&&value.threshold<=9?value.threshold:null,
        createdAt:typeof value.createdAt==='string'?value.createdAt:''
      };
    }catch{return null}
  };
  const safeWrite=value=>{try{localStorage.setItem(MEMORY_KEY,JSON.stringify(value))}catch{}};
  const safeRemove=()=>{try{localStorage.removeItem(MEMORY_KEY)}catch{}};

  const phaseFor=n=>{
    if(!n)return{index:0,title:'Cambra en repòs',detail:'Tria una mutació i entra quan vulguis.'};
    if(n<=7)return{index:n===1?1:2,title:'Repetició estable',detail:'No embellir. Escoltar l’impuls de fugir sense obeir-lo.'};
    if(n===8)return{index:3,title:'Mutació mínima · '+mutations[mutation].label,detail:mutations[mutation].detail};
    return{index:4,title:'Retorn amb memòria',detail:'La forma inicial torna. Comprova si ara s’escolta diferent.'};
  };

  const stopAudio=()=>{
    if(audio){
      try{audio.close()}catch{}
      audio=null;
      audioOut=null;
    }
  };

  const tone=(ctx,when,freq,duration,gainValue,type='sine')=>{
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(freq,when);
    gain.gain.setValueAtTime(0.0001,when);
    gain.gain.exponentialRampToValueAtTime(gainValue,when+.025);
    gain.gain.exponentialRampToValueAtTime(0.0001,when+duration);
    osc.connect(gain).connect(audioOut||ctx.destination);
    osc.start(when);
    osc.stop(when+duration+.03);
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
    const ctx=audio;
    if(ctx.state==='suspended')ctx.resume();
    const start=ctx.currentTime+.04;
    let freqs=[146.83,174.61,220];
    let type='sine';
    let gains=[.035,.03,.032];
    if(n===8){
      if(mutation==='altura')freqs=freqs.map(f=>f*1.189207);
      if(mutation==='timbre')type='triangle';
      if(mutation==='accent')gains=[.065,.025,.028];
    }
    freqs.forEach((freq,index)=>{
      if(n===8&&mutation==='silenci'&&index===1)return;
      tone(ctx,start+index*.54,freq,.34,gains[index],type);
    });
  };

  const stop=({reset=false}={})=>{
    runToken+=1;
    if(timer){clearTimeout(timer);timer=null}
    stopAudio();
    if(reset){cycle=0;threshold=null;completed=false}
  };

  const ritualLabels=['Entrar','Repetir','Llindar','Mutar','Retornar'];

  const render=()=>{
    const panel=document.querySelector('.brodsky-radix-panel');
    const active=document.querySelector('#living-map [data-node].is-active')?.dataset?.node;
    if(!panel||active!==NODE_ID)return;
    panel.querySelector('.temps-nu-instrument')?.remove();

    const box=el('section','temps-nu-instrument');
    const head=el('div','temps-nu-head');
    const headText=el('div');
    headText.append(el('p','brodsky-subtitle','Cambra d’escolta'),el('h5','','Temps nu · sessió 7—1—1'));
    head.append(headText,el('span','temps-nu-private','Privat · no es publica'));
    box.appendChild(head);

    const ritual=el('div','temps-nu-ritual');
    const phase=phaseFor(cycle);
    ritualLabels.forEach((label,index)=>{
      const step=el('span',index===phase.index?'is-current':'',label);
      ritual.appendChild(step);
    });
    box.appendChild(ritual);

    const mutationLabel=el('p','brodsky-subtitle','Una sola mutació a la volta 8');
    const mutationGrid=el('div','temps-nu-mutations');
    Object.entries(mutations).forEach(([id,item])=>{
      const button=el('button','',item.label);
      button.type='button';
      button.setAttribute('aria-pressed',String(id===mutation));
      button.disabled=cycle>0&&!completed;
      button.addEventListener('click',()=>{mutation=id;render()});
      mutationGrid.appendChild(button);
    });
    box.append(mutationLabel,mutationGrid);

    const stage=el('div','temps-nu-stage');
    stage.append(
      el('p','temps-nu-cycle',cycle?'Volta '+cycle+' / '+TOTAL_CYCLES:'CONT·I · TEMPS NU'),
      el('strong','',phase.title),
      el('p','',phase.detail)
    );
    const pulse=el('span','temps-nu-pulse'+(cycle>0&&!completed?' is-running':''));
    pulse.setAttribute('aria-hidden','true');
    stage.appendChild(pulse);
    box.appendChild(stage);

    const actions=el('div','temps-nu-actions');
    const start=el('button','',cycle||completed?'Reiniciar la travessa':'Entrar i escoltar');
    start.type='button';
    const mark=el('button','',threshold?'Llindar: volta '+threshold:'Marca el llindar');
    mark.type='button';
    mark.disabled=cycle<1||cycle>7||completed||Boolean(threshold);
    const halt=el('button','','Atura');
    halt.type='button';
    halt.disabled=!cycle||completed;
    start.addEventListener('click',begin);
    mark.addEventListener('click',()=>{threshold=cycle;render()});
    halt.addEventListener('click',()=>{stop({reset:true});render()});
    actions.append(start,mark,halt);
    box.appendChild(actions);

    if(completed){
      const result=el('p','temps-nu-result',threshold
        ? 'El primer impuls de fugir ha aparegut a la volta '+threshold+'. Decideix si la diferència mereix memòria.'
        : 'Has travessat les nou voltes sense marcar un llindar. També és una dada d’escolta.');
      const decisions=el('div','temps-nu-decision');
      const fruit=el('button','','Conserva com a fruit privat');
      const compost=el('button','','Retorna al compost');
      fruit.type=compost.type='button';
      fruit.addEventListener('click',()=>{
        safeWrite({mutation,threshold,createdAt:new Date().toISOString(),version:'TEMPS·NU·I'});
        render();
      });
      compost.addEventListener('click',()=>{safeRemove();stop({reset:true});render()});
      decisions.append(fruit,compost);
      box.append(result,decisions);
    }

    const memory=safeRead();
    if(memory){
      const memoryBox=el('div','temps-nu-memory');
      memoryBox.append(
        el('strong','','Darrer fruit privat · '+mutations[memory.mutation].label),
        el('p','',memory.threshold?'Llindar registrat a la volta '+memory.threshold+'.':'Travessa sense llindar marcat.')
      );
      const withdraw=el('button','temps-nu-withdraw','Retira aquesta memòria');
      withdraw.type='button';
      withdraw.addEventListener('click',()=>{safeRemove();render()});
      memoryBox.appendChild(withdraw);
      box.appendChild(memoryBox);
    }

    panel.appendChild(box);
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

  function begin(){
    stop({reset:true});
    const token=runToken;
    advance(token);
  }

  window.addEventListener('animic:node-activated',event=>{
    if(event.detail?.id!==NODE_ID)stop();
    window.setTimeout(render,0);
  });
  window.addEventListener('pagehide',()=>stop());
  render();
})();
