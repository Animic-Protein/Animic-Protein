(() => {
  'use strict';

  const GERM_KEY='animic-protein-germina-v2';
  const SEED_KEY='animic-protein-seed-memory-v1';
  const MEMORY_KEY='animic-protein-inter-nos-v2';
  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value,limit)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-limit)))}catch{}};
  const label=g=>String(g?.title||g?.id||'germen').replace(/^Llavor\s*·\s*/i,'').slice(0,100);

  const snapshot=()=>{
    const germs=read(GERM_KEY),seeds=read(SEED_KEY),relations=read(MEMORY_KEY);
    const living=germs.filter(g=>g.life!=='compost');
    const compost=germs.filter(g=>g.life==='compost');
    const dormant=living.filter(g=>(Number(g.uses)||0)===0);
    let state='equilibri';
    if(living.length>=10||seeds.length>=10||relations.length>=20)state='saturació';
    else if(dormant.length>=4)state='latència';
    else if(compost.length>=2&&living.length<=2)state='regeneració';
    return {germs,seeds,relations,living,compost,dormant,state};
  };

  const balance=()=>{
    const s=snapshot();
    const candidate=s.dormant.slice().sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||'')))[0];
    if(!candidate)return null;
    const now=new Date().toISOString();
    write(GERM_KEY,s.germs.map(g=>g.id===candidate.id?{...g,life:'compost',updatedAt:now,homeostasisAt:now}:g),24);
    window.dispatchEvent(new Event('resize'));
    return candidate;
  };

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');
    if(!panel)return null;
    let box=panel.querySelector('.homeostasis-panel');
    if(!box){
      box=document.createElement('div');
      box.className='homeostasis-panel';
      box.style.cssText='border-top:1px solid var(--line);margin-top:.9rem;padding-top:.9rem';
      panel.appendChild(box);
    }
    return box;
  };

  const render=()=>{
    const box=ensurePanel();if(!box)return;
    const s=snapshot();
    const note={
      'equilibri':'El Còdex respira sense pressió detectable.',
      'saturació':'Hi ha molta matèria activa. Pot convenir compostar abans de seguir sembrant.',
      'latència':'Hi ha diversos germens sense relacions. Un d’ells pot tornar al compost per alliberar espai.',
      'regeneració':'Predomina el compost: és un bon moment per metabolitzar i tornar a sembrar.'
    }[s.state];
    box.innerHTML=`<p class="memory-title">Pols vital · Homeòstasi</p><p class="memory-empty">${note}</p><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.4rem;margin-top:.65rem;font-size:.78rem"><span>${s.living.length}<br><small>vius</small></span><span>${s.compost.length}<br><small>compost</small></span><span>${s.seeds.length}<br><small>llavors</small></span><span>${s.relations.length}<br><small>relacions</small></span></div><p class="homeostasis-state" style="margin:.7rem 0 0;color:var(--metal)">Estat: ${s.state}</p>`;
    if(s.dormant.length){
      const button=document.createElement('button');
      button.type='button';button.className='grow-germ homeostasis-balance';button.textContent='Equilibra';
      button.setAttribute('aria-label','Retorna al compost el germen latent més antic');
      button.addEventListener('click',()=>{
        const moved=balance();
        const output=document.getElementById('relation-output');
        if(output&&moved)output.innerHTML=`<strong>Homeòstasi</strong><br>«${label(moved)}» torna al compost perquè el sistema recuperi espai.`;
        render();
      });
      box.appendChild(button);
    }
  };

  const panel=document.getElementById('node-panel');
  if(!panel)return;
  const observer=new MutationObserver(()=>window.setTimeout(render,0));
  observer.observe(panel,{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',()=>window.setTimeout(render,0));
  window.addEventListener('storage',render);
  render();
})();
