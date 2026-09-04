const DB_NAME='animic-looparium';
const DB_VERSION=1;
const STORE='loops';

function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(STORE)){
        const store=db.createObjectStore(STORE,{keyPath:'id'});
        store.createIndex('savedAt','savedAt');
      }
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
    try{ result=work(store); }catch(err){ db.close(); reject(err); return; }
    tx.oncomplete=()=>{ db.close(); resolve(result); };
    tx.onerror=()=>{ db.close(); reject(tx.error); };
    tx.onabort=()=>{ db.close(); reject(tx.error||new Error('IndexedDB aborted')); };
  }));
}

export async function requestDurableStorage(){
  try{
    if(!navigator.storage?.persist) return false;
    if(await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  }catch{ return false; }
}

export function saveLoopEntry(entry){
  return withStore('readwrite',store=>store.put(entry));
}

export async function loadLoopEntries(){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readonly');
    const req=tx.objectStore(STORE).getAll();
    req.onsuccess=()=>{
      const rows=(req.result||[]).sort((a,b)=>(b.savedAt||0)-(a.savedAt||0));
      resolve(rows);
    };
    req.onerror=()=>reject(req.error);
    tx.oncomplete=()=>db.close();
  });
}

export function deleteLoopEntry(id){
  return withStore('readwrite',store=>store.delete(id));
}

export function clearLooparium(){
  return withStore('readwrite',store=>store.clear());
}
