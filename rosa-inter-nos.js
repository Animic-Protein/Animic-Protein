(()=>{
  const dialog=document.getElementById('rosa');
  if(!dialog) return;
  const consoleEl=dialog.querySelector('.rosa-console');
  if(!consoleEl) return;

  if(!document.getElementById('rosa-inter-nos-styles')){
    const link=document.createElement('link');
    link.id='rosa-inter-nos-styles';
    link.rel='stylesheet';
    link.href='./rosa-inter-nos.css';
    document.head.appendChild(link);
  }

  const selected=[];
  const selectedElements=[];
  const normalize=el=>({
    label:(el.dataset?.title||el.textContent||'Node').trim().replace(/\s+/g,' '),
    key:(el.dataset?.node||el.dataset?.rosaKey||el.textContent||'node').trim().toLowerCase().replace(/\s+/g,'-')
  });

  const panel=document.createElement('section');
  panel.className='rosa-inter-nos';
  panel.hidden=true;
  panel.setAttribute('aria-live','polite');
  panel.innerHTML=`
    <p class="kicker">INTER NOS · Relació activa</p>
    <h3 data-inter-nos-title>Dos nodes, una tercera cosa</h3>
    <p data-inter-nos-output></p>
    <div class="rosa-inter-nos-actions">
      <button type="button" data-inter-nos-clear>Netejar relació</button>
    </div>`;
  consoleEl.appendChild(panel);

  const output=panel.querySelector('[data-inter-nos-output]');
  const title=panel.querySelector('[data-inter-nos-title]');
  const clear=panel.querySelector('[data-inter-nos-clear]');

  const relationText=(a,b)=>{
    const seed=[
      `Què canvia en ${a.label} quan és escoltat des de ${b.label}?`,
      `${a.label} aporta forma; ${b.label} aporta desviació. Conserva només la diferència perceptible.`,
      `Fes una prova reversible: deixa que ${a.label} imposi una regla i que ${b.label} la contradigui una sola vegada.`,
      `Busca el tercer element que només apareix quan ${a.label} i ${b.label} coexisteixen.`
    ];
    const hash=[...`${a.key}|${b.key}`].reduce((n,c)=>n+c.charCodeAt(0),0);
    return seed[hash%seed.length];
  };

  const render=()=>{
    dialog.querySelectorAll('.is-inter-nos-selected').forEach(el=>el.classList.remove('is-inter-nos-selected'));
    selectedElements.forEach(el=>el?.isConnected&&el.classList.add('is-inter-nos-selected'));
    if(!selected.length){
      panel.hidden=true;
      return;
    }
    panel.hidden=false;
    if(selected.length===1){
      title.textContent=`${selected[0].label} + …`;
      output.textContent='Tria un segon node de la Rosa. INTER NOS no suma: posa dues realitats en tensió perquè aparegui una tercera relació.';
      return;
    }
    const [a,b]=selected;
    title.textContent=`${a.label} ↔ ${b.label}`;
    output.textContent=relationText(a,b);
    dialog.dispatchEvent(new CustomEvent('rosa:inter-nos',{detail:{a,b}}));
  };

  const addNode=el=>{
    const node=normalize(el);
    if(selected.some(x=>x.key===node.key)) return;
    if(selected.length===2){selected.shift();selectedElements.shift();}
    selected.push(node);
    selectedElements.push(el);
    render();
  };

  dialog.addEventListener('click',event=>{
    const el=event.target.closest?.('.rosa-satellite, .rosa-branch');
    if(!el) return;
    window.setTimeout(()=>addNode(el),0);
  });

  clear.addEventListener('click',()=>{
    selected.length=0;
    selectedElements.length=0;
    render();
    const status=dialog.querySelector('[data-rosa-status]');
    if(status) status.textContent='INTER NOS · relació netejada';
  });

  dialog.addEventListener('close',()=>{
    selected.length=0;
    selectedElements.length=0;
    render();
  });

  window.dispatchEvent(new CustomEvent('rosa:inter-nos-ready',{detail:{version:'1.0.0'}}));
})();
