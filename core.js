const cssLink=document.createElement('link');cssLink.rel='stylesheet';cssLink.href='cartographia.css';document.head.appendChild(cssLink);

const dialogs=document.querySelectorAll('dialog');
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{const t=document.getElementById(b.dataset.open);if(t&&typeof t.showModal==='function')t.showModal()}));
dialogs.forEach(d=>{const c=d.querySelector('.close');if(c)c.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()})});

const seeds=['Escolta una textura fins que deixi de semblar música. Llavors entra-hi.','Canvia una sola regla del tema i conserva totes les conseqüències.','Comença pel final: deixa que la forma recordi com va néixer.','Fes audible un silenci que normalment amagaries.','Tria un compàs imparell i fes que deixi de notar-se.','Converteix un error en material estructural.','Pregunta a la peça què necessita abans d’afegir-hi res.','Pren una idea aliena al tema i fes-la passar pel compost.','Improvisa una resposta que ningú no hagi demanat.','Redueix la forma fins que només quedi la seva necessitat.','Fes abans de proclamar: deixa que l’obra decideixi què ha passat.','Prepara el treball fins que el material respongui; no forcis l’arribada.','Repeteix una cèl·lula set vegades sense embellir-la; a la vuitena, canvia només allò que ja no puguis deixar igual.','No fugis del primer avorriment: escolta quin detall del temps acaba de fer-se visible.'];
const seedButton=document.getElementById('seed-button'),seedOutput=document.getElementById('seed-output');
if(seedButton&&seedOutput)seedButton.addEventListener('click',()=>{const p=seedOutput.dataset.index;let i;do{i=Math.floor(Math.random()*seeds.length)}while(seeds.length>1&&String(i)===p);seedOutput.dataset.index=String(i);seedOutput.textContent=seeds[i]});

const map=document.getElementById('living-map'),nodeTitle=document.getElementById('node-title'),nodeDesc=document.getElementById('node-desc'),relationOutput=document.getElementById('relation-output'),revealAction=document.getElementById('reveal-action'),relateAction=document.getElementById('relate-action'),seedAction=document.getElementById('seed-action'),nodePanel=document.getElementById('node-panel');
let activeNode=null,relationStart=null;
const MEMORY_KEY='animic-protein-inter-nos-v2',RELATION_STATES=['canonica','emergent','sembrada','compostada'];
const stateLabels={canonica:'Canònica',emergent:'Emergent',sembrada:'Sembrada',compostada:'Compostada'};
const canonicalRelations={
'harmonia-viva|retrodansa':{title:'Retroharmonia corporal',text:'La forma harmònica també pot aprendre a caminar enrere: una tensió pot revelar-se abans que la causa que l’ha produïda.',action:'Prova una seqüència harmònica de 4 estats i reconstrueix-la des de l’últim acord fins al primer.'},
'compost|mutatio':{title:'Mutació per descomposició',text:'Allò que es descarta no desapareix: el compost conserva rastres que poden reaparèixer transformats en una nova estructura.',action:'Recupera un fragment rebutjat i canvia-li només una regla abans de tornar-lo a sembrar.'},
'silenci|zajj':{title:'Improvisació negativa',text:'En Zajj-viu, el silenci deixa de ser pausa i es converteix en resposta: també s’improvisa decidint no ocupar l’espai.',action:'Construeix un solo on cada tercera decisió sigui no tocar.'},
'microtonalitat|pedals':{title:'Pedal desviat',text:'Un pedal microtonal converteix la referència estable en una superfície mòbil i obliga l’oïda a redefinir què considera centre.',action:'Mantén un pedal i desplaça’l lentament entre dos semitons sense abandonar-lo del tot.'},
'inter-nos|tracabilitat':{title:'Genealogia de la relació',text:'INTER NOS no només crea connexions: també ha de poder recordar quan van néixer, entre quins nodes i amb quina conseqüència.',action:'Conserva aquesta relació a la memòria viva del mapa.'},
'amo|governanca':{title:'Governar sense imposar',text:'Amo: volo ut sis aplicat a la governança significa crear regles que protegeixin l’emergència d’una forma sense decidir per endavant què ha de ser.',action:'Formula una regla que protegeixi una contribució sense determinar-ne el resultat.'},
'atzar|vortex':{title:'Atzar amb gravetat',text:'El Vòrtex no elimina l’atzar: li dóna camp. Les desviacions aleatòries són atretes, deformades i retornades al sistema.',action:'Genera tres accidents i conserva només el que alteri una relació existent.'},
'rosetta|univers-visual':{title:'Traducció simbòlica',text:'Rosetta converteix l’univers visual en una gramàtica: un símbol pot travessar imatge, text, so i gest sense quedar reduït a una sola lectura.',action:'Tria un símbol de l’escut i tradueix-lo a un gest i a un so.'},
'arrels|brodsky-creativitat':{title:'Arrel sense altar',text:'Brodsky entra al Còdex com a interlocutor documentat, no com a autoritat tutelar. La seva funció és introduir fricció: el sistema pot preparar l’encontre, però no ordenar que la creació comparegui.',action:'Contrasta aquesta arrel amb una pràctica pròpia i anota què obliga a revisar.'},
'atzar|brodsky-creativitat':{title:'Ritme de la matèria',text:'La perícia no anul·la l’atzar: treballa al costat de ritmes, resistències i causalitats que el creador no domina completament.',action:'Prepara una forma amb precisió i conserva la primera desviació que el material imposi.'},
'brodsky-creativitat|ockham':{title:'Fer abans de crear',text:'La Navalla retira el prestigi anticipat de la paraula «crear» i deixa l’acció verificable: fer, observar el resultat i reconèixer després què ha emergit.',action:'Substitueix «estic creant» per una operació concreta que puguis acabar avui.'},
'brodsky-creativitat|creativitum-nunc-pacevem':{title:'De la incertesa a la pau activa',text:'La inseguretat descrita per Brodsky no es resol amb control. Anímic Protein la transforma en disponibilitat: treballar el límit sense exigir-li una arribada prevista.',action:'Formula què pots preparar, què has d’escoltar i què no et pertoca decidir.'},
'creativitum-nunc-pacevem|mutatio':{title:'Mutació no forçada',text:'MUTATIO no és imposar una forma nova, sinó crear les condicions perquè material, temps i relació revelin una diferència que no estava programada.',action:'Canvia una sola condició i espera una resposta perceptible abans d’afegir-ne una altra.'},
'amo|creativitum-nunc-pacevem':{title:'Pau que deixa ser',text:'Amo: volo ut sis i Creativitum nunc Pacevem coincideixen a no posseir el resultat: protegeixen l’espai on la forma pot esdevenir ella mateixa.',action:'Retira una decisió teva que estigui impedint que la peça respongui.'},
'brodsky-creativitat|silenci':{title:'Incertesa habitable',text:'El silenci no elimina la inseguretat creativa; li dóna un espai on pot ser escoltada sense omplir-la immediatament amb solucions.',action:'Atura el procés durant un minut i anota què demana la peça abans de reprendre’l.'},
'arrels|brodsky-avorriment':{title:'Finestra del temps',text:'Brodsky entra de nou com una arrel sense altar: l’avorriment suspèn la fugida cap a la novetat i deixa visible el temps repetitiu, la finitud i la nostra proporció.',action:'Anota què apareix quan deixes de corregir immediatament una repetició.'},
'brodsky-avorriment|brodsky-creativitat':{title:'Contrapunt de l’arribada',text:'«El maullido de un gato» retira el control sobre l’arribada creadora; «Elogi de l’avorriment» retira la fugida compulsiva del temps. Entre tots dos, fer és preparar i romandre prou per poder rebre.',action:'Prepara una cèl·lula i sostén-la sense exigir ni novetat ni resultat.'},
'brodsky-avorriment|continuum-musicalis':{title:'Cambra nua del temps',text:'El Continuum musicalis rep el seu suport temporal: la repetició deixa de ser una còpia morta i es converteix en el medi on l’oïda detecta llindars, diferències i durada.',action:'Entra a la Cambra nua del temps: set repeticions intactes, una mutació mínima i un retorn.'},
'brodsky-avorriment|silenci':{title:'No tot buit és silenci',text:'El silenci és material escoltat; l’avorriment és una relació amb el temps que pot aparèixer fins i tot dins del so. Confondre’ls faria perdre precisió als dos nodes.',action:'Distingeix què falta de què es repeteix: buida només una capa i mantén-ne una altra.'},
'brodsky-avorriment|creativitum-nunc-pacevem':{title:'Pau amb la repetició',text:'La pau activa amb el límit inclou no fabricar novetat per pànic. Sosté la forma fins que la necessitat d’una diferència sigui perceptible i no decorativa.',action:'Retarda una variació prevista i comprova si encara és necessària després de tres cicles.'},
'continuum-musicalis|temps-nu':{title:'Laboratori de redundància',text:'La Cambra nua del temps converteix la redundància en instrument del Continuum: repetició, llindar, mutació mínima i retorn formen un cicle traçable, reversible i audible.',action:'Repeteix 7 vegades; a la 8a varia només timbre, accent, altura o silenci; a la 9a retorna i compara.'},
'mutatio|temps-nu':{title:'Mutació mínima',text:'MUTATIO no necessita acumulació. Després d’una durada sostinguda, una sola diferència pot reorganitzar l’escolta de tot el que ja havia sonat.',action:'Conserva una única variació si canvia retrospectivament la percepció del cicle.'}
};
const aliases={'llavor-mutatio':'mutatio'};
const keyFor=(a,b)=>[aliases[a]||a,aliases[b]||b].sort().join('|');
const idFor=(a,b)=>[a,b].sort().join('::');
const cleanText=(v,max=500)=>typeof v==='string'?v.replace(/[<>\u0000-\u001f\u007f]/g,'').trim().slice(0,max):'';
const safeNodeId=v=>typeof v==='string'&&/^[a-z0-9:_-]{1,120}$/i.test(v)?v:'';
const safeState=v=>RELATION_STATES.includes(v)?v:'emergent';
const isGermId=id=>typeof id==='string'&&id.startsWith('germen-');
const generatedTitles=new Set(['Relació emergent','Relació sembrada','Memòria de la llavor']);
const isGeneratedRelation=entry=>generatedTitles.has(entry?.title)||String(entry?.title||'').startsWith('INTER NOS ·');
const dynamicRelationCopy=entry=>{
  const state=safeState(entry?.state);
  const A=cleanText(entry?.a,120)||'Primer node';
  const B=cleanText(entry?.b,120)||'Segon node';
  const versionsWithSeed=(entry?.aId==='versions'||entry?.bId==='versions')&&(isGermId(entry?.aId)||isGermId(entry?.bId));
  if(versionsWithSeed){
    const text={
      canonica:'Versions conserva la genealogia de la llavor sense immobilitzar-ne la mutació: origen, canvis d’estat i retorn continuen traçables.',
      emergent:'Versions i la llavor obren una hipòtesi viva: recordar cada mutació sense convertir-la en una forma tancada.',
      sembrada:'La relació ja ha produït una llavor. Versions en conserva l’origen i els canvis perquè MUTATIO no esdevingui amnèsia.',
      compostada:'La relació ha tornat al compost, però Versions en preserva el rastre perquè pugui nodrir una forma futura.'
    }[state];
    const action={
      canonica:'Traça canònica: conserva origen, transformacions i reversibilitat.',
      emergent:'Pregunta viva: com pot Versions recordar la llavor sense impedir que continuï mutant?',
      sembrada:'Acció viva: registra l’origen, el canvi d’estat i la possibilitat de retorn de la llavor.',
      compostada:'Memòria de compost: conserva què ha deixat de funcionar i quin nutrient retorna al sistema.'
    }[state];
    return{title:'Memòria de la llavor',text,action,state};
  }
  const text={
    canonica:`${A} i ${B} mantenen una relació reconeguda dins del Còdex i n’assumeixen les conseqüències.`,
    emergent:`${A} i ${B} obren una hipòtesi viva. La relació encara s’ha de provar per diferència perceptible, traçabilitat, vincle explícit i reversibilitat.`,
    sembrada:`La relació entre ${A} i ${B} ja ha produït una llavor. Ara cal observar quina transformació real provoca dins del Còdex.`,
    compostada:`La relació entre ${A} i ${B} ha tornat al compost. El rastre es conserva com a nutrient i aprenentatge.`
  }[state];
  const action={
    canonica:'Acció canònica: mantén-ne la traça i revisa-la quan canviï alguna de les parts.',
    emergent:`Pregunta viva: què hauria de canviar en «${A}» perquè «${B}» deixés de ser extern?`,
    sembrada:'Acció viva: deixa que la llavor germini, relaciona-la i observa què modifica.',
    compostada:'Acció de compost: conserva el rastre útil i allibera la forma que ja no funciona.'
  }[state];
  return{title:`INTER NOS · ${A} ↔ ${B}`,text,action,state};
};
function readMemory(){
  try{
    const v=JSON.parse(localStorage.getItem(MEMORY_KEY)||'[]');
    if(!Array.isArray(v))return[];
    return v.map(x=>{
      const entry={
        id:cleanText(x?.id,180),
        a:cleanText(x?.a,120),
        b:cleanText(x?.b,120),
        aId:safeNodeId(x?.aId),
        bId:safeNodeId(x?.bId),
        title:cleanText(x?.title,180),
        text:cleanText(x?.text,700),
        action:cleanText(x?.action,420),
        state:safeState(x?.state),
        timestamp:cleanText(x?.timestamp,80)
      };
      if(!entry.id||!entry.aId||!entry.bId)return null;
      return isGeneratedRelation(entry)?{...entry,...dynamicRelationCopy(entry)}:entry;
    }).filter(Boolean);
  }catch{return[]}
}
function writeMemory(v){try{localStorage.setItem(MEMORY_KEY,JSON.stringify(v.slice(-24)))}catch{}}
function resultFor(a,b){const c=canonicalRelations[keyFor(a.dataset.node,b.dataset.node)];if(c)return{...c,state:'canonica'};return dynamicRelationCopy({aId:a.dataset.node,bId:b.dataset.node,a:a.dataset.title||a.textContent.trim(),b:b.dataset.title||b.textContent.trim(),state:'emergent'})}
function remember(a,b,r){const m=readMemory(),id=idFor(a.dataset.node,b.dataset.node),old=m.find(x=>x.id===id),base={id,a:a.dataset.title||a.textContent.trim(),b:b.dataset.title||b.textContent.trim(),aId:a.dataset.node,bId:b.dataset.node,title:r.title,text:r.text,action:r.action,state:old?.state||r.state||'emergent',timestamp:new Date().toISOString()},entry=isGeneratedRelation(base)?{...base,...dynamicRelationCopy(base)}:base;writeMemory([...m.filter(x=>x.id!==id),entry]);renderMemory();drawRelations();return entry}
function changeState(id,state){writeMemory(readMemory().map(x=>{if(x.id!==id)return x;const next={...x,state:safeState(state),timestamp:new Date().toISOString()};return isGeneratedRelation(next)?{...next,...dynamicRelationCopy(next)}:next}));renderMemory();drawRelations()}
const nextState=s=>RELATION_STATES[(Math.max(0,RELATION_STATES.indexOf(s))+1)%RELATION_STATES.length];
function ensureLayer(){if(!map)return null;let s=map.querySelector('.relation-layer');if(!s){s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.classList.add('relation-layer');s.setAttribute('aria-hidden','true');map.prepend(s)}return s}
function center(n){const m=map.getBoundingClientRect(),r=n.getBoundingClientRect();return{x:r.left-m.left+r.width/2,y:r.top-m.top+r.height/2}}
function drawRelations(){const s=ensureLayer();if(!s||!map)return;const w=map.clientWidth,h=map.clientHeight;s.setAttribute('viewBox',`0 0 ${w} ${h}`);s.setAttribute('width',w);s.setAttribute('height',h);s.innerHTML='';readMemory().forEach(item=>{const a=map.querySelector(`[data-node="${item.aId}"]`),b=map.querySelector(`[data-node="${item.bId}"]`);if(!a||!b)return;const p1=center(a),p2=center(b),dx=p2.x-p1.x,c=Math.max(28,Math.min(110,Math.abs(dx)*.18)),p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M ${p1.x} ${p1.y} C ${p1.x+dx*.35} ${p1.y-c}, ${p2.x-dx*.35} ${p2.y+c}, ${p2.x} ${p2.y}`);p.classList.add('living-relation',`state-${item.state||'emergent'}`);s.appendChild(p)})}
function flash(a,b){[a,b].forEach(n=>{n.classList.add('is-related','is-pulsing');setTimeout(()=>n.classList.remove('is-related','is-pulsing'),2600)})}
function show(entry){
  if(!relationOutput)return;
  relationOutput.replaceChildren();
  const strong=document.createElement('strong');strong.textContent=cleanText(entry?.title,180);
  const text=document.createTextNode(cleanText(entry?.text,700));
  const action=document.createElement('span');action.textContent=cleanText(entry?.action,420);
  const em=document.createElement('em');em.textContent='Estat: '+(stateLabels[safeState(entry?.state)]||stateLabels.emergent);
  relationOutput.append(strong,document.createElement('br'),text,document.createElement('br'),action,document.createElement('br'),em);
}
function renderMemory(){
  if(!nodePanel)return;
  let box=nodePanel.querySelector('.relation-memory');
  if(!box){box=document.createElement('div');box.className='relation-memory';nodePanel.appendChild(box)}
  box.replaceChildren();
  const title=document.createElement('p');title.className='memory-title';title.textContent='Memòria INTER NOS';box.appendChild(title);
  const m=readMemory().slice(-6).reverse();
  if(!m.length){
    const empty=document.createElement('p');empty.className='memory-empty';empty.textContent='Encara no hi ha relacions conservades.';box.appendChild(empty);return;
  }
  const legend=document.createElement('div');legend.className='state-legend';
  RELATION_STATES.forEach(s=>{const chip=document.createElement('span');chip.className='state-chip state-'+s;chip.textContent=stateLabels[s];legend.appendChild(chip)});
  box.appendChild(legend);
  const list=document.createElement('div');list.className='memory-list';
  m.forEach(x=>{
    const item=document.createElement('div');item.className='memory-item state-'+safeState(x.state);
    const open=document.createElement('button');open.type='button';open.className='memory-open';open.dataset.memoryId=x.id;
    const strong=document.createElement('strong');strong.textContent=x.title;
    const span=document.createElement('span');span.textContent=x.a+' ↔ '+x.b;
    open.append(strong,span);
    open.addEventListener('click',()=>{
      const current=readMemory().find(e=>e.id===x.id);if(!current)return;
      const a=map?.querySelector('[data-node="'+current.aId+'"]'),b=map?.querySelector('[data-node="'+current.bId+'"]');
      if(a&&b){flash(a,b);activateNode(b);show(current)}
    });
    const state=document.createElement('button');state.type='button';state.className='memory-state';state.dataset.stateId=x.id;state.title='Canvia l’estat';state.textContent=stateLabels[safeState(x.state)];
    state.addEventListener('click',()=>{const current=readMemory().find(e=>e.id===x.id);if(current)changeState(current.id,nextState(safeState(current.state)))});
    item.append(open,state);list.appendChild(item);
  });
  box.appendChild(list);
}
function activateNode(n){
  if(!n||n.disabled||n.dataset?.inert==='true')return;
  map?.querySelectorAll('[data-node].is-active').forEach(e=>e.classList.remove('is-active'));
  n.classList.add('is-active');activeNode=n;
  if(nodeTitle)nodeTitle.textContent=n.dataset.title||n.textContent.trim();
  if(nodeDesc)nodeDesc.textContent=n.dataset.desc||'Aquest node encara està germinant.';
  if(relationStart&&relationStart!==n){const a=relationStart;relationStart=null;const r=resultFor(a,n),entry=remember(a,n,r);flash(a,n);show(entry);try{window.dispatchEvent(new CustomEvent('animic:relation-found',{detail:{a:entry.a,b:entry.b,title:entry.title,state:entry.state}}))}catch{}}
  try{window.dispatchEvent(new CustomEvent('animic:node-activated',{detail:{id:n.dataset.node||null}}))}catch{}
}
if(map)map.querySelectorAll('[data-node]').forEach(n=>n.addEventListener('click',()=>activateNode(n)));
if(revealAction)revealAction.addEventListener('click',()=>{if(!activeNode)return;const children=activeNode.closest('.constellation')?.querySelectorAll('.satellites button')||[];children.forEach((c,i)=>c.animate([{opacity:.45,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,delay:i*55,easing:'ease-out'}));if(relationOutput)relationOutput.textContent=children.length?'Revelat: observa les branques i tria on entrar.':'Aquest node no té subbranques visibles encara.'});
if(relateAction)relateAction.addEventListener('click',()=>{if(!activeNode||activeNode.disabled||activeNode.dataset?.inert==='true')return;relationStart=activeNode;activeNode.classList.add('is-related','is-pulsing');if(relationOutput)relationOutput.textContent='INTER NOS preparat. Ara toca un segon node.'});
if(seedAction)seedAction.addEventListener('click',()=>{if(activeNode?.disabled||activeNode?.dataset?.inert==='true')return;const d=document.getElementById('sembra');if(d&&typeof d.showModal==='function')d.showModal();if(seedOutput&&activeNode){const t=activeNode.dataset.title||activeNode.textContent.trim();seedOutput.textContent=`Llavor des de «${t}»: ${seeds[Math.floor(Math.random()*seeds.length)]}`}});
window.addEventListener('resize',()=>requestAnimationFrame(drawRelations));window.addEventListener('orientationchange',()=>setTimeout(drawRelations,180));
renderMemory();const core=map?.querySelector('[data-node="codex"]');if(core)activateNode(core);requestAnimationFrame(drawRelations);
