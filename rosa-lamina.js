(()=> {
  const dialog=document.getElementById('rosa');
  if(!dialog||dialog.classList.contains('rosa-lamina-ready'))return;
  const stage=dialog.querySelector('.rosa-stage');
  const instrument=dialog.querySelector('.rosa-instrument');
  const center=dialog.querySelector('.rosa-center');
  if(!stage||!instrument||!center)return;
  const link=document.createElement('link');
  link.rel='stylesheet';link.href='./rosa-lamina.css';document.head.appendChild(link);
  const head=document.createElement('div');
  head.className='rosa-lamina-head';
  head.innerHTML='<p>TM-01<strong>Rosa de l’Escolta</strong></p><span>Toca el centre per obrir els camins<br>Orientar sense imposar</span>';
  stage.prepend(head);
  const star=document.createElement('div');star.className='rosa-compass-star';star.setAttribute('aria-hidden','true');
  const gimbal=document.createElement('div');gimbal.className='rosa-gimbal';gimbal.setAttribute('aria-hidden','true');
  const hub=document.createElement('span');hub.className='rosa-gimbal-hub';gimbal.appendChild(hub);
  instrument.prepend(star,gimbal);
  [['n','NORD'],['e','EST'],['s','SUD'],['o','OEST']].forEach(([pos,label])=>{
    const mark=document.createElement('span');mark.className='rosa-cardinal '+pos;mark.textContent=label;mark.setAttribute('aria-hidden','true');instrument.appendChild(mark);
  });
  center.innerHTML='<span class="rosa-center-emblem" aria-hidden="true">♧</span><span class="rosa-center-label">CENTRE · ORIGEN</span>';
  dialog.classList.add('rosa-lamina-ready');

  const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const resetBalance=()=>{
    instrument.classList.remove('is-balancing');
    instrument.style.setProperty('--rosa-tilt-x','0deg');
    instrument.style.setProperty('--rosa-tilt-y','0deg');
    instrument.style.setProperty('--rosa-bearing','0deg');
    delete dialog.dataset.rosaBearingSector;
  };
  if(!reduceMotion){
    const balance=event=>{
      const rect=instrument.getBoundingClientRect();
      const nx=Math.max(-1,Math.min(1,(event.clientX-(rect.left+rect.width/2))/(rect.width/2)));
      const ny=Math.max(-1,Math.min(1,(event.clientY-(rect.top+rect.height/2))/(rect.height/2)));
      const limit=window.matchMedia('(max-width:760px)').matches?3.2:5.2;
      const bearing=Math.atan2(nx,-ny)*180/Math.PI;
      const abs=((bearing%360)+360)%360;
      const sector=abs<45||abs>=315?'n':abs<135?'e':abs<225?'s':'o';
      instrument.style.setProperty('--rosa-tilt-x',(-ny*limit).toFixed(2)+'deg');
      instrument.style.setProperty('--rosa-tilt-y',(nx*limit).toFixed(2)+'deg');
      instrument.style.setProperty('--rosa-bearing',bearing.toFixed(1)+'deg');
      dialog.dataset.rosaBearingSector=sector;
      instrument.classList.add('is-balancing');
    };
    instrument.addEventListener('pointermove',balance,{passive:true});
    instrument.addEventListener('pointerdown',balance,{passive:true});
    instrument.addEventListener('pointerleave',resetBalance,{passive:true});
    instrument.addEventListener('pointerup',()=>window.setTimeout(resetBalance,180),{passive:true});
    instrument.addEventListener('pointercancel',resetBalance,{passive:true});
    dialog.addEventListener('close',resetBalance);
  }
  window.dispatchEvent(new CustomEvent('rosa:lamina-ready',{detail:{version:'1.1.0',balance:!reduceMotion,needle:true}}));
})();
