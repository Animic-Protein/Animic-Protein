const loadScript=(src)=>new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=src;
  script.onload=resolve;
  script.onerror=()=>reject(new Error(`No s'ha pogut carregar ${src}`));
  document.body.appendChild(script);
});

(async()=>{
  await loadScript('./foundation.js');
  await loadScript('./core.js');
  await loadScript('./germinacio.js');
  await loadScript('./phase3.js');
  await loadScript('./seed-bridge.js');
  await loadScript('./compost-cycle.js');
  await loadScript('./metabolism.js');
  await loadScript('./homeostasis.js');
  window.AnimicFoundation?.afterBoot?.();
})().catch(error=>{
  console.error('[Còdex Viu] Error d’arrencada:',error);
  const output=document.getElementById('relation-output');
  if(output) output.textContent='El Còdex no ha pogut completar l’arrencada. Recarrega la pàgina per tornar-ho a provar.';
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
