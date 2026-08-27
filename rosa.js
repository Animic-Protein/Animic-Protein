
(()=>{
  const dialog=document.getElementById('rosa');
  if(!dialog) return;
  const instrument=dialog.querySelector('.rosa-instrument');
  const center=dialog.querySelector('.rosa-center');
  const branches=[...dialog.querySelectorAll('.rosa-branch')];
  const status=dialog.querySelector('[data-rosa-status]');
  const title=dialog.querySelector('[data-rosa-title]');
  const desc=dialog.querySelector('[data-rosa-desc]');
  const enter=dialog.querySelector('.rosa-enter');
  const reset=dialog.querySelector('[data-rosa-reset]');
  const map={
    harmonia:{title:'Harmonia Viva',desc:'Llei, tensió, pedals, microtonalitat i bellesa que es fan escolta.',href:'#cambres'},
    retrodansa:{title:'Retrodansa',desc:'Temps, memòria i retorn: el moviment es reorganitza des del final cap a l’origen.',href:'#cambres'},
    silenci:{title:'Silenci',desc:'El buit fecund: escoltar allò que encara no ha pres forma.',href:'#principis'},
    visual:{title:'Univers visual',desc:'Imatge, símbol, cartografia i forma com a òrgans actius del Còdex.',href:'#cambres'}
  };
  let selected=null;
  const announce=(message)=>{if(status) status.textContent=message};
  const openRose=()=>{
    instrument?.classList.add('is-open');
    center?.setAttribute('aria-expanded','true');
    announce('Rosa activada · tria una direcció');
  };
  const clearSelection=()=>{
    selected=null;
    branches.forEach(b=>b.classList.remove('is-selected'));
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
      const item=map[selected];
      if(!item) return;
      if(title) title.textContent=item.title;
      if(desc) desc.textContent=item.desc;
      if(enter){enter.href=item.href;enter.removeAttribute('aria-disabled');}
      announce('Direcció seleccionada · portal preparat');
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
