(()=>{
  const dialog=document.getElementById('rosa');
  if(!dialog) return;

  const instrument=dialog.querySelector('.rosa-instrument');
  if(!instrument) return;

  const STYLE_ID='rosa-enhanced-styles';
  if(!document.getElementById(STYLE_ID)){
    const link=document.createElement('link');
    link.id=STYLE_ID;
    link.rel='stylesheet';
    link.href='./rosa-enhanced.css';
    document.head.appendChild(link);
  }

  dialog.classList.add('rosa-enhanced-ready');

  const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const interactiveSelector='.rosa-center, .rosa-branch, .rosa-satellite, .rosa-workbench button, .rosa-actions button, .rosa-enter';

  const visibleControls=()=>[...dialog.querySelectorAll(interactiveSelector)].filter(el=>{
    if(el.hidden) return false;
    if(el.getAttribute('aria-disabled')==='true') return false;
    const style=window.getComputedStyle(el);
    return style.display!=='none'&&style.visibility!=='hidden'&&style.opacity!=='0';
  });

  const focusRelative=direction=>{
    const controls=visibleControls();
    if(!controls.length) return;
    const current=controls.indexOf(document.activeElement);
    const next=current<0?0:(current+direction+controls.length)%controls.length;
    controls[next]?.focus({preventScroll:true});
  };

  dialog.addEventListener('keydown',event=>{
    if(!dialog.open) return;
    if(event.key==='ArrowRight'||event.key==='ArrowDown'){
      event.preventDefault();
      focusRelative(1);
    }else if(event.key==='ArrowLeft'||event.key==='ArrowUp'){
      event.preventDefault();
      focusRelative(-1);
    }else if(event.key==='Home'){
      const center=dialog.querySelector('.rosa-center');
      if(center){event.preventDefault();center.focus({preventScroll:true});}
    }
  });

  const pulse=target=>{
    const control=target.closest?.('.rosa-center, .rosa-branch, .rosa-satellite, .rosa-workbench button, .rosa-actions button');
    if(!control) return;
    control.classList.remove('rosa-enhanced-pulse');
    void control.offsetWidth;
    control.classList.add('rosa-enhanced-pulse');
    window.setTimeout(()=>control.classList.remove('rosa-enhanced-pulse'),360);
  };

  dialog.addEventListener('click',event=>{
    pulse(event.target);
    if(navigator.vibrate) navigator.vibrate(8);
  });

  if(!reduceMotion){
    instrument.addEventListener('pointermove',event=>{
      const rect=instrument.getBoundingClientRect();
      const x=((event.clientX-rect.left)/rect.width)*100;
      const y=((event.clientY-rect.top)/rect.height)*100;
      instrument.style.setProperty('--rosa-pointer-x',`${Math.max(0,Math.min(100,x)).toFixed(1)}%`);
      instrument.style.setProperty('--rosa-pointer-y',`${Math.max(0,Math.min(100,y)).toFixed(1)}%`);
      instrument.classList.add('rosa-enhanced-pointer');
    },{passive:true});

    instrument.addEventListener('pointerleave',()=>{
      instrument.classList.remove('rosa-enhanced-pointer');
      instrument.style.removeProperty('--rosa-pointer-x');
      instrument.style.removeProperty('--rosa-pointer-y');
    });
  }

  const status=dialog.querySelector('[data-rosa-status]');
  if(status){
    const observer=new MutationObserver(()=>{
      const value=(status.textContent||'').trim();
      dialog.dataset.rosaEnhancedState=value||'repòs';
    });
    observer.observe(status,{childList:true,characterData:true,subtree:true});
    dialog.dataset.rosaEnhancedState=(status.textContent||'').trim()||'repòs';
  }

  dialog.addEventListener('close',()=>{
    instrument.classList.remove('rosa-enhanced-pointer');
    instrument.style.removeProperty('--rosa-pointer-x');
    instrument.style.removeProperty('--rosa-pointer-y');
  });

  window.dispatchEvent(new CustomEvent('rosa:enhanced-ready',{
    detail:{version:'1.0.0',keyboard:true,pointer:!reduceMotion}
  }));
})();
