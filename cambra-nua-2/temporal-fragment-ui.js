import {createTemporalFragment,relateTemporalFragment,TEMPORAL_DESTINATIONS} from './temporal-fragment.js';

let activeRecord=null;

function ensureUi(){
  const result=document.querySelector('#result');
  if(!result||document.querySelector('#temporalReturns'))return;
  const box=document.createElement('section');
  box.id='temporalReturns';
  box.style.cssText='margin-top:18px;padding-top:16px;border-top:1px solid var(--line)';
  box.innerHTML='<p class="ey">FRAGMENT TEMPORAL REUTILITZABLE</p><p class="mut" id="fragmentState">Quan revelis la diferència, es crearà un únic fragment amb procedència.</p><div class="actions" id="fragmentActions"></div>';
  result.append(box);
}

function renderActions(){
  ensureUi();
  const actions=document.querySelector('#fragmentActions'),state=document.querySelector('#fragmentState');
  if(!actions||!activeRecord)return;
  actions.replaceChildren();
  state.textContent=`Fragment ${activeRecord.fragment?.id||activeRecord.id} · root ${activeRecord.provenance?.rootRecordId||'—'} · generació ${activeRecord.provenance?.generation??0}. Un sol origen; múltiples relacions.`;
  const circulation=document.createElement('a');
  circulation.className='button secondary';
  circulation.href='./fragment-circulation.html';
  circulation.textContent='Veure sistema circulatori →';
  actions.append(circulation);
  Object.entries(TEMPORAL_DESTINATIONS).forEach(([key,dest])=>{
    const a=document.createElement('a');
    a.className='button secondary';
    a.href=dest.href||'#';
    a.textContent=`Retornar → ${dest.label}`;
    a.addEventListener('click',()=>{
      const out=relateTemporalFragment(activeRecord,key);
      activeRecord=out.record;
      window.__codexTemporalFragment=activeRecord;
      state.textContent=out.deduplicated
        ? `Relació ja existent → ${dest.label}. No s’ha creat cap còpia.`
        : `Relació afegida → ${dest.label}. El fragment continua sent únic · generació ${activeRecord.provenance?.generation??0}.`;
    });
    actions.append(a);
  });
}

window.addEventListener('codex:temporal-difference',event=>{
  try{
    activeRecord=createTemporalFragment(event.detail||{});
    window.__codexTemporalFragment=activeRecord;
    renderActions();
    window.FormigaPont?.show?.('pont','La diferència ja té procedència. Pot circular sense duplicar-se.','./fragment-circulation.html','Veure el sistema circulatori');
  }catch(err){console.warn('Temporal fragment failed',err)}
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureUi,{once:true});else ensureUi();
