(()=>{
'use strict';
const MEMORY_KEY='animic-protein-memoria-radicum-v1';
const read=()=>{try{const v=JSON.parse(localStorage.getItem(MEMORY_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
const write=v=>{try{localStorage.setItem(MEMORY_KEY,JSON.stringify(v.slice(-24)))}catch{}};
const test=pattern=>{
 const seeds=Array.isArray(pattern.seeds)?[...new Set(pattern.seeds.filter(Boolean))]:[];
 const evidence={
  perceptibleDifference:pattern.state!=='dormant'&&pattern.count>=3,
  traceability:seeds.length>=3,
  relation:Boolean(pattern.key&&pattern.label&&seeds.length),
  reversibility:pattern.state!=='law'
 };
 const passed=Object.values(evidence).every(Boolean);
 const state=pattern.state==='dormant'?'dormant':passed?'observed':'emergent';
 const oldObserved=pattern.firstObservedAt;
 const now=new Date().toISOString();
 return {...pattern,evidence,state,firstObservedAt:state==='observed'?(oldObserved||now):oldObserved,lastEvaluatedAt:now};
};
const evaluate=()=>{
 const patterns=read().map(test);write(patterns);
 window.AnimicProbatioRadicum={patterns,evaluate,tests:['perceptibleDifference','traceability','relation','reversibility']};
 window.dispatchEvent(new CustomEvent('codex:probatio-radicum',{detail:{patterns}}));
 return patterns;
};
window.addEventListener('codex:radicum-updated',evaluate);
evaluate();
})();
