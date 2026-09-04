const LARGE_VIDEO_BYTES=48*1024*1024;
const originalFileArrayBuffer=File.prototype.arrayBuffer;
if(!File.prototype.__animicVideoGuard){
  Object.defineProperty(File.prototype,'__animicVideoGuard',{value:true});
  File.prototype.arrayBuffer=function(){
    if(this.type?.startsWith('video/')&&this.size>LARGE_VIDEO_BYTES){
      return Promise.reject(new DOMException('Large video decode deferred','AbortError'));
    }
    return originalFileArrayBuffer.call(this);
  };
}
function status(msg){const el=document.getElementById('vstatus');if(el)el.textContent=msg}
function hardenVideo(el){
  if(!(el instanceof HTMLVideoElement)||el.dataset.animicReady)return;
  el.dataset.animicReady='1';
  el.playsInline=true;
  el.setAttribute('playsinline','');
  el.setAttribute('webkit-playsinline','');
  el.preload='auto';
  el.controls=true;
  el.addEventListener('loadstart',()=>status('Videodrum · preparant la font local…'),{once:true});
  el.addEventListener('loadedmetadata',()=>status(`Videodrum · vídeo preparat · ${Number.isFinite(el.duration)?el.duration.toFixed(1)+' s':'durada disponible'}`),{once:true});
  el.addEventListener('loadeddata',()=>status('Videodrum · primer fotograma disponible.'),{once:true});
  el.addEventListener('canplay',()=>status('Videodrum · preparat per reproduir i intervenir.'),{once:true});
  el.addEventListener('error',()=>{const e=el.error;status(`Videodrum · error de vídeo${e?.code?` (${e.code})`:''}. Prova Arxius si Fototeca ha lliurat un format incompatible.`)},{once:true});
  try{el.load()}catch{}
}
function scan(){document.querySelectorAll('#vstage video,#stage video,#pSource video').forEach(hardenVideo)}
const obs=new MutationObserver(records=>{for(const r of records){for(const n of r.addedNodes){if(n.nodeType!==1)continue;if(n.matches?.('video'))hardenVideo(n);n.querySelectorAll?.('video').forEach(hardenVideo)}}});
function boot(){
  const root=document.getElementById('vstage')?.parentElement||document.body;
  obs.observe(root,{childList:true,subtree:true});
  scan();
  document.addEventListener('change',e=>{
    const input=e.target;if(!(input instanceof HTMLInputElement)||input.type!=='file')return;
    const f=input.files?.[0];if(!f?.type?.startsWith('video/'))return;
    status(`Videodrum · ${f.name} seleccionat · ${(f.size/1048576).toFixed(1)} MB. Obrint sense decodificar el fitxer complet…`);
    setTimeout(scan,0);setTimeout(scan,80);setTimeout(scan,400);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
