
(()=>{
  const dialog=document.getElementById('rosa');
  if(!dialog) return;

  const instrument=dialog.querySelector('.rosa-instrument');
  const center=dialog.querySelector('.rosa-center');
  const branches=[...dialog.querySelectorAll('.rosa-branch')];
  const constellation=dialog.querySelector('[data-rosa-constellation]');
  const status=dialog.querySelector('[data-rosa-status]');
  const title=dialog.querySelector('[data-rosa-title]');
  const desc=dialog.querySelector('[data-rosa-desc]');
  const enter=dialog.querySelector('.rosa-enter');
  const reset=dialog.querySelector('[data-rosa-reset]');
  const nodeReadout=dialog.querySelector('[data-rosa-node-readout]');
  const nodeTitle=dialog.querySelector('[data-rosa-node-title]');
  const nodeDesc=dialog.querySelector('[data-rosa-node-desc]');
  const workbench=dialog.querySelector('[data-rosa-workbench]');
  const workbenchTitle=dialog.querySelector('[data-rosa-workbench-title]');
  const workbenchOutput=dialog.querySelector('[data-rosa-workbench-output]');
  const workbenchAction=dialog.querySelector('[data-rosa-workbench-action]');
  const workbenchAlt=dialog.querySelector('[data-rosa-workbench-alt]');

  const map={
    harmonia:{
      title:'Harmonia Viva',
      desc:'Llei, tensió, pedals, microtonalitat i bellesa que es fan escolta.',
      href:'#cambres',
      color:'#d3ad61',
      nodes:[
        {label:'Pedals',title:'Pedals harmònics',desc:'Arrel, dominant, doble, cromàtic, espectral i latent.',href:'#cambres'},
        {label:'Microtons',title:'Microtonalitat',desc:'Zones entre les notes que desplacen l’orella abans que la teoria.',href:'#mapa-viu'},
        {label:'Retroharmonia',title:'Retro-harmonia',desc:'Reordenar la direcció temporal de la tensió i la resolució.',href:'#cambres'},
        {label:'Zajj-viu',title:'Zajj-viu',desc:'Improvisació, modalitat, risc i escolta col·lectiva.',href:'#cambres'}
      ]
    },
    retrodansa:{
      title:'Retrodansa',
      desc:'Temps, memòria i retorn: el moviment es reorganitza des del final cap a l’origen.',
      href:'#cambres',
      color:'#d06555',
      nodes:[
        {label:'Rastre',title:'Rastre fantasma',desc:'Persistència perceptiva d’un moviment que ja ha desaparegut.',href:'#mapa-viu'},
        {label:'Cos',title:'Cos',desc:'El cos com a lector, instrument i territori del Còdex.',href:'#mapa-viu'},
        {label:'Inversió',title:'Coreografia inversa',desc:'Caminar del final cap a l’origen sense perdre causalitat.',href:'#cambres'},
        {label:'Temps',title:'Temps reversible',desc:'El temps com a material coreogràfic i no només com a mesura.',href:'#mapa-viu'}
      ]
    },
    silenci:{
      title:'Silenci',
      desc:'El buit fecund: escoltar allò que encara no ha pres forma.',
      href:'#principis',
      color:'#a994ef',
      nodes:[
        {label:'Escolta',title:'Escolta fonda',desc:'Atenció abans de l’acció: deixar que el sistema indiqui què necessita.',href:'#principis'},
        {label:'Pausa',title:'Pausa',desc:'Suspensió temporal que permet veure relacions que el flux ocultava.',href:'#principis'},
        {label:'Buit',title:'Buit fecund',desc:'Absència activa que conserva potencial de forma.',href:'#principis'},
        {label:'Ressonància',title:'Ressonància',desc:'Allò que continua actuant després que el so o el gest han cessat.',href:'#mapa-viu'}
      ]
    },
    visual:{
      title:'Univers visual',
      desc:'Imatge, símbol, cartografia i forma com a òrgans actius del Còdex.',
      href:'#cambres',
      color:'#6fd7cf',
      nodes:[
        {label:'Escut',title:'Escut',desc:'Heràldica viva: brúixola, llavor, xarxa, flama i compost.',href:'#mapa-viu'},
        {label:'Herbarium',title:'Herbarium',desc:'Arxiu vegetal de formes, proves i espècies simbòliques.',href:'#mapa-viu'},
        {label:'Rosetta',title:'Rosetta',desc:'Traducció entre llenguatges, signes i futurs recordats.',href:'#mapa-viu'},
        {label:'Làmines',title:'Làmines',desc:'Cartografies i peces editorials que fan visible l’estructura.',href:'#mapa-viu'}
      ]
    }
  };

  const positions=[
    {x:'0px',y:'-154px',mx:'0px',my:'-128px'},
    {x:'154px',y:'0px',mx:'118px',my:'0px'},
    {x:'0px',y:'154px',mx:'0px',my:'128px'},
    {x:'-154px',y:'0px',mx:'-118px',my:'0px'}
  ];

  let selected=null;
  let selectedNode=null;
  let audioContext=null;
  let activeOscillators=[];
  let silenceTimer=null;
  let retrodansaReversed=false;
  let visualLens=0;

  const announce=message=>{ if(status) status.textContent=message; };

  const stopAudio=()=>{
    activeOscillators.forEach(osc=>{ try{osc.stop();}catch{} });
    activeOscillators=[];
  };

  const ensureAudio=async()=>{
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtx) return null;
    if(!audioContext) audioContext=new AudioCtx();
    if(audioContext.state==='suspended') await audioContext.resume();
    return audioContext;
  };

  const tone=(ctx,freq,start,duration=0.75,type='sine',level=0.045)=>{
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(freq,start);
    gain.gain.setValueAtTime(0.0001,start);
    gain.gain.exponentialRampToValueAtTime(level,start+0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start+duration+0.04);
    activeOscillators.push(osc);
    osc.addEventListener('ended',()=>{activeOscillators=activeOscillators.filter(x=>x!==osc);});
  };

  const harmonicGesture=async()=>{
    const ctx=await ensureAudio();
    if(!ctx){
      if(workbenchOutput) workbenchOutput.textContent='Aquest navegador no exposa Web Audio.';
      return;
    }
    stopAudio();
    const now=ctx.currentTime+0.03;
    const key=selectedNode?.label||'Harmonia';
    if(key==='Microtons'){
      tone(ctx,220,now,1.2,'sine',0.035);
      tone(ctx,220*Math.pow(2,50/1200),now,1.2,'triangle',0.035);
      if(workbenchOutput) workbenchOutput.textContent='Microinterval actiu · 50 cents sobre 220 Hz.';
    }else if(key==='Retroharmonia'){
      [220,277.18,329.63,277.18].forEach((f,i)=>tone(ctx,f,now+i*0.28,0.42,'triangle',0.04));
      if(workbenchOutput) workbenchOutput.textContent='Tensió → resolució → retorn: la frase es plega sobre ella mateixa.';
    }else if(key==='Zajj-viu'){
      const dorian=[146.83,164.81,174.61,196,220,246.94,261.63];
      const phrase=Array.from({length:5},()=>dorian[Math.floor(Math.random()*dorian.length)]);
      phrase.forEach((f,i)=>tone(ctx,f,now+i*0.2,0.34,i%2?'triangle':'sine',0.038));
      if(workbenchOutput) workbenchOutput.textContent='Variació modal generada · risc controlat dins un camp dòric.';
    }else{
      tone(ctx,110,now,1.3,'sine',0.04);
      tone(ctx,165,now,1.3,'triangle',0.035);
      if(workbenchOutput) workbenchOutput.textContent='Pedal d’arrel + quinta · una base estable perquè la resta pugui mutar.';
    }
    announce('Harmonia Viva · gest sonor executat');
  };

  const retrodansaSequence=()=>{
    const key=selectedNode?.label||'Inversió';
    if(key==='Rastre') return ['Gest','Eco','Rastre','Absència'];
    if(key==='Cos') return ['Impuls','Articulació','Gest','Repòs'];
    if(key==='Temps') return ['Abans','Ara','Després','Memòria'];
    return ['Llavor','Germinació','Floració','Collita','Compost'];
  };

  const renderRetrodansa=()=>{
    const sequence=retrodansaSequence();
    const shown=retrodansaReversed?[...sequence].reverse():sequence;
    if(workbenchOutput) workbenchOutput.textContent=shown.join(' → ');
  };

  const toggleRetrodansa=()=>{
    retrodansaReversed=!retrodansaReversed;
    renderRetrodansa();
    if(workbenchAction) workbenchAction.textContent=retrodansaReversed?'Restaurar direcció':'Invertir seqüència';
    announce(retrodansaReversed?'Retrodansa · temps invertit':'Retrodansa · direcció restaurada');
  };

  const stopSilence=()=>{
    if(silenceTimer){clearInterval(silenceTimer);silenceTimer=null;}
    dialog.classList.remove('is-silence');
    if(selected==='silenci'&&workbenchOutput) workbenchOutput.textContent='Silenci disponible · 8 segons de suspensió perceptiva.';
    if(workbenchAction) workbenchAction.textContent='Activar 8 s de silenci';
    if(workbenchAlt) workbenchAlt.hidden=true;
  };

  const startSilence=()=>{
    stopAudio();
    stopSilence();
    dialog.classList.add('is-silence');
    const end=Date.now()+8000;
    if(workbenchAlt){workbenchAlt.hidden=false;workbenchAlt.textContent='Aturar';}
    if(workbenchAction) workbenchAction.textContent='Reiniciar silenci';
    const update=()=>{
      const left=Math.max(0,Math.ceil((end-Date.now())/1000));
      if(workbenchOutput) workbenchOutput.textContent=left?('Silenci actiu · '+left+' s'):'Silenci completat · escolta què ha quedat.';
      if(left===0){
        clearInterval(silenceTimer);
        silenceTimer=null;
        dialog.classList.remove('is-silence');
        if(workbenchAction) workbenchAction.textContent='Activar 8 s de silenci';
        if(workbenchAlt) workbenchAlt.hidden=true;
        announce('Silenci · retorn');
      }
    };
    update();
    silenceTimer=setInterval(update,250);
    announce('Silenci · suspensió activa');
  };

  const lenses=[
    {name:'Estructura',className:'lens-structure',text:'Lent Estructura · eixos, relacions i arquitectura al davant.'},
    {name:'Ressonància',className:'lens-resonance',text:'Lent Ressonància · halos i persistències perceptives.'},
    {name:'Rastre',className:'lens-trace',text:'Lent Rastre · la constel·lació deixa memòria visual.'},
    {name:'Nua',className:'lens-bare',text:'Lent Nua · reducció fins al mínim funcional.'}
  ];

  const applyVisualLens=()=>{
    lenses.forEach(l=>instrument?.classList.remove(l.className));
    const lens=lenses[visualLens%lenses.length];
    instrument?.classList.add(lens.className);
    if(workbenchOutput) workbenchOutput.textContent=lens.text;
    if(workbenchAction) workbenchAction.textContent='Canviar lent · '+lens.name;
    announce('Univers visual · '+lens.name);
  };

  const nextVisualLens=()=>{
    visualLens=(visualLens+1)%lenses.length;
    applyVisualLens();
  };

  const clearVisualLens=()=>{
    lenses.forEach(l=>instrument?.classList.remove(l.className));
    visualLens=0;
  };

  const configureWorkbench=(branchKey)=>{
    if(!workbench||!branchKey){if(workbench) workbench.hidden=true;return;}
    workbench.hidden=false;
    if(workbenchAlt) workbenchAlt.hidden=true;
    retrodansaReversed=false;

    if(branchKey==='harmonia'){
      if(workbenchTitle) workbenchTitle.textContent='Prova sonora';
      if(workbenchOutput) workbenchOutput.textContent='Escolta una relació real: el node seleccionat modifica el gest.';
      if(workbenchAction){workbenchAction.textContent='Escoltar';workbenchAction.onclick=harmonicGesture;}
      if(workbenchAlt){workbenchAlt.textContent='Nova variació';workbenchAlt.hidden=false;workbenchAlt.onclick=harmonicGesture;}
    }else if(branchKey==='retrodansa'){
      if(workbenchTitle) workbenchTitle.textContent='Inversor temporal';
      renderRetrodansa();
      if(workbenchAction){workbenchAction.textContent='Invertir seqüència';workbenchAction.onclick=toggleRetrodansa;}
      if(workbenchAlt){workbenchAlt.hidden=true;workbenchAlt.onclick=null;}
    }else if(branchKey==='silenci'){
      if(workbenchTitle) workbenchTitle.textContent='Cambra de silenci';
      if(workbenchOutput) workbenchOutput.textContent='Silenci disponible · 8 segons de suspensió perceptiva.';
      if(workbenchAction){workbenchAction.textContent='Activar 8 s de silenci';workbenchAction.onclick=startSilence;}
      if(workbenchAlt){workbenchAlt.textContent='Aturar';workbenchAlt.hidden=true;workbenchAlt.onclick=()=>{stopSilence();announce('Silenci · interromput');};}
    }else if(branchKey==='visual'){
      if(workbenchTitle) workbenchTitle.textContent='Lent visual';
      applyVisualLens();
      if(workbenchAction){workbenchAction.textContent='Canviar lent · Estructura';workbenchAction.onclick=nextVisualLens;}
      if(workbenchAlt){workbenchAlt.textContent='Restaurar';workbenchAlt.hidden=false;workbenchAlt.onclick=()=>{clearVisualLens();if(workbenchOutput)workbenchOutput.textContent='Lent restaurada · Rosa en aparença base.';announce('Univers visual · aparença base');};}
    }
  };

  const clearConstellation=()=>{
    if(constellation){constellation.innerHTML='';constellation.classList.remove('is-visible');}
    selectedNode=null;
    if(nodeReadout) nodeReadout.hidden=true;
  };

  const renderConstellation=branchKey=>{
    clearConstellation();
    const item=map[branchKey];
    if(!constellation||!item) return;
    item.nodes.forEach((node,index)=>{
      const p=positions[index%positions.length];
      const button=document.createElement('button');
      button.type='button';
      button.className='rosa-satellite';
      button.textContent=node.label;
      button.style.color=item.color;
      button.style.setProperty('--x',p.x);
      button.style.setProperty('--y',p.y);
      button.style.setProperty('--mx',p.mx);
      button.style.setProperty('--my',p.my);
      button.addEventListener('click',()=>{
        selectedNode=node;
        [...constellation.children].forEach(el=>el.classList.toggle('is-selected',el===button));
        if(nodeReadout) nodeReadout.hidden=false;
        if(nodeTitle) nodeTitle.textContent=node.title;
        if(nodeDesc) nodeDesc.textContent=node.desc;
        if(enter){enter.href=node.href;enter.removeAttribute('aria-disabled');}
        configureWorkbench(branchKey);
        announce('Node secundari actiu · instrument contextual preparat');
      });
      constellation.appendChild(button);
    });
    requestAnimationFrame(()=>constellation.classList.add('is-visible'));
  };

  const openRose=()=>{
    instrument?.classList.add('is-open');
    center?.setAttribute('aria-expanded','true');
    announce('Rosa activada · tria una direcció');
  };

  const clearSelection=()=>{
    selected=null;
    selectedNode=null;
    stopAudio();
    stopSilence();
    clearVisualLens();
    branches.forEach(b=>b.classList.remove('is-selected'));
    clearConstellation();
    if(workbench) workbench.hidden=true;
    if(title) title.textContent='Centre · Origen';
    if(desc) desc.textContent='Activa la Rosa i tria una direcció. Sempre pots tornar al centre.';
    if(enter){enter.setAttribute('aria-disabled','true');enter.removeAttribute('href');}
    announce(instrument?.classList.contains('is-open')?'Rosa activada · tria una direcció':'Rosa en repòs');
  };

  const closeRose=()=>{
    instrument?.classList.remove('is-open');
    center?.setAttribute('aria-expanded','false');
    clearSelection();
    announce('Rosa en repòs');
  };

  center?.addEventListener('click',()=>{
    if(instrument?.classList.contains('is-open')) closeRose();
    else openRose();
  });

  branches.forEach(branch=>{
    branch.addEventListener('click',()=>{
      if(!instrument?.classList.contains('is-open')) openRose();
      stopAudio();
      stopSilence();
      clearVisualLens();
      branches.forEach(b=>b.classList.toggle('is-selected',b===branch));
      selected=branch.dataset.branch;
      selectedNode=null;
      const item=map[selected];
      if(!item) return;
      if(title) title.textContent=item.title;
      if(desc) desc.textContent=item.desc;
      if(enter){enter.href=item.href;enter.removeAttribute('aria-disabled');}
      if(nodeReadout) nodeReadout.hidden=true;
      renderConstellation(selected);
      configureWorkbench(selected);
      announce('Direcció seleccionada · instrument contextual actiu');
    });
  });

  enter?.addEventListener('click',e=>{
    if(!selected){e.preventDefault();return;}
    dialog.close();
  });

  reset?.addEventListener('click',clearSelection);
  dialog.addEventListener('close',closeRose);
  dialog.addEventListener('cancel',closeRose);
  clearSelection();
})();
