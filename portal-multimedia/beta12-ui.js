const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function normalizeArchiveVocabulary(){
  const arch=$('#archivum');if(!arch)return;
  const ey=arch.querySelector(':scope > .ey');if(ey&&ey.textContent!=='ARCHIVUM / ARXIU VIU · MEMÒRIA GENERAL')ey.textContent='ARCHIVUM / ARXIU VIU · MEMÒRIA GENERAL';
  const h=arch.querySelector(':scope > h2');if(h&&h.textContent!=='Memòria que pot tornar a actuar')h.textContent='Memòria que pot tornar a actuar';
  const p=arch.querySelector(':scope > .mut');if(p)p.textContent='Única memòria general del Portal. Conserva fonts, loops, transformacions, relacions i procedència. Els loops són una cambra interna d’Archivum, no un òrgan separat.';
  const btn=$('#showLoops');if(btn&&btn.textContent!=='Cambra de loops')btn.textContent='Cambra de loops';
  const loopEy=$('#looparium > .ey');if(loopEy&&loopEy.textContent!=='CAMBRA DE LOOPS · DINS ARCHIVUM')loopEy.textContent='CAMBRA DE LOOPS · DINS ARCHIVUM';
  const loopH=$('#looparium > h2');if(loopH&&loopH.textContent!=='Loops conservats')loopH.textContent='Loops conservats';
  const tools=$('#looparium-tools');if(tools){const tey=tools.querySelector('.ey');if(tey&&tey.textContent!=='CAMBRA DE LOOPS · ARCHIVUM / ARXIU VIU')tey.textContent='CAMBRA DE LOOPS · ARCHIVUM / ARXIU VIU';const title=tools.querySelector('.archive-title');if(title&&title.textContent!=='Trobar i reactivar loops conservats.')title.textContent='Trobar i reactivar loops conservats.';}
}
function applyBeta12(){
  document.documentElement.dataset.portal='beta12';
  const topEy=[...document.querySelectorAll('main > .ey')][0];if(topEy)topEy.textContent='ANÍMIC PROTEIN · PORTAL MULTIMÈDIA β·12';
  const intro=document.querySelector('main > h1 + .mut');if(intro)intro.textContent='Una font entra una vegada, passa per instruments i conserva cada transformació a Archivum / Arxiu Viu.';
  const circ=$('#circulation');if(circ){const ey=circ.querySelector('.ey');if(ey)ey.textContent='β·12 · RUTA SIMPLE';const h=circ.querySelector('h2');if(h)h.textContent='FONT → INSTRUMENT → TRANSFORMACIÓ → ARCHIVUM';}
  const route=$('.circulation-route');if(route)route.innerHTML='<span class="pulse" data-pulse="source">FONT</span><span class="pulse" data-pulse="looperum">Looperum</span><span class="pulse" data-pulse="pulsarium">Pulsarium</span><span class="pulse beta12-experimental" data-pulse="videodrome">Videodrum · en prova</span><span class="pulse" data-pulse="archivum">Archivum / Arxiu Viu</span>';
  const actions=$('#circulation .actions');if(actions){const a=$('#circulateArchive');if(a)a.textContent='→ Archivum / Arxiu Viu';const v=$('#circulateVideo');if(v){v.textContent='→ Videodrum · prova';v.classList.add('beta12-experimental')}}
  const organs=$('.organs');if(organs){[...organs.querySelectorAll('.organ')].forEach(c=>{const name=c.querySelector('h2')?.textContent?.trim();if(name==='Archivum'||name==='Looparium'){c.remove();return}if(name==='Videodrum'){c.classList.add('beta12-experimental');const ey=c.querySelector('.ey');if(ey)ey.textContent='INSTRUMENT VISUAL · EN PROVA';const p=c.querySelector('.mut');if(p)p.textContent='Només sobreviurà com a òrgan autònom si una prova real demostra una diferència perceptible pròpia.'}});const puls=[...organs.querySelectorAll('.organ')].find(c=>c.querySelector('h2')?.textContent?.trim()==='Pulsarium');if(puls){const ey=puls.querySelector('.ey');if(ey)ey.textContent='INSTRUMENT RÍTMIC / SAMPLER · β·11.5 CONGELAT';}}
  normalizeArchiveVocabulary();
  const save=$('#save');if(save)save.textContent='Conservar loop → Archivum / Arxiu Viu';
  const ant=$('#antSuggest');if(ant)ant.textContent='🐜 La formiga només apareix quan hi ha una relació accionable; no és navegació ni decoració.';
  const trace=$('#trace');if(trace)trace.textContent='🐜 β·12 · Occam: una font, instruments pertinents, una memòria viva.';
  if(!$('#beta12-style')){const st=document.createElement('style');st.id='beta12-style';st.textContent='.beta12-experimental{opacity:.62;border-style:dashed!important}.beta12-experimental::after{content:" · ?";color:var(--o)}.organs{grid-template-columns:repeat(3,1fr)}@media(max-width:760px){.organs{grid-template-columns:1fr}}';document.head.append(st)}
  const arch=$('#archivum');if(arch&&!arch.dataset.beta12Observed){arch.dataset.beta12Observed='1';new MutationObserver(()=>normalizeArchiveVocabulary()).observe(arch,{childList:true,subtree:true})}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(applyBeta12,0));else setTimeout(applyBeta12,0);
