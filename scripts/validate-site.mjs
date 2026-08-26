import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const failures=[];

const app=read('app.js');
const scriptRefs=[...app.matchAll(/'\.\/(.+?\.js)'/g)].map(m=>m[1]);
for(const ref of scriptRefs){if(!exists(ref))failures.push('app.js referencia un script inexistent: '+ref);}

const sw=read('sw.js');
const assetRefs=[...sw.matchAll(/'\.\/(.*?)'/g)].map(m=>m[1]).filter(Boolean);
for(const ref of assetRefs){
  if(ref===''||ref==='.'){continue}
  if(!exists(ref))failures.push('sw.js referencia un recurs inexistent: '+ref);
}

const html=read('index.html');
for(const id of ['living-map','node-panel','relation-output']){
  if(!html.includes('id="'+id+'"')&&!html.includes("id='"+id+"'"))failures.push('index.html no conté #'+id);
}

const allJs=fs.readdirSync(root).filter(n=>n.endsWith('.js'));
if(!allJs.includes('core.js')||!allJs.includes('germinacio.js'))failures.push('Falten fitxers crítics del nucli.');

if(failures.length){
  console.error('Validació del Còdex: ERROR');
  failures.forEach(x=>console.error(' - '+x));
  process.exit(1);
}
console.log('Validació del Còdex: OK');
console.log('Scripts carregats:',scriptRefs.length);
console.log('Recursos offline verificats:',assetRefs.length);
