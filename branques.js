(() => {
  'use strict';

  const branchCss=document.createElement('link');branchCss.rel='stylesheet';branchCss.href='branques.css';document.head.appendChild(branchCss);

  const CANON_KEY='animic-protein-canon-local-v1';
  const BRANCH_KEY='animic-protein-branches-v1';

  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value,limit=18)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-limit)))}catch{}};
  const clean=(v,max=220)=>typeof v==='string'?v.replace(/[<>\\u0000-\\u001f\\u007f]/g,'').trim().slice(0,max):'';
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};

  const canons=()=>read(CANON_KEY);
  const branches=()=>read(BRANCH_KEY);
  const saveBranches=value=>write(BRANCH_KEY,value,18);

  const activeId=()=>document.querySelector('#living-map [data-node].is-active')?.dataset?.node||null;
  const activeCanon=()=>canons().find(x=>x.id===activeId())||null;
  const activeBranch=()=>branches().find(x=>x.id===activeId())||null;

  const constitutionFor=root=>{
    const origin=root.aId&&root.bId?`${root.aId} ↔ ${root.bId}`:(root.sourceRelationId||root.sourceGermId||'origen viu');
    return [
      {id:'origen',label:'I · Origen',text:`Aquesta branca declara el seu naixement en ${clean(origin,120)} i conserva la genealogia del node «${clean(root.title,90)}».`},
      {id:'relacio',label:'II · Relació',text:'Cap descendent serà admès si no manté almenys una relació significativa amb la branca o amb un dels seus membres.'},
      {id:'transformacio',label:'III · Transformació',text:'Cada incorporació haurà de fer perceptible què transforma: una pràctica, una regla, una lectura o una relació del Còdex.'},
      {id:'mutacio',label:'IV · Mutació',text:'La branca no es considera definitiva: pot canviar de forma, dividir-se o retornar part del seu material al compost sense perdre la traça.'}
    ];
  };

  const foundBranch=root=>{
    if(!root)return null;
    const old=branches().find(b=>b.rootId===root.id);
    if(old)return old;
    const now=new Date().toISOString();
    const entry={
      id:`branca-${hash(root.id)}`,
      rootId:root.id,
      title:`Branca · ${clean(root.title,90)}`,
      desc:`Branca consagrada nascuda del node «${clean(root.title,100)}».`,
      members:[root.id],
      constitution:constitutionFor(root),
      createdAt:now,
      updatedAt:now,
      scope:'local'
    };
    saveBranches([...branches(),entry]);
    try{window.dispatchEvent(new CustomEvent('animic:branch-founded',{detail:entry}))}catch{}
    render();
    return entry;
  };

  const graft=(branchId,canonId)=>{
    const list=branches(),branch=list.find(b=>b.id===branchId),canon=canons().find(c=>c.id===canonId);
    if(!branch||!canon)return null;
    const members=Array.from(new Set([...(branch.members||[]),canon.id]));
    const updated={...branch,members,updatedAt:new Date().toISOString()};
    saveBranches(list.map(b=>b.id===branchId?updated:b));
    render();
    return updated;
  };

  const ensureLayer=()=>{
    if(!map)return null;
    let layer=map.querySelector('.branch-layer');
    if(!layer){layer=document.createElement('div');layer.className='branch-layer';layer.setAttribute('aria-label','Branques consagrades');map.appendChild(layer)}
    return layer;
  };

  const ensurePanel=()=>{
    if(!nodePanel)return null;
    let box=nodePanel.querySelector('.branch-panel');
    if(!box){box=document.createElement('div');box.className='branch-panel';nodePanel.appendChild(box)}
    return box;
  };

  const position=(index,total)=>{
    const angle=((index/Math.max(1,total))*Math.PI*1.25)+(Math.PI*.18);
    return {left:50+Math.cos(angle)*41,top:48+Math.sin(angle)*36};
  };

  const renderLayer=()=>{
    const layer=ensureLayer();if(!layer)return;
    layer.innerHTML='';
    const list=branches();
    list.forEach((branch,index)=>{
      const p=position(index,list.length),btn=document.createElement('button');
      btn.type='button';btn.className='branch-node';btn.dataset.node=branch.id;btn.dataset.title=branch.title;btn.dataset.desc=`${branch.desc} · ${branch.members?.length||0} membres.`;
      btn.style.left=`${p.left}%`;btn.style.top=`${p.top}%`;
      const mark=document.createElement('span');mark.className='branch-mark';mark.textContent='⌁';
      const strong=document.createElement('strong');strong.textContent=branch.title.replace(/^Branca\\s*·\\s*/,'');
      const small=document.createElement('small');small.textContent=`branca · ${branch.members?.length||0} descendents`;
      btn.append(mark,strong,small);btn.addEventListener('click',()=>activateNode(btn));layer.appendChild(btn);
    });
    requestAnimationFrame(drawRelations);
  };

  const appendConstitution=(box,branch)=>{
    const details=document.createElement('details');details.className='branch-constitution';
    const summary=document.createElement('summary');summary.textContent='Constitució viva';
    details.appendChild(summary);
    (branch.constitution||[]).forEach(article=>{
      const section=document.createElement('section');
      const strong=document.createElement('strong');strong.textContent=article.label;
      const p=document.createElement('p');p.textContent=article.text;
      section.append(strong,p);details.appendChild(section);
    });
    box.appendChild(details);
  };

  const renderPanel=()=>{
    const box=ensurePanel();if(!box)return;
    const canon=activeCanon(),branch=activeBranch();
    box.innerHTML='';

    if(branch){
      const title=document.createElement('p');title.className='memory-title';title.textContent='Branca consagrada';box.appendChild(title);
      const status=document.createElement('p');status.className='memory-empty';status.textContent=`${branch.members?.length||0} membres · arrel ${branch.rootId}`;box.appendChild(status);
      appendConstitution(box,branch);
      return;
    }

    if(!canon)return;
    const title=document.createElement('p');title.className='memory-title';title.textContent='Descendència canònica';box.appendChild(title);
    const own=branches().find(b=>b.rootId===canon.id);
    const status=document.createElement('p');status.className='memory-empty';
    status.textContent=own?`Aquest node és l’arrel de «${own.title}».`:'Aquest node consagrat encara no ha fundat cap branca.';
    box.appendChild(status);

    if(!own){
      const found=document.createElement('button');found.type='button';found.className='grow-germ branch-found';found.textContent='Fundar una branca';
      found.addEventListener('click',()=>{
        const root=activeCanon(),created=foundBranch(root);
        if(relationOutput&&created)relationOutput.innerHTML=`<strong>Nova branca</strong><br>«${created.title}» neix amb constitució, genealogia i capacitat de descendència.`;
      });
      box.appendChild(found);
    }else{
      const badge=document.createElement('span');badge.className='branch-badge';badge.textContent='Arrel de branca';box.appendChild(badge);
    }

    const available=branches().filter(b=>!(b.members||[]).includes(canon.id));
    if(available.length){
      const graftBox=document.createElement('div');graftBox.className='branch-graft';
      const select=document.createElement('select');select.setAttribute('aria-label','Branca on empeltar el node');
      available.forEach(b=>{const o=document.createElement('option');o.value=b.id;o.textContent=b.title;select.appendChild(o)});
      const graftButton=document.createElement('button');graftButton.type='button';graftButton.className='grow-germ';graftButton.textContent='Empeltar en branca';
      graftButton.addEventListener('click',()=>{
        const current=activeCanon(),updated=graft(select.value,current?.id);
        if(relationOutput&&updated)relationOutput.innerHTML=`<strong>Empelt canònic</strong><br>«${current.title}» entra a «${updated.title}». La branca té ara ${updated.members.length} membres.`;
      });
      graftBox.append(select,graftButton);box.appendChild(graftBox);
    }

    const note=document.createElement('p');note.className='branch-note';note.textContent='Les branques són cànon local del navegador: la seva constitució i descendència queden traçades, però la incorporació global continua sent editorial.';box.appendChild(note);
  };

  const render=()=>{renderLayer();renderPanel()};

  const panel=document.getElementById('node-panel');
  if(panel){
    const observer=new MutationObserver(()=>window.setTimeout(renderPanel,0));
    observer.observe(panel,{childList:true,subtree:true,characterData:true});
    panel.addEventListener('click',()=>window.setTimeout(renderPanel,0));
  }
  window.addEventListener('animic:canonicalized',render);
  window.addEventListener('animic:branch-founded',render);
  window.addEventListener('storage',render);
  window.addEventListener('resize',()=>window.setTimeout(renderLayer,0));
  window.addEventListener('orientationchange',()=>window.setTimeout(renderLayer,220));
  render();
})();