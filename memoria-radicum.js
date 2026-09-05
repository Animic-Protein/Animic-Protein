(()=>{
  'use strict';
  const SEED_KEY='animic-protein-seed-memory-v1';
  const MEMORY_KEY='animic-protein-memoria-radicum-v1';
  const MIN_RECURRENCES=3;
  const PUBLISHED_PATTERNS=[{
    id:'radix-absencia-dirigeix-temps',
    key:'absencia-dirigeix-temps',
    label:'Absència que dirigeix el temps',
    count:2,
    cases:[
      {id:'beta-01',title:'β·01 · Error fèrtil I',returnInstrument:'Compost'},
      {id:'beta-02',title:'β·02 · La direcció que desapareix',returnInstrument:'Cambra nua del temps'}
    ],
    statement:'Quan una continuïtat desapareix, el temps no queda buit: el seu rastre modifica l’escolta i la decisió següent.',
    state:'emergent',
    supportType:'real-cases',
    constitutional:false,
    returnInstrument:'Centre'
  }];
  const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value.slice(-24)))}catch{}};
  const token=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const lineage=seed=>[seed?.originA,seed?.originB].filter(Boolean).map(x=>({key:token(x.key||x.label),label:String(x.label||x.key||'Node')}));

  const analyse=()=>{
    const seeds=read(SEED_KEY).filter(seed=>seed?.kind==='inter-nos'&&seed?.id);
    const counts=new Map();
    seeds.forEach(seed=>lineage(seed).forEach(node=>{
      if(!node.key)return;
      const item=counts.get(node.key)||{key:node.key,label:node.label,seeds:new Map()};
      item.seeds.set(seed.id,seed.createdAt||null);counts.set(node.key,item);
    }));
    const previous=read(MEMORY_KEY);
    const now=new Date().toISOString();
    const active=[...counts.values()].filter(item=>item.seeds.size>=MIN_RECURRENCES).map(item=>{
      const old=previous.find(p=>p.key===item.key);
      const seedIds=[...item.seeds.keys()];
      const dates=[...item.seeds.values()].filter(Boolean).sort();
      return {key:item.key,label:item.label,count:seedIds.length,seeds:seedIds,id:`radix-${item.key}`,state:old?.state==='dormant'?'emergent':old?.state||'emergent',firstSeenAt:old?.firstSeenAt||dates[0]||now,lastSeenAt:dates.at(-1)||now};
    });
    const published=PUBLISHED_PATTERNS.map(pattern=>{
      const old=previous.find(item=>item.id===pattern.id);
      return {...pattern,firstSeenAt:old?.firstSeenAt||now,lastSeenAt:now,threshold:MIN_RECURRENCES};
    });
    const reserved=new Set(published.map(pattern=>pattern.id));
    const dormant=previous.filter(old=>!reserved.has(old.id)&&!active.some(item=>item.id===old.id)).map(old=>({...old,state:'dormant',dormantAt:old.dormantAt||now}));
    const patterns=[...dormant,...active.filter(item=>!reserved.has(item.id)),...published].slice(-24);
    write(MEMORY_KEY,patterns);
    window.AnimicMemoriaRadicum={patterns,threshold:MIN_RECURRENCES,analyse};
    window.dispatchEvent(new CustomEvent('codex:radicum-updated',{detail:{patterns,threshold:MIN_RECURRENCES}}));
    return patterns;
  };

  window.addEventListener('codex:seed-created',analyse);
  window.addEventListener('storage',event=>{if(event.key===SEED_KEY)analyse();});
  analyse();
})();
