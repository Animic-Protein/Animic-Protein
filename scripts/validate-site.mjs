import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const failures=[];
const normalizeLocal=ref=>ref.split(/[?#]/,1)[0].replace(/^\.\//,'');

const app=read('app.js');
const scriptRefs=[...app.matchAll(/'\.\/(.+?\.js)'/g)].map(m=>m[1]);
const loadedScriptRefs=scriptRefs.filter(ref=>ref!=='sw.js');
for(const ref of scriptRefs){if(!exists(ref))failures.push('app.js referencia un script inexistent: '+ref);}

const sw=read('sw.js');
const assetRefs=[...sw.matchAll(/'\.\/(.*?)'/g)].map(m=>m[1]).filter(Boolean);
for(const ref of assetRefs){
  if(ref===''||ref==='.'){continue}
  if(!exists(ref))failures.push('sw.js referencia un recurs inexistent: '+ref);
}

const html=read('index.html');
for(const marker of ['class="threshold"','class="enter"','href="./universe/"','formiga.css','formiga.js']){
  if(!html.includes(marker))failures.push('El llindar canònic no conté el marcador actual: '+marker);
}
if(!exists('universe/index.html')) failures.push('Falta la navegació presencial universe/index.html.');
else{
  const universe=read('universe/index.html');
  for(const id of ['stage','organ','trace','ant','returnText']){
    if(!universe.includes('id="'+id+'"')&&!universe.includes("id='"+id+"'")) failures.push('La navegació presencial no conté #'+id);
  }
}

const localRefs=[...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)]
  .map(match=>match[1])
  .filter(ref=>!ref.startsWith('#')&&!/^(?:https?:|data:|mailto:|tel:)/.test(ref));
for(const ref of localRefs){
  const target=normalizeLocal(ref);
  if(target&&!exists(target))failures.push('index.html referencia un recurs inexistent: '+ref);
}

const fragmentRefs=[...html.matchAll(/href=["']#([^"']+)["']/g)].map(match=>match[1]);
for(const id of fragmentRefs){
  if(!html.includes('id="'+id+'"')&&!html.includes("id='"+id+"'")){
    failures.push('index.html referencia un fragment inexistent: #'+id);
  }
}

let manifest;
try{manifest=JSON.parse(read('manifest.webmanifest'))}
catch{failures.push('manifest.webmanifest no és JSON vàlid.');}
if(manifest){
  if(manifest.start_url!=='./'||manifest.scope!=='./'){
    failures.push('El manifest ha de mantenir start_url i scope relatius a l’arrel canònica.');
  }
  for(const icon of manifest.icons||[]){
    const target=normalizeLocal(icon.src||'');
    if(!target||!exists(target))failures.push('El manifest referencia una icona inexistent: '+(icon.src||'(buida)'));
  }
}

for(const ref of loadedScriptRefs){
  if(!assetRefs.includes(ref))failures.push('El mode offline no inclou el script carregat: '+ref);
}
for(const ref of localRefs.map(normalizeLocal).filter(Boolean)){
  if(!assetRefs.includes(ref)&&ref!=='sw.js')failures.push('El mode offline no inclou el recurs de la portada: '+ref);
}

for(const file of ['governanca/ARQUITECTURA.md','governanca/FUSIO_REPOSITORIS.md']){
  const source=read(file);
  if(/`Animic-Protein\/Animic-Protein`/.test(source)){
    failures.push(file+' encara declara el repositori previ com a tronc canònic.');
  }
}

if(!exists('LICENSE.md')){
  failures.push('Falta la llicència canònica LICENSE.md.');
}else{
  const license=read('LICENSE.md');
  for(const marker of ['LICENSE_STATUS: FINAL-RR-1.0','Copyright © 2026 Dàrius Balboa','permís escrit previ','Contribucions']){
    if(!license.includes(marker))failures.push('LICENSE.md no conté el marcador canònic: '+marker);
  }
  if(/LICENSE_STATUS:\s*PENDING/i.test(license))failures.push('La llicència encara consta com a pendent.');
}
if(!exists('governanca/DECISIO_LLICENCIA_2026-08-27.md')){
  failures.push('Falta l’acta de decisió de la llicència definitiva.');
}

const allJs=fs.readdirSync(root).filter(n=>n.endsWith('.js'));
if(!allJs.includes('core.js')||!allJs.includes('germinacio.js'))failures.push('Falten fitxers crítics del nucli.');

if(failures.length){
  console.error('Validació del Còdex: ERROR');
  failures.forEach(x=>console.error(' - '+x));
  process.exit(1);
}
console.log('Validació del Còdex: OK');
console.log('Scripts carregats:',loadedScriptRefs.length);
console.log('Recursos offline verificats:',assetRefs.length);
console.log('Rutes HTML verificades:',localRefs.length+fragmentRefs.length);
