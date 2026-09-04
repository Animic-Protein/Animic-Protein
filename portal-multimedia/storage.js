const DB_NAME='animic-looparium';
const DB_VERSION=3;
const LOOP_STORE='loops';
const ARCHIVE_STORE='archive';
let archiveMemory=null;

function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      let loops;
      if(!db.objectStoreNames.contains(LOOP_STORE)) loops=db.createObjectStore(LOOP_STORE,{keyPath:'id'});
      else loops=req.transaction.objectStore(LOOP_STORE);
      if(!loops.indexNames.contains('savedAt')) loops.createIndex('savedAt','savedAt');
      if(!loops.indexNames.contains('archiveName')) loops.createIndex('archiveName','archive.name');
      if(!loops.indexNames.contains('rootRecordId')) loops.createIndex('rootRecordId','record.provenance.rootRecordId');
      if(!db.objectStoreNames.contains(ARCHIVE_STORE)){
        const archive=db.createObjectStore(ARCHIVE_STORE,{keyPath:'id'});
        archive.createIndex('savedAt','savedAt');
        archive.createIndex('kind','kind');
        archive.createIndex('rootRecordId','record.provenance.rootRecordId');
      }
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

function txStore(name,mode,work){
  return openDb().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(name,mode),store=tx.objectStore(name);let result;
    try{result=work(store)}catch(err){db.close();reject(err);return}
    tx.oncomplete=()=>{db.close();resolve(result)};
    tx.onerror=()=>{db.close();reject(tx.error)};
    tx.onabort=()=>{db.close();reject(tx.error||new Error('IndexedDB aborted'))};
  }));
}
function emit(name,reason='changed',id=null){try{window.dispatchEvent(new CustomEvent(name,{detail:{reason,id}}))}catch{}}
function normalizeLoop(entry){const now=Date.now(),a=entry.archive||{};return {...entry,archive:{name:a.name||entry.name||'Loop sense nom',tags:Array.isArray(a.tags)?a.tags:[],note:a.note||'',pinned:Boolean(a.pinned),createdAt:a.createdAt||entry.savedAt||now,updatedAt:a.updatedAt||now}}}
function normalizeArchive(entry){const now=Date.now();return {...entry,savedAt:entry.savedAt||now,name:entry.name||entry.record?.source?.name||'Element sense nom',kind:entry.kind||entry.record?.source?.kind||'unknown',tags:Array.isArray(entry.tags)?entry.tags:[],note:entry.note||'',pinned:Boolean(entry.pinned)}}

export async function requestDurableStorage(){try{if(!navigator.storage?.persist)return false;if(await navigator.storage.persisted?.())return true;return await navigator.storage.persist()}catch{return false}}

export async function saveLoopEntry(entry){const row=normalizeLoop(entry);await txStore(LOOP_STORE,'readwrite',s=>s.put(row));emit('looparium:changed','save',row.id);return row}
export async function loadLoopEntries(){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(LOOP_STORE,'readonly'),req=tx.objectStore(LOOP_STORE).getAll();req.onsuccess=()=>resolve((req.result||[]).map(normalizeLoop).sort((a,b)=>(b.savedAt||0)-(a.savedAt||0)));req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}
export async function updateLoopMetadata(id,patch={}){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(LOOP_STORE,'readwrite'),store=tx.objectStore(LOOP_STORE),get=store.get(id);get.onsuccess=()=>{if(!get.result){reject(new Error('Loop not found'));return}const row=normalizeLoop(get.result);row.archive={...row.archive,...patch,updatedAt:Date.now()};if(Array.isArray(patch.tags))row.archive.tags=[...new Set(patch.tags.map(x=>String(x).trim()).filter(Boolean))];store.put(row)};get.onerror=()=>reject(get.error);tx.oncomplete=()=>{db.close();emit('looparium:changed','metadata',id);resolve(true)};tx.onerror=()=>{db.close();reject(tx.error)}})}
export async function deleteLoopEntry(id){await txStore(LOOP_STORE,'readwrite',s=>s.delete(id));emit('looparium:changed','delete',id)}
export async function clearLooparium(){await txStore(LOOP_STORE,'readwrite',s=>s.clear());emit('looparium:changed','clear')}

export async function saveArchiveEntry(entry){
  const row=normalizeArchive(entry);
  if(!archiveMemory)archiveMemory=[];
  archiveMemory=[row,...archiveMemory.filter(x=>x.id!==row.id)].sort((a,b)=>(b.savedAt||0)-(a.savedAt||0));
  emit('archivum:changed','save',row.id);
  txStore(ARCHIVE_STORE,'readwrite',s=>s.put(row)).catch(()=>{});
  return row;
}
export async function loadArchiveEntries(){
  if(archiveMemory)return [...archiveMemory];
  const db=await openDb();
  return new Promise((resolve,reject)=>{const tx=db.transaction(ARCHIVE_STORE,'readonly'),req=tx.objectStore(ARCHIVE_STORE).getAll();req.onsuccess=()=>{archiveMemory=(req.result||[]).map(normalizeArchive).sort((a,b)=>(b.savedAt||0)-(a.savedAt||0));resolve([...archiveMemory])};req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})
}
export async function deleteArchiveEntry(id){await txStore(ARCHIVE_STORE,'readwrite',s=>s.delete(id));if(archiveMemory)archiveMemory=archiveMemory.filter(x=>x.id!==id);emit('archivum:changed','delete',id)}

function esc(v=''){return String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function installLoopariumUI(){
  const section=document.getElementById('looparium'),list=document.getElementById('loops');
  if(!section||!list||document.getElementById('looparium-tools'))return;
  const box=document.createElement('div');box.id='looparium-tools';box.className='archive-tools';
  box.innerHTML='<div class="ey">LOOPARIUM · CAMBRA DE LOOPS</div><div class="archive-title">Trobar i reactivar loops.</div><div class="archive-toolbar"><input id="loopSearch" type="search" placeholder="Cerca nom, etiqueta, mode…"><select id="loopSort"><option value="recent">Més recents</option><option value="name">Nom A–Z</option><option value="generation">Generació</option><option value="family">Famílies</option></select></div>';
  list.before(box);
  box.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',decorate));
  window.addEventListener('looparium:changed',()=>setTimeout(decorate,20));
  new MutationObserver(()=>setTimeout(decorate,0)).observe(list,{childList:true});decorate();
}
async function decorate(){
  const list=document.getElementById('loops');if(!list)return;const entries=await loadLoopEntries().catch(()=>[]),cards=[...list.querySelectorAll('.loop')],byRecent=[...entries].sort((a,b)=>(b.savedAt||0)-(a.savedAt||0));
  const roots=new Map();entries.forEach(e=>{const r=e.record?.provenance?.rootRecordId||e.id;if(!roots.has(r))roots.set(r,[]);roots.get(r).push(e)});
  cards.forEach((card,i)=>{const e=byRecent[i];if(!e)return;card.dataset.loopId=e.id;let meta=card.querySelector('.loop-meta-edit');if(!meta){meta=document.createElement('div');meta.className='loop-meta-edit';card.append(meta)}const a=e.archive||{},r=e.record?.provenance?.rootRecordId||e.id,f=roots.get(r)||[e];meta.innerHTML=`<div class="archive-grid"><label>Nom<input class="lname" value="${esc(a.name||e.name)}"></label><label>Etiquetes<input class="ltags" value="${esc((a.tags||[]).join(', '))}"></label><label class="wide">Nota<input class="lnote" value="${esc(a.note||'')}"></label></div><div class="actions"><button class="btn lsave" data-id="${e.id}">Guardar fitxa</button><button class="btn lpin ${a.pinned?'active':''}" data-id="${e.id}">${a.pinned?'★ Fixat':'☆ Fixar'}</button></div><div class="archive-lineage">gen ${e.record?.provenance?.generation??0} · família ${f.length} · arrel <code>${esc(String(r).slice(0,14))}…</code></div>`});
  list.querySelectorAll('.lsave').forEach(b=>b.onclick=async()=>{const c=b.closest('.loop');await updateLoopMetadata(b.dataset.id,{name:c.querySelector('.lname').value.trim()||'Loop sense nom',tags:c.querySelector('.ltags').value.split(',').map(x=>x.trim()).filter(Boolean),note:c.querySelector('.lnote').value.trim()})});
  list.querySelectorAll('.lpin').forEach(b=>b.onclick=async()=>{const e=entries.find(x=>x.id===b.dataset.id);await updateLoopMetadata(b.dataset.id,{pinned:!e?.archive?.pinned})});
  const search=(document.getElementById('loopSearch')?.value||'').toLowerCase(),sort=document.getElementById('loopSort')?.value||'recent';const mapped=cards.map(c=>({card:c,e:entries.find(x=>x.id===c.dataset.loopId)})).filter(x=>x.e);
  mapped.forEach(({card,e})=>{const a=e.archive||{},hay=[a.name,e.name,e.mode,e.kind,a.note,...(a.tags||[])].join(' ').toLowerCase();card.hidden=Boolean(search&&!hay.includes(search))});
  mapped.sort((x,y)=>{const ax=x.e.archive||{},ay=y.e.archive||{};if(Boolean(ax.pinned)!==Boolean(ay.pinned))return ax.pinned?-1:1;if(sort==='name')return String(ax.name||x.e.name).localeCompare(String(ay.name||y.e.name),'ca');if(sort==='generation')return (y.e.record?.provenance?.generation||0)-(x.e.record?.provenance?.generation||0);if(sort==='family')return String(x.e.record?.provenance?.rootRecordId||x.e.id).localeCompare(String(y.e.record?.provenance?.rootRecordId||y.e.id));return (y.e.savedAt||0)-(x.e.savedAt||0)}).forEach(x=>list.append(x.card));
}
function installPhotoVideoBridge(){
  const photo=document.getElementById('photo');
  if(!photo||photo.dataset.videoBridge)return;
  photo.dataset.videoBridge='1';
  photo.addEventListener('change',event=>{
    const f=event.target.files?.[0];
    if(!f||!f.type.startsWith('video/'))return;
    requestAnimationFrame(()=>setTimeout(()=>{
      const btn=document.querySelector('[data-open="videodrome"]');
      if(btn)btn.click();
      const status=document.getElementById('vstatus');
      if(status)status.textContent='Vídeo de Fototeca carregat · Videodrum II preparat.';
    },30));
  },true);
}
function installVideodrumName(){
  const replaceText=root=>{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{if(node.nodeValue?.includes('Videodrome'))node.nodeValue=node.nodeValue.replaceAll('Videodrome','Videodrum').replaceAll('VIDEODROME','VIDEODRUM')});
  };
  replaceText(document.body);
  const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===Node.TEXT_NODE){if(node.nodeValue?.includes('Videodrome'))node.nodeValue=node.nodeValue.replaceAll('Videodrome','Videodrum')}else if(node.nodeType===Node.ELEMENT_NODE)replaceText(node)})));
  observer.observe(document.body,{childList:true,subtree:true});
}
if(typeof window!=='undefined'){
  const boot=()=>{setTimeout(installLoopariumUI,0);setTimeout(installPhotoVideoBridge,0);setTimeout(installVideodrumName,0)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
}
