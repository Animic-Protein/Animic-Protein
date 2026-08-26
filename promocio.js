(() => {
  'use strict';

  const promoCss=document.createElement('link');promoCss.rel='stylesheet';promoCss.href='promocio.css';document.head.appendChild(promoCss);

  const GERM_KEY='animic-protein-germina-v2';
  const CANON_KEY='animic-protein-canon-local-v1';
  const MIN_RELATIONS=2;

  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value,limit=24)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-limit)))}catch{}};
  const clean=(v,max=180)=>typeof v==='string'?v.replace(/[<>\u0000-\u001f\u007f]/g,'').trim().slice(0,max):'';
  const stripSeed=v=>clean(v,120).replace(/^Llavor\s*·\s*/i,'');
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};

  const readGerms=()=>read(GERM_KEY);
  const writeGerms=value=>write(GERM_KEY,value,24);
  const readCanon=()=>read(CANON_KEY);
  const writeCanon=value=>write(CANON_KEY,value,24);

  const activeGerm=()=>{
    const id=document.querySelector('#living-map [data-node].is-active')?.dataset?.node;
    if(!id)return null;
    return readGerms().find(g=>g.id===id)||null;
  };

  const eligibility=g=>{
    if(!g)return {ok:false,reason:'Selecciona un node germinat.'};
    if(g.life!=='arrelat')return {ok:false,reason:'Només un node Arrelat pot demanar entrada al cànon.'};
    const uses=Math.max(0,Number(g.uses)||0);
    if(uses<MIN_RELATIONS)return {ok:false,reason:`Calen almenys ${MIN_RELATIONS} relacions viscudes; ara en té ${uses}.`};
    return {ok:true,reason:'Compleix arrelament i relació mínima.'};
  };

  const canonicalize=g=>{
    const e=eligibility(g);if(!e.ok)return null;
    const existing=readCanon().find(x=>x.sourceGermId===g.id);
    if(existing)return existing;
    const now=new Date().toISOString();
    const canonicalId=`canon-${hash(g.id)}`;
    const entry={
      id:canonicalId,
      sourceGermId:g.id,
      sourceRelationId:g.sourceRelationId||null,
      title:stripSeed(g.title)||'Node emergent',
      desc:clean(g.desc||'Forma arrelada nascuda dins del Còdex.',360),
      aId:g.aId||null,
      bId:g.bId||null,
      uses:Math.max(0,Number(g.uses)||0),
      promotedAt:now,
      scope:'local'
    };
    writeCanon([...readCanon(),entry]);
    writeGerms(readGerms().map(x=>x.id===g.id?{...x,promoted:true,canonicalId,promotedAt:now}:x));
    render();
    try{window.dispatchEvent(new CustomEvent('animic:canonicalized',{detail:entry}))}catch{}
    return entry;
  };

  const ensureLayer=()=>{
    if(!map)return null;
    let layer=map.querySelector('.canon-emergent-layer');
    if(!layer){
      layer=document.createElement('div');
      layer.className='canon-emergent-layer';
      layer.setAttribute('aria-label','Nodes consagrats del Còdex');
      map.appendChild(layer);
    }
    return layer;
  };

  const ensurePanel=()=>{
    if(!nodePanel)return null;
    let box=nodePanel.querySelector('.canonical-promotion-panel');
    if(!box){
      box=document.createElement('div');
      box.className='canonical-promotion-panel';
      nodePanel.appendChild(box);
    }
    return box;
  };

  const pos=(entry,index)=>{
    const total=Math.max(1,readCanon().length);
    const angle=((index/total)*Math.PI*1.35)+(Math.PI*.82);
    const rx=36,ry=31;
    return {left:50+Math.cos(angle)*rx,top:48+Math.sin(angle)*ry};
  };

  const renderLayer=()=>{
    const layer=ensureLayer();if(!layer)return;
    layer.innerHTML='';
    readCanon().forEach((entry,index)=>{
      const p=pos(entry,index);
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='canonical-emergent-node';
      btn.dataset.node=entry.id;
      btn.dataset.title=entry.title;
      btn.dataset.desc=`${entry.desc} · Genealogia: ${entry.sourceGermId}.`;
      btn.style.left=`${p.left}%`;
      btn.style.top=`${p.top}%`;
      const mark=document.createElement('span');mark.className='canon-mark';mark.textContent='✺';
      const strong=document.createElement('strong');strong.textContent=entry.title;
      const small=document.createElement('small');small.textContent='node consagrat · cànon local';
      btn.append(mark,strong,small);
      btn.addEventListener('click',()=>activateNode(btn));
      layer.appendChild(btn);
    });
    requestAnimationFrame(drawRelations);
  };

  const renderPanel=()=>{
    const box=ensurePanel();if(!box)return;
    const g=activeGerm();
    if(!g){box.innerHTML='';return}
    const e=eligibility(g);
    const promoted=readCanon().find(x=>x.sourceGermId===g.id);
    box.innerHTML='<p class="memory-title">Promoció canònica</p>';
    const status=document.createElement('p');
    status.className='memory-empty';
    status.textContent=promoted
      ? `Consagrat com «${promoted.title}». La genealogia continua vinculada al node d’origen.`
      : e.reason;
    box.appendChild(status);

    if(promoted){
      const badge=document.createElement('span');
      badge.className='canon-status-badge';
      badge.textContent='Cànon local';
      box.appendChild(badge);
      return;
    }

    const button=document.createElement('button');
    button.type='button';
    button.className='grow-germ canon-promote';
    button.textContent='Consagrar al Còdex';
    button.disabled=!e.ok;
    button.addEventListener('click',()=>{
      const current=activeGerm();
      const entry=canonicalize(current);
      if(relationOutput&&entry){
        relationOutput.innerHTML=`<strong>Promoció canònica</strong><br>«${entry.title}» entra com a node consagrat del teu mapa, sense perdre la genealogia.`;
      }
      renderPanel();
    });
    box.appendChild(button);

    const note=document.createElement('p');
    note.className='canon-scope-note';
    note.textContent='Aquesta consagració és persistent en aquest navegador. La promoció global del Còdex continua exigint una edició del repositori.';
    box.appendChild(note);
  };

  const render=()=>{renderLayer();renderPanel()};

  const panel=document.getElementById('node-panel');
  if(panel)window.addEventListener('animic:node-activated',()=>window.setTimeout(renderPanel,0));
  window.addEventListener('animic:canonicalized',render);
  window.addEventListener('storage',render);
  window.addEventListener('resize',()=>window.setTimeout(renderLayer,0));
  window.addEventListener('orientationchange',()=>window.setTimeout(renderLayer,220));
  render();
})();
