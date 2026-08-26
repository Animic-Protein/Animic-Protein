const cssLink=document.createElement('link');cssLink.rel='stylesheet';cssLink.href='cartographia.css';document.head.appendChild(cssLink);

const dialogs=document.querySelectorAll('dialog');
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{const t=document.getElementById(b.dataset.open);if(t&&typeof t.showModal==='function')t.showModal()}));
dialogs.forEach(d=>{const c=d.querySelector('.close');if(c)c.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()})});

const seeds=['Escolta una textura fins que deixi de semblar música. Llavors entra-hi.','Canvia una sola regla del tema i conserva totes les conseqüències.','Comença pel final: deixa que la forma recordi com va néixer.','Fes audible un silenci que normalment amagaries.','Tria un compàs imparell i fes que deixi de notar-se.','Converteix un error en material estructural.','Pregunta a la peça què necessita abans d’afegir-hi res.','Pren una idea aliena al tema i fes-la passar pel compost.','Improvisa una resposta que ningú no hagi demanat.','Redueix la forma fins que només quedi la seva necessitat.'];
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
'rosetta|univers-visual':{title:'Traducció simbòlica',text:'Rosetta converteix l’univers visual en una gramàtica: un símbol pot travessar imatge, text, so i gest sense quedar reduït a una sola lectura.',action:'Tria un símbol de l’escut i tradueix-lo a un gest i a un so.'}
};
const aliases={'llavor-mutatio':'mutatio'};
const keyFor=(a,b)=>[aliases[a]||a,aliases[b]||b].sort().join('|');
const idFor=(a,b)=>[a,b].sort().join('::');
const cleanText=(v,max=500)=>typeof v==='string'?v.replace(/[<>\u0000-\u001f\u007f]/g,'').trim().slice(0,max):'';
const safeNodeId=v=>typeof v==='string'&&/^[a-z0-9:_-]{1,120}$/i.test(v)?v:'';
const safeState=v=>RELATION_STATES.includes(v)?v:'emergent';
function readMemory(){
  try{
    const v=JSON.parse(localStorage.getItem(MEMORY_KEY)||'[]');
    if(!Array.isArray(v))return[];
    return v.map(x=>({
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
    })).filter(x=>x.id&&x.aId&&x.bId);
  }catch{return[]}
}
function writeMemory(v){try{localStorage.setItem(MEMORY_KEY,JSON.stringify(v.slice(-24)))}catch{}}
function resultFor(a,b){const c=canonicalRelations[keyFor(a.dataset.node,b.dataset.node)];if(c)return{...c,state:'canonica'};const A=a.dataset.title||a.textContent.trim(),B=b.dataset.title||b.textContent.trim();return{title:'Relació emergent',text:`${A} i ${B} encara no tenen una relació canònica. El Còdex la tracta com una hipòtesi viva, no com una absència.`,action:`Pregunta viva: què hauria de canviar en «${A}» perquè «${B}» deixés de ser extern?`,state:'emergent'}}
function remember(a,b,r){const m=readMemory(),id=idFor(a.dataset.node,b.dataset.node),old=m.find(x=>x.id===id),entry={id,a:a.dataset.title||a.textContent.trim(),b:b.dataset.title||b.textContent.trim(),aId:a.dataset.node,bId:b.dataset.node,title:r.title,text:r.text,action:r.action,state:old?.state||r.state||'emergent',timestamp:new Date().toISOString()};writeMemory([...m.filter(x=>x.id!==id),entry]);renderMemory();drawRelations();return entry}
function changeState(id,state){writeMemory(readMemory().map(x=>x.id===id?{...x,state,timestamp:new Date().toISOString()}:x));renderMemory();drawRelations()}
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
  if(!n)return;
  map?.querySelectorAll('[data-node].is-active').forEach(e=>e.classList.remove('is-active'));
  n.classList.add('is-active');activeNode=n;
  if(nodeTitle)nodeTitle.textContent=n.dataset.title||n.textContent.trim();
  if(nodeDesc)nodeDesc.textContent=n.dataset.desc||'Aquest node encara està germinant.';
  if(relationStart&&relationStart!==n){const a=relationStart;relationStart=null;const r=resultFor(a,n);flash(a,n);show(remember(a,n,r))}
  try{window.dispatchEvent(new CustomEvent('animic:node-activated',{detail:{id:n.dataset.node||null}}))}catch{}
}
if(map)map.querySelectorAll('[data-node]').forEach(n=>n.addEventListener('click',()=>activateNode(n)));
if(revealAction)revealAction.addEventListener('click',()=>{if(!activeNode)return;const children=activeNode.closest('.constellation')?.querySelectorAll('.satellites button')||[];children.forEach((c,i)=>c.animate([{opacity:.45,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,delay:i*55,easing:'ease-out'}));if(relationOutput)relationOutput.textContent=children.length?'Revelat: observa les branques i tria on entrar.':'Aquest node no té subbranques visibles encara.'});
if(relateAction)relateAction.addEventListener('click',()=>{if(!activeNode)return;relationStart=activeNode;activeNode.classList.add('is-related','is-pulsing');if(relationOutput)relationOutput.textContent='INTER NOS preparat. Ara toca un segon node.'});
if(seedAction)seedAction.addEventListener('click',()=>{const d=document.getElementById('sembra');if(d&&typeof d.showModal==='function')d.showModal();if(seedOutput&&activeNode){const t=activeNode.dataset.title||activeNode.textContent.trim();seedOutput.textContent=`Llavor des de «${t}»: ${seeds[Math.floor(Math.random()*seeds.length)]}`}});
window.addEventListener('resize',()=>requestAnimationFrame(drawRelations));window.addEventListener('orientationchange',()=>setTimeout(drawRelations,180));
renderMemory();const core=map?.querySelector('[data-node="codex"]');if(core)activateNode(core);requestAnimationFrame(drawRelations);
