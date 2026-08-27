const loadScript=(src)=>new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=src;
  script.defer=true;
  script.onload=resolve;
  script.onerror=()=>reject(new Error(`No s'ha pogut carregar ${src}`));
  document.body.appendChild(script);
});

const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||
  (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

const critical=[
  './foundation.js',
  './core.js',
  './germinacio.js',
  './phase3.js',
  './seed-bridge.js'
];

const secondary=[
  './compost-cycle.js',
  './metabolism.js',
  './homeostasis.js',
  './lineage.js',
  './breathing.js',
  './attention.js',
  './context-propi.js',
  './promocio.js',
  './branques.js',
  './pressio.js',
  './homeostasi-constitucional.js',
  './histeresi.js',
  './allostasi.js',
  './consolidacio.js',
  './reconsolidacio.js',
  './ressonancia.js',
  './rosa.js'
];

const boot=async()=>{
  for(const src of critical) await loadScript(src);
  window.AnimicFoundation?.afterBoot?.();
  const loadSecondary=async()=>{
    for(const src of secondary){
      try{ await loadScript(src); }
      catch(error){ console.warn('[Còdex Viu] Capa opcional no carregada:',src,error); }
    }
  };
  if(isIOS){
    window.setTimeout(loadSecondary,1800);
  }else if('requestIdleCallback' in window){
    requestIdleCallback(loadSecondary,{timeout:2200});
  }else{
    window.setTimeout(loadSecondary,600);
  }
};

boot().catch(error=>{
  console.error('[Còdex Viu] Error d’arrencada:',error);
  const output=document.getElementById('relation-output');
  if(output) output.textContent='El nucli del Còdex ha tingut un problema d’arrencada. Recarrega la pàgina per tornar-ho a provar.';
});

if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
      registration.update();
    }catch(error){
      console.warn('[Còdex Viu] Service worker no disponible:',error);
    }
  });
}
