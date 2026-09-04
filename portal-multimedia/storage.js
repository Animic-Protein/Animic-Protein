const DB_NAME='animic-looparium';
const DB_VERSION=2;
const STORE='loops';

function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      let store;
      if(!db.objectStoreNames.contains(STORE)){
        store=db.createObjectStore(STORE,{keyPath:'id'});
      }else{
        store=req.transaction.objectStore(STORE);
      }
      if(!store.indexNames.contains('savedAt')) store.createIndex('savedAt','savedAt');
      if(!store.indexNames.contains('archiveName')) store.createIndex('archiveName','archive.name');
      if(!store.indexNames.contains('rootRecordId')) store.createIndex('rootRecordId','record.provenance.rootRecordId');
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

function withStore(mode,work){
  return openDb().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode);
    const store=tx.objectStore(STORE);
    let result;
    try{result=work(store)}catch(err){db.close();reject(err);return}
    tx.oncomplete=()=>{db.close();resolve(result)};
    tx.onerror=()=>{db.close();reject(tx.error)};
    tx.onabort=()=>{db.close();reject(tx.error||new Error('IndexedDB aborted'))};
  }));
}

function emitChanged(reason='changed',id=null){
  try{window.dispatchEvent(new CustomEvent('looparium:changed',{detail:{reason,id}}))}catch{}
}

function normalizeEntry(entry){
  const now=Date.now();
  const archive=entry.archive||{};
  return {
    ...entry,
    archive:{
      name:archive.name||entry.name||'Loop sense nom',
      tags:Array.isArray(archive.tags)?archive.tags:[],
      note:archive.note||'',
      pinned:Boolean(archive.pinned),
      createdAt:archive.createdAt||entry.savedAt||now,
      updatedAt:archive.updatedAt||now
    }
  };
}

export async function requestDurableStorage(){
  try{
    if(!navigator.storage?.persist)return false;
    if(await navigator.storage.persisted?.())return true;
    return await navigator.storage.persist();
  }catch{return false}
}

export async function saveLoopEntry(entry){
  const normalized=normalizeEntry(entry);
  await withStore('readwrite',store=>store.put(normalized));
  emitChanged('save',normalized.id);
  return normalized;
}

export async function loadLoopEntries(){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readonly');
    const req=tx.objectStore(STORE).getAll();
    req.onsuccess=()=>{
      const rows=(req.result||[]).map(normalizeEntry).sort((a,b)=>(b.savedAt||0)-(a.savedAt||0));
      resolve(rows);
    };
    req.onerror=()=>reject(req.error);
    tx.oncomplete=()=>db.close();
  });
}

export async function updateLoopMetadata(id,patch={}){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readwrite');
    const store=tx.objectStore(STORE);
    const get=store.get(id);
    get.onsuccess=()=>{
      if(!get.result){reject(new Error('Loop not found'));return}
      const row=normalizeEntry(get.result);
      row.archive={...row.archive,...patch,updatedAt:Date.now()};
      if(Array.isArray(patch.tags))row.archive.tags=[...new Set(patch.tags.map(x=>String(x).trim()).filter(Boolean))];
      store.put(row);
    };
    get.onerror=()=>reject(get.error);
    tx.oncomplete=()=>{db.close();emitChanged('metadata',id);resolve(true)};
    tx.onerror=()=>{db.close();reject(tx.error)};
  });
}

export async function deleteLoopEntry(id){
  await withStore('readwrite',store=>store.delete(id));
  emitChanged('delete',id);
}

export async function clearLooparium(){
  await withStore('readwrite',store=>store.clear());
  emitChanged('clear');
}

function esc(value=''){
  return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function injectArchiveStyles(){
  if(document.getElementById('looparium-beta08-style'))return;
  const style=document.createElement('style');
  style.id='looparium-beta08-style';
  style.textContent=`
  .archive08{margin:12px 0 16px;padding:14px;border:1px solid #244a64;border-radius:16px;background:#050d14}
  .archive08-head{display:flex;justify-content:space-between;gap:12px;align-items:end;flex-wrap:wrap}
  .archive08-title{font:400 1.45rem Georgia,serif}.archive08-count{color:#aebdca;font-size:.82rem}
  .archive08-tools{display:grid;grid-template-columns:minmax(160px,1fr) minmax(120px,.45fr) minmax(130px,.45fr);gap:8px;margin-top:10px}
  .archive08 input,.archive08 select,.archive-meta input{width:100%;min-height:40px;border:1px solid #244a64;border-radius:12px;background:#07111b;color:#f8fbff;padding:.55rem .7rem;font:inherit}
  .archive-meta{margin-top:10px;padding:10px;border-top:1px solid #244a64;display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .archive-meta .wide{grid-column:1/-1}.archive-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.archive-tag{border:1px solid #3fff6760;border-radius:999px;padding:.15rem .45rem;color:#bfffc9;font-size:.72rem}
  .archive-lineage{margin-top:8px;color:#aebdca;font-size:.78rem}.archive-lineage strong{color:#3fff67}.archive-save{min-height:38px!important;font-size:.82rem}.archive-pin{border-color:#e3a629!important}.archive-pin.active{background:#392d0d!important}
  .loop.archive-hidden{display:none}.loop.archive-family{box-shadow:inset 3px 0 #3fff67}.archive-family-label{display:inline-block;margin-left:6px;color:#3fff67;font-size:.72rem}
  @media(max-width:700px){.archive08-tools,.archive-meta{grid-template-columns:1fr}.archive-meta .wide{grid-column:auto}}
  `;
  document.head.append(style);
}

function installArchiveUI(){
  const section=document.getElementById('looparium');
  const list=document.getElementById('loops');
  if(!section||!list||document.getElementById('archive08'))return;
  injectArchiveStyles();
  const box=document.createElement('div');
  box.className='archive08';box.id='archive08';
  box.innerHTML=`<div class="archive08-head"><div><div class="ey">β·08 · ARXIU VIU</div><div class="archive08-title">Trobar, anomenar, relacionar.</div></div><div class="archive08-count" id="archive08Count">—</div></div><div class="archive08-tools"><input id="archive08Search" type="search" placeholder="Cerca nom, etiqueta, mode…"><input id="archive08Tag" type="search" placeholder="Filtra etiqueta"><select id="archive08Sort"><option value="recent">Més recents</option><option value="name">Nom A–Z</option><option value="generation">Generació</option><option value="family">Famílies</option></select></div>`;
  list.before(box);
  const refresh=()=>decorateArchiveCards();
  box.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',refresh));
  window.addEventListener('looparium:changed',()=>setTimeout(refresh,30));
  const observer=new MutationObserver(()=>setTimeout(refresh,0));
  observer.observe(list,{childList:true});
  refresh();
}

async function decorateArchiveCards(){
  const list=document.getElementById('loops');
  const box=document.getElementById('archive08');
  if(!list||!box)return;
  const entries=await loadLoopEntries().catch(()=>[]);
  const cards=[...list.querySelectorAll('.loop')];
  if(!cards.length){document.getElementById('archive08Count').textContent='0 loops';return}

  const byRecent=[...entries].sort((a,b)=>(b.savedAt||0)-(a.savedAt||0));
  const roots=new Map();
  entries.forEach(e=>{const root=e.record?.provenance?.rootRecordId||e.id;if(!roots.has(root))roots.set(root,[]);roots.get(root).push(e)});

  cards.forEach((card,index)=>{
    const entry=byRecent[index];
    if(!entry)return;
    card.dataset.loopId=entry.id;
    const root=entry.record?.provenance?.rootRecordId||entry.id;
    const family=roots.get(root)||[entry];
    card.classList.toggle('archive-family',family.length>1);
    let meta=card.querySelector('.archive-meta');
    if(!meta){meta=document.createElement('div');meta.className='archive-meta';card.append(meta)}
    const a=entry.archive||{};
    meta.innerHTML=`<label>Nom<input class="archive-name" value="${esc(a.name||entry.name)}"></label><label>Etiquetes<input class="archive-tags-input" value="${esc((a.tags||[]).join(', '))}" placeholder="ritme, veu, error…"></label><label class="wide">Nota<input class="archive-note" value="${esc(a.note||'')}" placeholder="Una línia, si aporta diferència."></label><div class="wide actions"><button class="btn archive-save" data-save="${entry.id}">Guardar fitxa</button><button class="btn archive-pin ${a.pinned?'active':''}" data-pin="${entry.id}">${a.pinned?'★ Fixat':'☆ Fixar'}</button></div><div class="wide archive-tags">${(a.tags||[]).map(t=>`<span class="archive-tag">${esc(t)}</span>`).join('')}</div><div class="wide archive-lineage"><strong>gen ${entry.record?.provenance?.generation??0}</strong> · família ${family.length} · arrel <code>${esc(String(root).slice(0,14))}…</code>${family.length>1?'<span class="archive-family-label">relació visible</span>':''}</div>`;
  });

  list.querySelectorAll('[data-save]').forEach(btn=>btn.onclick=async()=>{
    const card=btn.closest('.loop'),id=btn.dataset.save;
    const name=card.querySelector('.archive-name').value.trim()||'Loop sense nom';
    const tags=card.querySelector('.archive-tags-input').value.split(',').map(x=>x.trim()).filter(Boolean);
    const note=card.querySelector('.archive-note').value.trim();
    await updateLoopMetadata(id,{name,tags,note});
  });
  list.querySelectorAll('[data-pin]').forEach(btn=>btn.onclick=async()=>{
    const id=btn.dataset.pin,entry=entries.find(x=>x.id===id);await updateLoopMetadata(id,{pinned:!entry?.archive?.pinned});
  });

  const search=(document.getElementById('archive08Search')?.value||'').trim().toLowerCase();
  const tag=(document.getElementById('archive08Tag')?.value||'').trim().toLowerCase();
  const sort=document.getElementById('archive08Sort')?.value||'recent';
  const mapped=cards.map(card=>({card,entry:entries.find(e=>e.id===card.dataset.loopId)})).filter(x=>x.entry);
  mapped.forEach(({card,entry})=>{
    const a=entry.archive||{},hay=[a.name,entry.name,entry.mode,entry.kind,a.note,...(a.tags||[])].join(' ').toLowerCase();
    const tags=(a.tags||[]).map(x=>x.toLowerCase());
    card.classList.toggle('archive-hidden',Boolean((search&&!hay.includes(search))||(tag&&!tags.some(t=>t.includes(tag)))));
  });
  mapped.sort((x,y)=>{
    const ax=x.entry.archive||{},ay=y.entry.archive||{};
    if(Boolean(ax.pinned)!==Boolean(ay.pinned))return ax.pinned?-1:1;
    if(sort==='name')return String(ax.name||x.entry.name).localeCompare(String(ay.name||y.entry.name),'ca');
    if(sort==='generation')return (y.entry.record?.provenance?.generation||0)-(x.entry.record?.provenance?.generation||0);
    if(sort==='family')return String(x.entry.record?.provenance?.rootRecordId||x.entry.id).localeCompare(String(y.entry.record?.provenance?.rootRecordId||y.entry.id));
    return (y.entry.savedAt||0)-(x.entry.savedAt||0);
  }).forEach(({card})=>list.append(card));
  const visible=mapped.filter(x=>!x.card.classList.contains('archive-hidden')).length;
  document.getElementById('archive08Count').textContent=`${visible}/${entries.length} loops · ${roots.size} famílies`;
}

if(typeof window!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(installArchiveUI,0));
  else setTimeout(installArchiveUI,0);
}
