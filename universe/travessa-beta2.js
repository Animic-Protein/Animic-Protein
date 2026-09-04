(()=>{
  const KEY='animic-universe-travessa-v2';
  const LEGACY_KEY='animic-presence-trail';
  const $=s=>document.querySelector(s);
  const routes={
    listen:{organ:'Rosa de l’Escolta',phenomenon:'escolta',return:'Alguna cosa encara demana ser escoltada.'},
    act:{organ:'Instrument Z',phenomenon:'diferència',return:'Una diferència anterior encara deixa rastre.'},
    wait:{organ:'Cambra nua del temps',phenomenon:'absència',return:'Alguna cosa encara sosté el temps.'},
    error:{organ:'Compost',phenomenon:'error fèrtil',return:'Allò que va fallar encara no ha acabat de dir què era.'},
    lost:{organ:'Centre',phenomenon:'desorientació',return:'No tota desorientació necessita una direcció immediata.'}
  };
  const relations={
    'absència|escolta':{label:'absència ↔ escolta',text:'Potser ara s’escolta una altra cosa.'},
    'escolta|diferència':{label:'escolta ↔ diferència',text:'La diferència ja té un abans.'},
    'error fèrtil|diferència':{label:'error fèrtil ↔ diferència',text:'No reparis encara aquesta diferència.'},
    'absència|diferència':{label:'absència ↔ diferència',text:'El que no apareix també modifica.'},
    'desorientació|escolta':{label:'desorientació ↔ escolta',text:'No tenir direcció pot obrir l’escolta.'},
    'escolta|absència':{label:'escolta ↔ absència',text:'Potser el que importa és el que falta.'}
  };
  let pending=null;
  const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.slice(-8):[]}catch{return[]}};
  const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x.slice(-8)));localStorage.removeItem(LEGACY_KEY)}catch{}};
  const memory=load();

  function relationFor(list){
    if(list.length<2)return null;
    const a=list.at(-2)?.phenomenon,b=list.at(-1)?.phenomenon;
    if(!a||!b||a===b)return null;
    return relations[`${a}|${b}`]||null;
  }
  function applyPresenceMemory(){
    const last=memory.at(-1),lead=$('#presence .lead'),ey=$('#presence .ey'),footer=$('footer');
    document.title='Anímic Protein Universe · Navegació Presencial β.2.2';
    if(ey)ey.textContent='ANÍMIC PROTEIN UNIVERSE · PRESÈNCIA β.2.2';
    if(footer)footer.textContent='Navegació Presencial β.2.2 · el territori recorda sense decidir · reversible';
    if(last&&lead){lead.textContent=routes[last.gesture]?.return||'Alguna cosa de la travessa anterior encara hi és.';lead.dataset.memory='1'}
  }
  function captureGesture(target){
    const g=target?.dataset?.gesture;
    if(g&&routes[g])pending=g;
    else if(target?.id==='errorBtn')pending='error';
    else if(target?.id==='lostBtn')pending='lost';
  }
  function disableAnt(){
    const ant=$('#ant');if(!ant)return;
    ant.classList.remove('show');ant.removeAttribute('role');ant.removeAttribute('tabindex');ant.removeAttribute('aria-label');ant.removeAttribute('title');ant.onclick=null;ant.onkeydown=null;
  }
  function activateAnt(rel){
    const ant=$('#ant');if(!ant)return;
    ant.classList.add('show');ant.setAttribute('role','link');ant.setAttribute('tabindex','0');ant.setAttribute('aria-label',`Seguir relació ${rel.label}`);ant.title='Seguir aquesta relació';
    const follow=()=>{location.href=`../inter-nos-creative/?relation=${encodeURIComponent(rel.label)}&from=universe-beta22`};
    ant.onclick=follow;ant.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();follow()}};
  }
  function commitTrace(){
    if(!pending||!routes[pending])return;
    const r=routes[pending];
    const last=memory.at(-1);
    const duplicate=last&&last.gesture===pending&&Date.now()-Date.parse(last.at)<1500;
    if(!duplicate){memory.push({gesture:pending,organ:r.organ,phenomenon:r.phenomenon,at:new Date().toISOString()});while(memory.length>8)memory.shift();save(memory)}
    const rel=relationFor(memory),after=$('#after'),text=$('#returnText'),toggle=$('#mapToggle');
    after?.classList.add('show');
    if(toggle)toggle.classList.add('revealed');
    if(rel){activateAnt(rel);if(text)text.textContent=rel.text;document.documentElement.dataset.animicPhenomenon=rel.label}
    else{disableAnt();if(text)text.textContent='Rastre deixat.';delete document.documentElement.dataset.animicPhenomenon}
  }
  function installSingleTracePath(){
    const trace=$('#trace');if(!trace)return;
    trace.addEventListener('click',e=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      commitTrace();
    },true);
  }
  function installResetGuard(){
    const reset=$('#reset');if(!reset)return;
    reset.addEventListener('click',()=>{pending=null;disableAnt();delete document.documentElement.dataset.animicPhenomenon},true);
  }
  function installForget(){
    const reset=$('#reset');if(!reset||$('#forgetTravessa'))return;
    const b=document.createElement('button');b.id='forgetTravessa';b.className='quiet';b.type='button';b.textContent='Oblidar la travessa';b.style.opacity='.48';
    b.onclick=()=>{try{localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_KEY)}catch{}memory.splice(0);pending=null;delete document.documentElement.dataset.animicPhenomenon;const lead=$('#presence .lead');if(lead){lead.textContent='Entra. L’organisme no et mostrarà tot el que té: només allò que pugui ser pertinent ara.';delete lead.dataset.memory}disableAnt();$('#mapToggle')?.classList.remove('revealed')};
    reset.insertAdjacentElement('afterend',b);
  }
  function migrateLegacy(){try{localStorage.removeItem(LEGACY_KEY)}catch{}}

  document.addEventListener('click',e=>captureGesture(e.target),true);
  migrateLegacy();applyPresenceMemory();installSingleTracePath();installResetGuard();installForget();disableAnt();
})();