(()=>{
'use strict';
const MEMORY_KEY='animic-protein-memoria-radicum-v1';
const LEX_KEY='animic-protein-lex-radicum-v1';
const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
const write=value=>{try{localStorage.setItem(LEX_KEY,JSON.stringify(value.slice(-24)))}catch{}};
const eligible=pattern=>pattern?.state==='observed'&&pattern?.evidence&&Object.values(pattern.evidence).every(Boolean);
const legislate=()=>{
 const patterns=read(MEMORY_KEY);
 const previous=read(LEX_KEY);
 const now=new Date().toISOString();
 const active=[];
 patterns.filter(eligible).forEach(pattern=>{
  const old=previous.find(law=>law.patternId===pattern.id);
  active.push({
   id:old?.id||`lex-${pattern.key}`,
   patternId:pattern.id,
   key:pattern.key,
   title:`Lex Radicum · ${pattern.label}`,
   principle:`Quan ${pattern.label} reapareix de manera traçable i supera Probatio Radicum, el Còdex el reconeix com a principi provisional actiu fins que perdi evidència o reversibilitat.`,
   evidence:pattern.evidence,
   support:pattern.count,
   seeds:pattern.seeds||[],
   status:'active',
   version:Math.max(1,Number(old?.version)||1),
   enactedAt:old?.enactedAt||now,
   lastConfirmedAt:now,
   reversible:true,
   authority:'auto-radicum'
  });
 });
 const dormant=previous.filter(law=>!active.some(next=>next.id===law.id)).map(law=>({...law,status:'dormant',reversible:true,dormantAt:law.dormantAt||now}));
 const laws=[...dormant,...active].slice(-24);
 write(laws);
 window.AnimicLexRadicum={laws,legislate};
 window.dispatchEvent(new CustomEvent('codex:lex-radicum-updated',{detail:{laws,active:active.length}}));
 active.filter(law=>!previous.some(old=>old.id===law.id&&old.status==='active')).forEach(law=>window.dispatchEvent(new CustomEvent('codex:auto-legislated',{detail:law})));
 return laws;
};
window.addEventListener('codex:probatio-radicum',legislate);
legislate();
})();
