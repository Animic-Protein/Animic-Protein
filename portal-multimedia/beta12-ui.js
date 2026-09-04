const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
if(!document.getElementById('archive-sheet-style')){const blocker=document.createElement('style');blocker.id='archive-sheet-style';blocker.dataset.lazyBlocker='1';document.head.append(blocker)}
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
let sheetsLoading=false;
async function loadArchivumSheets(){if(sheetsLoading)return;sheetsLoading=true;try{const m=await import('./archivum-sheets-lazy.js');await m.activateArchivumSheets()}catch(err){console.warn('Archivum sheets lazy load failed',err);sheetsLoading=false}}
function armArchivumLazy(){[$('#circulateArchive'),document.querySelector('[data-open="archivum"]'),$('#showArchive')].filter(Boolean).forEach(el=>{if(el.dataset.lazySheets)return;el.dataset.lazySheets='1';el.addEventListener('click',()=>setTimeout(loadArchivumSheets,0),{passive:true})})}
function normalizeArchiveVocabulary(){
  const arch=$('#archivum');if(!arch)return;
  setText(arch.querySelector(':scope > .ey'),'ARCHIVUM / ARXIU VIU · MEMÒRIA GENERAL');
  setText(arch.querySelector(':scope > h2'),'Memòria que pot tornar a actuar');
  setText(arch.querySelector(':scope > .mut'),'Única memòria general del Portal. Conserva fonts, loops, transformacions, relacions i procedència. Els loops són una cambra interna d’Archivum, no un òrgan separat.');
  setText($('#showLoops'),'Cambra de loops');
  setText($('#looparium > .ey'),'CAMBRA DE LOOPS · DINS ARCHIVUM');
  setText($('#looparium > h2'),'Loops conservats');
  const tools=$('#looparium-tools');if(tools){setText(tools.querySelector('.ey'),'CAMBRA DE LOOPS · ARCHIVUM / ARXIU VIU');setText(tools.querySelector('.archive-title'),'Trobar i reactivar loops conservats.');}
}
function applyBeta12(){
  document.documentElement.dataset.portal='beta12';
  const topEy=[...document.querySelectorAll('main > .ey')][0];setText(topEy,'ANÍMIC PROTEIN · PORTAL MULTIMÈDIA β·12');
  setText(document.querySelector('main > h1 + .mut'),'Una font entra una vegada, passa per instruments i conserva cada transformació a Archivum / Arxiu Viu.');
  const circ=$('#circulation');if(circ){setText(circ.querySelector('.ey'),'β·12 · RUTA SIMPLE');setText(circ.querySelector('h2'),'FONT → INSTRUMENT → TRANSFORMACIÓ → ARCHIVUM');}
  const route=$('.circulation-route');if(route)route.innerHTML='<span class="pulse" data-pulse="source">FONT</span><span class="pulse" data-pulse="looperum">Looperum</span><span class="pulse" data-pulse="pulsarium">Pulsarium</span><span class="pulse beta12-experimental" data-pulse="videodrome">Videodrum · en prova</span><span class="pulse" data-pulse="archivum">Archivum / Arxiu Viu</span>';
  const actions=$('#circulation .actions');if(actions){setText($('#circulateArchive'),'→ Archivum / Arxiu Viu');const v=$('#circulateVideo');if(v){setText(v,'→ Videodrum · prova');v.classList.add('beta12-experimental')}}
  const organs=$('.organs');if(organs){[...organs.querySelectorAll('.organ')].forEach(c=>{const name=c.querySelector('h2')?.textContent?.trim();if(name==='Archivum'||name==='Looparium'){c.remove();return}if(name==='Videodrum'){c.classList.add('beta12-experimental');setText(c.querySelector('.ey'),'INSTRUMENT VISUAL · EN PROVA');setText(c.querySelector('.mut'),'Només sobreviurà com a òrgan autònom si una prova real demostra una diferència perceptible pròpia.')}});const puls=[...organs.querySelectorAll('.organ')].find(c=>c.querySelector('h2')?.textContent?.trim()==='Pulsarium');if(puls)setText(puls.querySelector('.ey'),'INSTRUMENT RÍTMIC / SAMPLER · β·11.5 CONGELAT');}
  normalizeArchiveVocabulary();setTimeout(normalizeArchiveVocabulary,100);setTimeout(normalizeArchiveVocabulary,600);armArchivumLazy();
  setText($('#save'),'Conservar loop → Archivum / Arxiu Viu');
  setText($('#antSuggest'),'🐜 La formiga només apareix quan hi ha una relació accionable; no és navegació ni decoració.');
  setText($('#trace'),'🐜 β·12 · Occam: arrencada lleugera; la fitxa tècnica només es carrega en obrir Archivum.');
  if(!$('#beta12-style')){const st=document.createElement('style');st.id='beta12-style';st.textContent='.beta12-experimental{opacity:.62;border-style:dashed!important}.beta12-experimental::after{content:" · ?";color:var(--o)}.organs{grid-template-columns:repeat(3,1fr)}@media(max-width:760px){.organs{grid-template-columns:1fr}}';document.head.append(st)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(applyBeta12,0));else setTimeout(applyBeta12,0);
