(() => {
  'use strict';

  const KEYS={
    pressure:'animic-protein-branch-pressure-v1',
    homeo:'animic-protein-constitutional-homeostasis-v1',
    germs:'animic-protein-germina-v2',
    relations:'animic-protein-inter-nos-v2',
    temporal:'animic.codex.temporal-fragments/v1'
  };
  const readArray=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const readObject=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return{}}};
  const activePressure=()=>readArray(KEYS.pressure).reduce((best,p)=>Number(p?.score||0)>Number(best?.score||0)?p:best,{score:0,components:{}});
  const temporalRecords=()=>Object.values(readObject(KEYS.temporal));
  const hasMeaningfulTension=p=>((Number(p?.components?.conflicts)||0)+(Number(p?.components?.metabolism)||0)+(Number(p?.components?.compost)||0))>0;
  const homeostasisNeedsReobserve=()=>readArray(KEYS.homeo).some(h=>Number(h?.relief||0)>0&&Number(h?.pressureBasis||0)>0);
  const relationDensity=()=>{const living=readArray(KEYS.germs).filter(g=>g.life!=='compost');const ids=new Set(living.map(g=>g.id));const rel=readArray(KEYS.relations).filter(r=>[r?.aId,r?.bId,r?.sourceId,r?.targetId].some(id=>ids.has(id)));return living.length?rel.length/living.length:0};
  const latestTemporal=()=>temporalRecords().sort((a,b)=>String(b?.provenance?.createdAt||b?.source?.createdAt||'').localeCompare(String(a?.provenance?.createdAt||a?.source?.createdAt||'')))[0]||null;

  function decide(){
    const pressure=activePressure();
    const temporal=latestTemporal();
    const density=relationDensity();
    if(homeostasisNeedsReobserve())return{state:'reobserve',label:'Reescolta',text:'Hi ha alleujament homeostàtic actiu. Abans de tornar a intervenir, comprova si el context encara és el mateix.',href:'../#homeostasi'};
    if(temporal&&Math.abs(Number(temporal?.fragment?.difference||0))>=1)return{state:'return',label:'Retorna el fragment',text:'Hi ha una diferència perceptible amb procedència. No la multipliquis: deixa-la circular cap a un únic òrgan pertinent.',href:'../cambra-nua-2/fragment-circulation.html'};
    if(Number(pressure.score||0)>0&&hasMeaningfulTension(pressure))return{state:'transform',label:'Metabolitza',text:'La pressió conté fricció o transformació real. Pot merèixer un gest, però no una conclusió automàtica.',href:'../fusio-total/'};
    if(readArray(KEYS.germs).filter(g=>g.life!=='compost').length>=6&&density<.5)return{state:'relate',label:'Relaciona abans de podar',text:'Hi ha matèria viva amb poca densitat relacional. Prova una relació abans d’afegir o eliminar.',href:'../inter-nos-creative/'};
    return{state:'quiet',label:'No forcis res',text:'No hi ha cap senyal prou fort per justificar moviment. El silenci també és un estat operatiu.',href:'#'};
  }

  function ensure(){
    const stage=document.querySelector('#stage > div');if(!stage||document.querySelector('#impulsPanel'))return null;
    const box=document.createElement('aside');box.id='impulsPanel';box.style.cssText='margin:2rem auto 0;width:min(560px,100%);padding:1rem 1.1rem;border:1px solid var(--l);border-radius:18px;background:#06131f;text-align:left';stage.appendChild(box);return box;
  }
  function render(){
    const box=ensure();if(!box)return;const d=decide();
    box.innerHTML=`<p class="ey" style="margin:0 0 .35rem">IMPULS · ${d.state}</p><p style="margin:.2rem 0;color:var(--t)"><strong>${d.label}</strong></p><p style="margin:.35rem 0;color:var(--m)">${d.text}</p>${d.href==='#'?'':`<a class="go" href="${d.href}" style="margin-top:.6rem">Seguir aquest únic gest</a>`}<p style="margin:.6rem 0 0;color:#607988;font-size:.75rem">Suggeriment reversible · no canònic · la persona decideix</p>`;
  }
  ['storage','animic:pressure-updated','animic:homeostasis-updated','codex:temporal-difference','codex:ant-relation'].forEach(name=>window.addEventListener(name,()=>window.setTimeout(render,0)));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
