import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const failures=[];
const ok=(cond,msg)=>{if(!cond)failures.push(msg)};

const required=[
  'portal-multimedia/index.html',
  'portal-multimedia/model.js',
  'portal-multimedia/storage.js',
  'portal-multimedia/pulsarium.js',
  'portal-multimedia/beta12-ui.js',
  'portal-multimedia/archivum-sheets-lazy.js',
  'portal-multimedia/media-runtime-hotfix.js',
  'governanca/MUTATIO_GRAMATICA_OPERATIVA_1.0.md',
  'governanca/VIGILIA_CONFLUENTIA_1.0.md',
  'sw.js'
];
required.forEach(p=>ok(exists(p),'Falta recurs crític: '+p));
if(failures.length){console.error(failures.join('\n'));process.exit(1)}

const html=read('portal-multimedia/index.html');
for(const marker of ['id="photoBtn"','id="photo"','id="fileBtn"','id="circulation"','id="looperum"','id="videodrome"','id="archivum"','id="showLoops"','id="archiveList"']){
  ok(html.includes(marker),'Smoke Portal: falta '+marker);
}
ok(html.includes("from './model.js'"),'Smoke Portal: index no importa model.js');
ok(html.includes("from './storage.js'"),'Smoke Portal: index no importa storage.js');

const model=read('portal-multimedia/model.js');
for(const stage of ['source','fragment','loop','transformation','relation','provenance']) ok(model.includes(`"${stage}"`)||model.includes(`'${stage}'`),'Contracte model: falta etapa '+stage);
ok(/destructive\s*:\s*false/.test(model),'Contracte model: la procedència no força destructive=false');
ok(model.includes('rootRecordId'),'Contracte model: falta rootRecordId');
ok(model.includes('parentId'),'Contracte model: falta parentId');
for(const marker of ['CODEX_OPERATIONAL_GRAMMAR','MUTATIO_TESTS','market-data','security-fact','signal','catalyst','history-kline','anomaly','watchlist','strategy','assessMutatio','suggestMutatioDestination','decisionRequired:true','canonical:false']){
  ok(model.includes(marker),'Contracte MUTATIO: falta marcador '+marker);
}
for(const test of ['perceptible-difference','traceability','relation','reversibility'])ok(model.includes(test),'Contracte MUTATIO: falta test '+test);
for(const marker of ['createVigilia','observeVigilia','assessConfluentia','publishConfluentia','CONFLUENTIA_DEFAULT_THRESHOLD','interpretation:null','codex:confluentia']){
  ok(model.includes(marker),'Contracte VIGILIA/CONFLUENTIA: falta marcador '+marker);
}

const grammar=read('governanca/MUTATIO_GRAMATICA_OPERATIVA_1.0.md');
for(const marker of ['gramàtica operativa','Font','Fragment','Relació activa','Transformació','Memòria temporal','Error fèrtil','Looparium d’observació','Instrument','Rastre verificable','La Formiga assenyala; la persona decideix; el Còdex conserva el rastre.']){
  ok(grammar.includes(marker),'Governança MUTATIO: falta '+marker);
}
const attention=read('governanca/VIGILIA_CONFLUENTIA_1.0.md');
for(const marker of ['VIGILIA','CONFLUENTIA','observar no és interpretar','convergència ≠ certesa','codex:confluentia','La Formiga assenyala; la persona decideix; el Còdex conserva el rastre.']){
  ok(attention.includes(marker),'Governança VIGILIA/CONFLUENTIA: falta '+marker);
}
const formiga=read('formiga.js');
for(const marker of ['confluencia','codex:confluentia','rastres independents convergeixen','La convergència no és certesa']){
  ok(formiga.includes(marker),'Formiga/CONFLUENTIA: falta '+marker);
}

const beta=read('portal-multimedia/beta12-ui.js');
for(const marker of ['Archivum / Arxiu Viu','Cambra de loops','Videodrum · en prova','FONT → INSTRUMENT → TRANSFORMACIÓ → ARCHIVUM']){
  ok(beta.includes(marker),'Taxonomia β·12.4: falta marcador '+marker);
}

const storage=read('portal-multimedia/storage.js');
const bootMatch=storage.match(/function boot\(\)\{([\s\S]*?)\}\nif\(typeof window/);
ok(Boolean(bootMatch),'Pressupost de càrrega: no es pot inspeccionar boot() de storage.js');
if(bootMatch){
  const boot=bootMatch[1];
  for(const forbidden of ['openDb(','loadArchiveEntries(','loadLoopEntries(','installLoopTools(','installArchivumSheets(','decodeAudioData','arrayBuffer(']){
    ok(!boot.includes(forbidden),'Pressupost de càrrega: boot() executa feina pesada: '+forbidden);
  }
}
ok(!storage.includes('installPhotoVideoBridge'),'Regressió coneguda: ha reaparegut el doble pont Fototeca → Videodrum');

const hotfix=read('portal-multimedia/media-runtime-hotfix.js');
ok(hotfix.includes('Object URL')||hotfix.includes('object')||hotfix.includes('hardenVideo'),'Runtime multimèdia: falta protecció de càrrega de vídeo');
ok(hotfix.includes('playsinline'),'Runtime multimèdia: falta compatibilitat playsinline');

const sw=read('sw.js');
const cacheMatch=sw.match(/const CACHE = ['"]([^'"]+)['"]/);
ok(Boolean(cacheMatch),'Service Worker: falta nom de cache versionat');
if(cacheMatch)ok(/v\d+$/.test(cacheMatch[1]),'Service Worker: la cache no acaba amb versió numèrica');
for(const asset of ['portal-multimedia/model.js','portal-multimedia/storage.js','portal-multimedia/pulsarium.js','portal-multimedia/beta12-ui.js','portal-multimedia/archivum-sheets-lazy.js','portal-multimedia/media-runtime-hotfix.js']){
  ok(sw.includes(`./${asset}`),'Service Worker: falta asset crític '+asset);
}

const base=process.env.CODEX_DIFF_BASE?.trim();
if(base&&/^[0-9a-f]{7,40}$/i.test(base)&&!/^0+$/.test(base)){
  try{
    const changed=execSync(`git diff --name-only ${base}...HEAD`,{encoding:'utf8'}).trim().split(/\n+/).filter(Boolean);
    const critical=changed.some(p=>p.startsWith('portal-multimedia/')&&/\.(?:js|html)$/.test(p));
    if(critical)ok(changed.includes('sw.js'),'Cache discipline: ha canviat el Portal però sw.js no s’ha versionat/revisat');
  }catch(err){console.warn('Avís: no s’ha pogut auditar el diff de cache:',err.message)}
}

if(failures.length){
  console.error('Auditoria Portal/Homeòstasi: ERROR');
  failures.forEach(x=>console.error(' - '+x));
  process.exit(1);
}
console.log('Auditoria Portal/Homeòstasi/MUTATIO/VIGILIA/CONFLUENTIA: OK');
console.log('Smoke UI, contracte de dades, atenció, convergència, gramàtica operativa, arrencada, cache i regressions verificats.');
