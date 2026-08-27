
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

  let selected=null;
  let selectedNode=null;
  const positions=[
    {x:'0px',y:'-154px',mx:'0px',my:'-128px'},
    {x:'154px',y:'0px',mx:'118px',my:'0px'},
    {x:'0px',y:'154px',mx:'0px',my:'128px'},
    {x:'-154px',y:'0px',mx:'-118px',my:'0px'}
  ];

  const announce=(message)=>{if(status) status.textContent=message};

  const clearConstellation=()=>{
    if(constellation){constellation.innerHTML='';constellation.classList.remove('is-visible');}
    selectedNode=null;
    if(nodeReadout) nodeReadout.hidden=true;
  };

  const renderConstellation=(branchKey)=>{
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
        announce('Node secundari actiu · pots entrar-hi');
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
    branches.forEach(b=>b.classList.remove('is-selected'));
    clearConstellation();
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
      announce('Direcció seleccionada · constel·lació oberta');
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
