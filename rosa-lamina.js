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
  instrument.prepend(star);
  [['n','NORD'],['e','EST'],['s','SUD'],['o','OEST']].forEach(([pos,label])=>{
    const mark=document.createElement('span');mark.className='rosa-cardinal '+pos;mark.textContent=label;mark.setAttribute('aria-hidden','true');instrument.appendChild(mark);
  });
  center.innerHTML='<span class="rosa-center-emblem" aria-hidden="true">♧</span><span class="rosa-center-label">CENTRE · ORIGEN</span>';
  dialog.classList.add('rosa-lamina-ready');
})();
