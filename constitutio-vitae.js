(()=>{
'use strict';
const LEX_KEY='animic-protein-lex-radicum-v1';
const CONSTITUTIO_KEY='animic-protein-constitutio-vitae-v1';
const read=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
const write=value=>{try{localStorage.setItem(CONSTITUTIO_KEY,JSON.stringify(value.slice(-24)))}catch{}};
const updateHistory=(old,type,detail,now)=>[...(old?.history||[]),{type,detail,at:now}].slice(-24);
const evaluate=()=>{
 const laws=read(LEX_KEY);
 const previous=read(CONSTITUTIO_KEY);
 const now=new Date().toISOString();
 const next=laws.map(law=>{
  const old=previous.find(item=>item.id===law.id);
  let status=law.status==='dormant'?'repealed':'active';
  let version=Math.max(1,Number(old?.version||law.version)||1);
  let history=old?.history||[];
  let contradictions=old?.contradictions||[];
  const support=Math.max(0,Number(law.support)||0);
  const traceable=Array.isArray(law.seeds)&&new Set(law.seeds.filter(Boolean)).size>=3;
  const valid=law.reversible===true&&traceable&&Object.values(law.evidence||{}).every(Boolean);

  if(old&&old.status==='active'&&status==='repealed')history=updateHistory(old,'repeal','Pèrdua de vigència o d’evidència suficient.',now);
  if(old&&old.status==='repealed'&&status==='active')history=updateHistory(old,'reactivation','Recupera evidència i torna a vigència.',now);
  if(status==='active'&&!valid){
    status='contested';
    if(old?.status!=='contested'){
      contradictions=[...contradictions,{id:`contra-${Date.now().toString(36)}`,reason:'La Lex activa ha perdut una de les garanties constitucionals.',at:now}].slice(-12);
      history=updateHistory(old,'contradiction','Garantia constitucional insuficient.',now);
    }
  }
  if(status==='active'&&old&&support>Math.max(0,Number(old.support)||0)+2){version+=1;history=updateHistory(old,'amendment',`Suport augmentat de ${old.support||0} a ${support}.`,now);}

  const item={...law,status,version,history,contradictions,constitutionAt:old?.constitutionAt||now,updatedAt:now};
  if(status==='repealed')item.repealedAt=old?.repealedAt||now;
  if(status==='contested')item.contestedAt=old?.contestedAt||now;
  if(version>(Number(old?.version)||1))item.amendedAt=now;
  return item;
 });
 write(next);
 window.AnimicConstitutioVitae={laws:next,evaluate};
 const byOld=id=>previous.find(x=>x.id===id);
 next.forEach(law=>{
  const old=byOld(law.id);
  if(!old||old.status===law.status&&old.version===law.version)return;
  const event=law.status==='contested'?'codex:lex-contested':law.status==='repealed'?'codex:lex-repealed':old&&law.version>old.version?'codex:lex-amended':'codex:lex-state-changed';
  window.dispatchEvent(new CustomEvent(event,{detail:law}));
 });
 window.dispatchEvent(new CustomEvent('codex:constitutio-vitae-updated',{detail:{laws:next}}));
 return next;
};
window.addEventListener('codex:lex-radicum-updated',evaluate);
evaluate();
})();
