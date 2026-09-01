(() => {
  'use strict';
  const css=document.createElement('link');
  css.rel='stylesheet';css.href='./vortex-ant.css';document.head.appendChild(css);

  const layer=document.createElement('div');
  layer.className='vortex-ant-layer';
  layer.setAttribute('aria-hidden','true');
  const ant=document.createElement('div');
  ant.className='vortex-ant';
  ant.innerHTML='<svg viewBox="0 0 84 52" aria-hidden="true"><g fill="currentColor"><ellipse cx="19" cy="27" rx="11" ry="9"/><ellipse cx="41" cy="25" rx="13" ry="11"/><ellipse cx="65" cy="23" rx="12" ry="10"/></g><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M11 18 3 9M15 18 10 5"/><g class="leg"><path d="M29 31 17 43M36 34 31 49M48 34 53 48M55 30 70 42"/></g><path d="M70 16 79 8M71 18 82 15"/></g></svg>';
  const breach=document.createElement('div');breach.className='vortex-breach';
  layer.append(ant,breach);
  const whisper=document.createElement('div');
  whisper.className='vortex-ant-whisper';
  whisper.setAttribute('role','status');
  whisper.setAttribute('aria-live','polite');
  document.body.append(layer,whisper);

  let crossing=false,turn=0;
  const guide=detail=>{
    if(crossing)return;
    crossing=true;turn+=1;
    const reverse=turn%2===0;
    const y=24+Math.round(Math.random()*52);
    const x=68+Math.round(Math.random()*20);
    layer.style.setProperty('--breach-x',reverse?(100-x)+'vw':x+'vw');
    layer.style.setProperty('--breach-y',y+'vh');
    ant.style.setProperty('--ant-y',y+'vh');
    ant.style.setProperty('--ant-end',x+'vw');
    ant.style.setProperty('--ant-end-reverse','-'+x+'vw');
    ant.style.setProperty('--ant-end-reverse-final','-'+(x+30)+'vw');
    ant.classList.toggle('is-reverse',reverse);
    void ant.offsetWidth;
    ant.classList.add('is-crossing');
    breach.classList.add('is-open');
    const names=[detail?.a,detail?.b].filter(Boolean);
    whisper.textContent=names.length===2?'Bretxa trobada · ens hi aproximem':'La formiga troba una bretxa';
    whisper.classList.add('is-speaking');
    window.setTimeout(()=>{
      ant.classList.remove('is-crossing','is-reverse');
      breach.classList.remove('is-open');
      whisper.classList.remove('is-speaking');
      crossing=false;
    },5900);
  };
  window.addEventListener('animic:relation-found',event=>guide(event.detail||{}));
})();
