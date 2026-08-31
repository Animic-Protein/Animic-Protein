(()=>{
  'use strict';
  const SEED_KEY='animic-protein-seed-memory-v1';
  const MEMORY_KEY='animic-protein-memoria-radicum-v1';
  const MIN_RECURRENCES=3;
  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-24)))}catch{}};
  const token=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const lineage=seed=>[seed?.originA,seed?.originB].filter(Boolean).map(x=>({key:token(x.key||x.label),label:String(x.label||x.key||'Node')}));

  const analyse=()=>{
    const seeds=read(SEED_KEY).filter(seed=>seed?.kind==='inter-nos');
    const counts=new Map();
    seeds.forEach(seed=>lineage(seed).forEach(node=>{
      if(!node.key)return;
      const item=counts.get(node.key)||{key:node.key,label:node.label,count:0,seeds:[]};
      item.count+=1;item.seeds.push(seed.id);counts.set(node.key,item);
    }));
    const previous=read(MEMORY_KEY);
    const now=new Date().toISOString();
    const patterns=[...counts.values()].filter(item=>item.count>=MIN_RECURRENCES).map(item=>{
      const old=previous.find(p=>p.key===item.key);
      return {...item,id:`radix-${item.key}`,state:old?.state||'emergent',firstSeenAt:old?.firstSeenAt||now,lastSeenAt:now};
    });
    write(MEMORY_KEY,patterns);
    window.AnimicMemoriaRadicum={patterns,threshold:MIN_RECURRENCES,analyse};
    window.dispatchEvent(new CustomEvent('codex:radicum-updated',{detail:{patterns,threshold:MIN_RECURRENCES}}));
    return patterns;
  };

  window.addEventListener('codex:seed-created',analyse);
  window.addEventListener('storage',event=>{if(event.key===SEED_KEY)analyse();});
  analyse();
})();
