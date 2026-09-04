(()=>{
  const KEY='animic-universe-travessa-v2';
  const $=s=>document.querySelector(s);
  const routes={
    listen:{organ:'Rosa de l’Escolta',phenomenon:'escolta',return:'Alguna cosa encara demana ser escoltada.'},
    act:{organ:'Instrument Z',phenomenon:'diferència',return:'Una diferència anterior encara deixa rastre.'},
    wait:{organ:'Cambra nua del temps',phenomenon:'absència',return:'Alguna cosa encara sosté el temps.'},
    error:{organ:'Compost',phenomenon:'error fèrtil',return:'Allò que va fallar encara no ha acabat de dir què era.'},
    lost:{organ:'Centre',phenomenon:'desorientació',return:'No tota desorientació necessita una direcció immediata.'}
  };
  const relations={
    'absència|escolta':{label:'absència ↔ escolta',text:'Una absència anterior pot haver canviat què és audible ara.'},
    'escolta|diferència':{label:'escolta ↔ diferència',text:'La diferència pot ser reconeguda perquè abans hi ha hagut escolta.'},
    'error fèrtil|diferència':{label:'error fèrtil ↔ diferència',text:'L’error pot haver produït una diferència que ja no convé reparar automàticament.'},
    'absència|diferència':{label:'absència ↔ diferència',text:'Allò que no apareix també pot produir una diferència perceptible.'},
    'desorientació|escolta':{label:'desorientació ↔ escolta',text:'La falta de direcció pot convertir-se en condició d’escolta.'},
    'escolta|absència':{label:'escolta ↔ absència',text:'Escoltar pot revelar que el fenomen important és allò que no apareix.'}
  };
  let pending=null;
  const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.slice(-8):[]}catch{return[]}};
  const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x.slice(-8)))}catch{}};
  const memory=load();

  function relationFor(list){
    if(list.length<2)return null;
    const a=list.at(-2)?.phenomenon,b=list.at(-1)?.phenomenon;
    return relations[`${a}|${b}`]||null;
  }
  function applyPresenceMemory(){
    const last=memory.at(-1),lead=$('#presence .lead'),ey=$('#presence .ey'),footer=$('footer');
    document.title='Anímic Protein Universe · Navegació Presencial β.2';
    if(ey)ey.textContent='ANÍMIC PROTEIN UNIVERSE · PRESÈNCIA β.2';
    if(footer)footer.textContent='Navegació Presencial β.2 · el territori recorda sense decidir · reversible';
    if(last&&lead){lead.textContent=routes[last.gesture]?.return||'Entra. Alguna cosa de la travessa anterior encara pot ser pertinent.';lead.dataset.memory='1'}
  }
  function captureGesture(target){
    const g=target?.dataset?.gesture;
    if(g&&routes[g])pending=g;
    else if(target?.id==='errorBtn')pending='error';
    else if(target?.id==='lostBtn')pending='lost';
  }
  function commitTrace(){
    if(!pending||!routes[pending])return;
    const r=routes[pending];
    const entry={gesture:pending,organ:r.organ,phenomenon:r.phenomenon,at:new Date().toISOString()};
    memory.push(entry);while(memory.length>8)memory.shift();save(memory);
    const rel=relationFor(memory),ant=$('#ant'),text=$('#returnText'),toggle=$('#mapToggle');
    if(toggle)toggle.classList.add('revealed');
    requestAnimationFrame(()=>{
      if(rel){
        ant?.classList.add('show');
        if(text)text.textContent=`🐜 ${rel.label}. ${rel.text}`;
        document.documentElement.dataset.animicPhenomenon=rel.label;
      }else{
        ant?.classList.remove('show');
        if(text)text.textContent=`Rastre conservat: ${r.phenomenon}. Encara no hi ha prou relació per insinuar una direcció.`;
        delete document.documentElement.dataset.animicPhenomenon;
      }
    });
  }
  function installForget(){
    const reset=$('#reset');if(!reset||$('#forgetTravessa'))return;
    const b=document.createElement('button');b.id='forgetTravessa';b.className='quiet';b.type='button';b.textContent='Oblidar la travessa';
    b.onclick=()=>{try{localStorage.removeItem(KEY);localStorage.removeItem('animic-presence-trail')}catch{}memory.splice(0);pending=null;delete document.documentElement.dataset.animicPhenomenon;const lead=$('#presence .lead');if(lead)lead.textContent='Entra. L’organisme no et mostrarà tot el que té: només allò que pugui ser pertinent ara.';$('#ant')?.classList.remove('show');$('#mapToggle')?.classList.remove('revealed')};
    reset.insertAdjacentElement('afterend',b);
  }
  function installPhenomenonHint(){
    const stage=$('#stage > div');if(!stage||$('#phenomenonHint'))return;
    const p=document.createElement('p');p.id='phenomenonHint';p.className='ey';p.style.opacity='.55';p.style.marginTop='2rem';p.textContent='El fenomen no és un lloc: apareix entre un gest i el següent.';stage.append(p);
  }

  document.addEventListener('click',e=>captureGesture(e.target),true);
  $('#trace')?.addEventListener('click',()=>setTimeout(commitTrace,0));
  applyPresenceMemory();installForget();installPhenomenonHint();
})();