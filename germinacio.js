(() => {
  const germCss=document.createElement('link');germCss.rel='stylesheet';germCss.href='germinacio.css';document.head.appendChild(germCss);
  const GERM_KEY='animic-protein-germina-v2';
  const LIFE=['germen','brot','arrelat','compost'];
  const lifeLabels={germen:'Germen',brot:'Brot',arrelat:'Arrelat',compost:'Compost'};
  const readGerms=()=>{try{const v=JSON.parse(localStorage.getItem(GERM_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const writeGerms=v=>{try{localStorage.setItem(GERM_KEY,JSON.stringify(v.slice(-24)))}catch{}};
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};
  const germinate=entry=>{
    if(!entry)return null;
    const germs=readGerms();
    const old=germs.find(g=>g.sourceRelationId===entry.id);
    if(old)return old;
    const germ={id:`germen-${hash(entry.id)}`,sourceRelationId:entry.id,title:`Llavor · ${entry.title}`,desc:`Nascuda d’INTER NOS entre «${entry.a}» i «${entry.b}». ${entry.action||'Aquesta llavor encara busca la seva primera forma.'}`,aId:entry.aId,bId:entry.bId,life:'germen',uses:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    writeGerms([...germs,germ]);
    return germ;
  };
  const ensureLayer=()=>{
    if(!map)return null;
    let layer=map.querySelector('.germ-layer');
    if(!layer){layer=document.createElement('div');layer.className='germ-layer';layer.setAttribute('aria-label','Llavors germinades');map.appendChild(layer)}
    return layer;
  };
  const nodeCenter=n=>{const m=map.getBoundingClientRect(),r=n.getBoundingClientRect();return{x:r.left-m.left+r.width/2,y:r.top-m.top+r.height/2}};
  const position=(g,index)=>{
    const a=map?.querySelector(`[data-node="${g.aId}"]`),b=map?.querySelector(`[data-node="${g.bId}"]`);
    if(!a||!b)return{left:50,top:50};
    const p1=nodeCenter(a),p2=nodeCenter(b),w=map.clientWidth,h=map.clientHeight,n=parseInt(hash(g.id),36)||1,offset=(n%61)-30;
    return{left:Math.max(8,Math.min(92,((p1.x+p2.x)/2+offset)/w*100)),top:Math.max(12,Math.min(88,((p1.y+p2.y)/2-54-(index%3)*18)/h*100))};
  };
  const updateGerm=(id,patch)=>{
    const next=readGerms().map(g=>g.id===id?{...g,...patch,updatedAt:new Date().toISOString()}:g);
    writeGerms(next);render();
    return next.find(g=>g.id===id);
  };
  const grow=id=>{
    const g=readGerms().find(x=>x.id===id);if(!g)return;
    const i=Math.max(0,LIFE.indexOf(g.life||'germen'));
    const next=LIFE[Math.min(i+1,LIFE.length-1)];
    const evolved=updateGerm(id,{life:next});
    if(relationOutput&&evolved)relationOutput.innerHTML=`<strong>Mutatio vital</strong><br>«${evolved.title}» passa a estat <em>${lifeLabels[next]}</em>.`;
  };
  const incrementUse=id=>{const g=readGerms().find(x=>x.id===id);if(g)updateGerm(id,{uses:(g.uses||0)+1})};
  const ensureLifePanel=()=>{
    if(!nodePanel)return null;
    let box=nodePanel.querySelector('.germ-life-panel');
    if(!box){box=document.createElement('div');box.className='germ-life-panel';nodePanel.appendChild(box)}
    return box;
  };
  const showLife=g=>{
    const box=ensureLifePanel();if(!box)return;
    if(!g){box.innerHTML='';return}
    const life=g.life||'germen';
    box.innerHTML=`<p class="memory-title">Cicle vital</p><div class="life-row"><span class="life-badge life-${life}">${lifeLabels[life]}</span><span class="life-uses">${g.uses||0} relacions</span></div><button type="button" class="grow-germ" ${life==='compost'?'disabled':''}>${life==='compost'?'Retornat al compost':'Fer créixer'}</button><p class="life-lineage">Origen: ${g.aId} ↔ ${g.bId}</p>`;
    box.querySelector('.grow-germ')?.addEventListener('click',()=>grow(g.id));
  };
  const render=()=>{
    const layer=ensureLayer();if(!layer)return;
    layer.innerHTML='';
    readGerms().forEach((g,index)=>{
      const p=position(g,index),btn=document.createElement('button'),life=g.life||'germen';
      btn.type='button';btn.className=`germinated-node life-${life}`;btn.dataset.node=g.id;btn.dataset.title=g.title;btn.dataset.desc=g.desc;btn.style.left=`${p.left}%`;btn.style.top=`${p.top}%`;
      const mark=document.createElement('span');mark.className='germ-mark';mark.textContent=life==='germen'?'✦':life==='brot'?'❖':life==='arrelat'?'✺':'·';
      const strong=document.createElement('strong');strong.textContent=g.title;
      const small=document.createElement('small');small.textContent=`${lifeLabels[life]} · ${g.uses||0} relacions`;
      btn.append(mark,strong,small);btn.addEventListener('click',()=>{activateNode(btn);showLife(g)});layer.appendChild(btn);
    });
    requestAnimationFrame(drawRelations);
  };
  const originalActivateNode=activateNode;
  activateNode=(n)=>{
    originalActivateNode(n);
    const g=readGerms().find(x=>x.id===n?.dataset?.node);
    showLife(g||null);
  };
  const originalRemember=remember;
  remember=(a,b,r)=>{
    const entry=originalRemember(a,b,r);
    [a,b].forEach(n=>{if(n?.dataset?.node?.startsWith('germen-'))incrementUse(n.dataset.node)});
    return entry;
  };
  const originalChangeState=changeState;
  changeState=(id,state)=>{
    originalChangeState(id,state);
    if(state==='sembrada'){
      const entry=readMemory().find(x=>x.id===id),germ=germinate(entry);
      if(relationOutput&&germ)relationOutput.textContent=`Germinació · «${entry.title}» ha produït el node «${germ.title}».`;
    }
    render();
  };
  readMemory().filter(x=>x.state==='sembrada').forEach(germinate);
  render();
  window.addEventListener('resize',()=>requestAnimationFrame(render));
  window.addEventListener('orientationchange',()=>setTimeout(render,180));
})();
