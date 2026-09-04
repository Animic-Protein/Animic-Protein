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
      let loops=db.objectStoreNames.contains(LOOP_STORE)?req.transaction.objectStore(LOOP_STORE):db.createObjectStore(LOOP_STORE,{keyPath:'id'});
      if(!loops.indexNames.contains('savedAt'))loops.createIndex('savedAt','savedAt');
      if(!loops.indexNames.contains('archiveName'))loops.createIndex('archiveName','archive.name');
      if(!loops.indexNames.contains('rootRecordId'))loops.createIndex('rootRecordId','record.provenance.rootRecordId');
      if(!db.objectStoreNames.contains(ARCHIVE_STORE)){
        const archive=db.createObjectStore(ARCHIVE_STORE,{keyPath:'id'});
        archive.createIndex('savedAt','savedAt');archive.createIndex('kind','kind');archive.createIndex('rootRecordId','record.provenance.rootRecordId');
      }
    };
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
}
function txStore(name,mode,work){return openDb().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction(name,mode),store=tx.objectStore(name);let result;try{result=work(store)}catch(err){db.close();reject(err);return}tx.oncomplete=()=>{db.close();resolve(result)};tx.onerror=()=>{db.close();reject(tx.error)};tx.onabort=()=>{db.close();reject(tx.error||new Error('IndexedDB aborted'))}}))}
function emit(name,reason='changed',id=null){try{window.dispatchEvent(new CustomEvent(name,{detail:{reason,id}}))}catch{}}
function normalizeLoop(entry){const now=Date.now(),a=entry.archive||{};return {...entry,archive:{name:a.name||entry.name||'Loop sense nom',tags:Array.isArray(a.tags)?a.tags:[],note:a.note||'',pinned:Boolean(a.pinned),createdAt:a.createdAt||entry.savedAt||now,updatedAt:a.updatedAt||now}}}
function normalizeArchive(entry){const now=Date.now(),s=entry.technicalSheet||{};return {...entry,savedAt:entry.savedAt||now,name:entry.name||entry.record?.source?.name||'Element sense nom',kind:entry.kind||entry.record?.source?.kind||'unknown',tags:Array.isArray(entry.tags)?entry.tags:[],note:entry.note||'',pinned:Boolean(entry.pinned),technicalSheet:{title:s.title||entry.name||entry.record?.source?.name||'',description:s.description||'',instrument:s.instrument||entry.kind||'',transformation:s.transformation||'',perceptibleDifference:s.perceptibleDifference||'',relations:s.relations||'',author:s.author||'',rights:s.rights||'',license:s.license||'',sourceNote:s.sourceNote||'',updatedAt:s.updatedAt||0}}}

export async function requestDurableStorage(){try{if(!navigator.storage?.persist)return false;if(await navigator.storage.persisted?.())return true;return await navigator.storage.persist()}catch{return false}}
export async function saveLoopEntry(entry){const row=normalizeLoop(entry);await txStore(LOOP_STORE,'readwrite',s=>s.put(row));emit('looparium:changed','save',row.id);return row}
export async function loadLoopEntries(){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(LOOP_STORE,'readonly'),req=tx.objectStore(LOOP_STORE).getAll();req.onsuccess=()=>resolve((req.result||[]).map(normalizeLoop).sort((a,b)=>(b.savedAt||0)-(a.savedAt||0)));req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}
export async function updateLoopMetadata(id,patch={}){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(LOOP_STORE,'readwrite'),store=tx.objectStore(LOOP_STORE),get=store.get(id);get.onsuccess=()=>{if(!get.result){reject(new Error('Loop not found'));return}const row=normalizeLoop(get.result);row.archive={...row.archive,...patch,updatedAt:Date.now()};if(Array.isArray(patch.tags))row.archive.tags=[...new Set(patch.tags.map(x=>String(x).trim()).filter(Boolean))];store.put(row)};get.onerror=()=>reject(get.error);tx.oncomplete=()=>{db.close();emit('looparium:changed','metadata',id);resolve(true)};tx.onerror=()=>{db.close();reject(tx.error)}})}
export async function deleteLoopEntry(id){await txStore(LOOP_STORE,'readwrite',s=>s.delete(id));emit('looparium:changed','delete',id)}
export async function clearLooparium(){await txStore(LOOP_STORE,'readwrite',s=>s.clear());emit('looparium:changed','clear')}

export async function saveArchiveEntry(entry){const row=normalizeArchive(entry);if(!archiveMemory)archiveMemory=[];archiveMemory=[row,...archiveMemory.filter(x=>x.id!==row.id)].sort((a,b)=>(b.savedAt||0)-(a.savedAt||0));emit('archivum:changed','save',row.id);txStore(ARCHIVE_STORE,'readwrite',s=>s.put(row)).catch(()=>{});return row}
export async function loadArchiveEntries(){if(archiveMemory)return [...archiveMemory];const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(ARCHIVE_STORE,'readonly'),req=tx.objectStore(ARCHIVE_STORE).getAll();req.onsuccess=()=>{archiveMemory=(req.result||[]).map(normalizeArchive).sort((a,b)=>(b.savedAt||0)-(a.savedAt||0));resolve([...archiveMemory])};req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}
export async function updateArchiveMetadata(id,patch={}){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(ARCHIVE_STORE,'readwrite'),store=tx.objectStore(ARCHIVE_STORE),get=store.get(id);get.onsuccess=()=>{if(!get.result){reject(new Error('Archive item not found'));return}const row=normalizeArchive(get.result),sheetPatch=patch.technicalSheet||{};Object.assign(row,patch);if(Array.isArray(patch.tags))row.tags=[...new Set(patch.tags.map(x=>String(x).trim()).filter(Boolean))];row.technicalSheet={...row.technicalSheet,...sheetPatch,updatedAt:Date.now()};store.put(row);if(archiveMemory)archiveMemory=archiveMemory.map(x=>x.id===id?normalizeArchive(row):x)};get.onerror=()=>reject(get.error);tx.oncomplete=()=>{db.close();emit('archivum:changed','metadata',id);resolve(true)};tx.onerror=()=>{db.close();reject(tx.error)}})}
export async function deleteArchiveEntry(id){await txStore(ARCHIVE_STORE,'readwrite',s=>s.delete(id));if(archiveMemory)archiveMemory=archiveMemory.filter(x=>x.id!==id);emit('archivum:changed','delete',id)}

const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));
let loopToolsInstalled=false;
async function installLoopTools(){
  if(loopToolsInstalled)return;loopToolsInstalled=true;
  const section=document.getElementById('looparium'),list=document.getElementById('loops');if(!section||!list)return;
  let box=document.getElementById('looparium-tools');if(!box){box=document.createElement('div');box.id='looparium-tools';box.className='archive-tools';box.innerHTML='<div class="ey">CAMBRA DE LOOPS · ARCHIVUM / ARXIU VIU</div><div class="archive-title">Trobar i reactivar loops conservats.</div><div class="archive-toolbar"><input id="loopSearch" type="search" placeholder="Cerca nom, etiqueta, mode…"><select id="loopSort"><option value="recent">Més recents</option><option value="name">Nom A–Z</option><option value="generation">Generació</option><option value="family">Famílies</option></select></div>';list.before(box)}
  const decorate=async()=>{const entries=await loadLoopEntries().catch(()=>[]),cards=[...list.querySelectorAll('.loop')],byRecent=[...entries].sort((a,b)=>(b.savedAt||0)-(a.savedAt||0));cards.forEach((card,i)=>{const e=byRecent[i];if(!e)return;card.dataset.loopId=e.id;let meta=card.querySelector('.loop-meta-edit');if(!meta){meta=document.createElement('div');meta.className='loop-meta-edit';card.append(meta)}const a=e.archive||{};meta.innerHTML=`<div class="archive-grid"><label>Nom<input class="lname" value="${esc(a.name||e.name)}"></label><label>Etiquetes<input class="ltags" value="${esc((a.tags||[]).join(', '))}"></label><label class="wide">Nota<input class="lnote" value="${esc(a.note||'')}"></label></div><div class="actions"><button class="btn lsave" data-id="${e.id}">Guardar fitxa</button></div>`});list.querySelectorAll('.lsave').forEach(b=>b.onclick=async()=>{const c=b.closest('.loop');await updateLoopMetadata(b.dataset.id,{name:c.querySelector('.lname').value.trim()||'Loop sense nom',tags:c.querySelector('.ltags').value.split(',').map(x=>x.trim()).filter(Boolean),note:c.querySelector('.lnote').value.trim()});b.textContent='✓ Guardat'});const search=(document.getElementById('loopSearch')?.value||'').toLowerCase();cards.forEach(c=>{const e=entries.find(x=>x.id===c.dataset.loopId),a=e?.archive||{},hay=[a.name,e?.name,e?.mode,e?.kind,a.note,...(a.tags||[])].join(' ').toLowerCase();c.hidden=Boolean(search&&!hay.includes(search))})};
  box.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',decorate));window.addEventListener('looparium:changed',()=>setTimeout(decorate,20));decorate();
}
function normalizeVideodrumName(){const root=document.body;if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(n=>{if(n.nodeValue?.includes('Videodrome'))n.nodeValue=n.nodeValue.replaceAll('Videodrome','Videodrum').replaceAll('VIDEODROME','VIDEODRUM')})}
function boot(){const loops=document.getElementById('showLoops');if(loops&&!loops.dataset.lazyLoopTools){loops.dataset.lazyLoopTools='1';loops.addEventListener('click',()=>setTimeout(installLoopTools,0),{passive:true})}const idle=window.requestIdleCallback||((fn)=>setTimeout(fn,800));idle(normalizeVideodrumName)}
if(typeof window!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()}
