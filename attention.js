(() => {
  'use strict';

  const GERM_KEY='animic-protein-germina-v2';
  const MEMORY_KEY='animic-protein-inter-nos-v2';
  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const panel=document.getElementById('node-panel');
  const map=document.getElementById('living-map');
  if(!panel||!map)return;

  const label=g=>String(g?.title||g?.id||'node').replace(/^Llavor\s*·\s*/i,'').slice(0,100);
  const candidate=()=>{
    const living=read(GERM_KEY).filter(g=>g&&g.life!=='compost');
    if(!living.length)return null;
    return living.slice().sort((a,b)=>{
      const ua=Number(a.uses)||0,ub=Number(b.uses)||0;
      if(ua!==ub)return ua-ub;
      return String(a.updatedAt||a.createdAt||'').localeCompare(String(b.updatedAt||b.createdAt||''));
    })[0]||null;
  };

  const ensureBox=()=>{
    let box=panel.querySelector('.attention-panel');
    if(!box){
      box=document.createElement('div');
      box.className='attention-panel';
      box.style.cssText='border-top:1px solid var(--line);margin-top:.9rem;padding-top:.9rem';
      panel.appendChild(box);
    }
    return box;
  };

  const focus=target=>{
    if(!target)return;
    const node=map.querySelector(`[data-node="${target.id}"]`);
    if(!node)return;
    node.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});
    window.setTimeout(()=>{
      node.click();
      node.focus({preventScroll:true});
    },220);
  };

  const render=()=>{
    const box=ensureBox();
    const target=candidate();
    const relations=read(MEMORY_KEY);
    if(!target){
      box.innerHTML='<p class="memory-title">Atenció</p><p class="memory-empty">Encara no hi ha cap germen viu que demani escolta.</p>';
      return;
    }
    const linked=relations.filter(r=>r?.aId===target.id||r?.bId===target.id).length;
    box.innerHTML=`<p class="memory-title">Atenció</p><p class="memory-empty">El Còdex no decideix per tu: només assenyala el node menys escoltat.</p><p style="margin:.55rem 0;color:var(--metal)">«${label(target)}» · ${linked} relacions</p><button type="button" class="grow-germ attention-focus">Escolta aquest node</button>`;
    box.querySelector('.attention-focus')?.addEventListener('click',()=>focus(target));
  };

  const observer=new MutationObserver(()=>window.setTimeout(render,0));
  observer.observe(panel,{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',()=>window.setTimeout(render,0));
  window.addEventListener('storage',render);
  render();
})();
