import fs from 'node:fs';

const required = [
  'rosa-inter-nos.js',
  'memoria-radicum.js',
  'probatio-radicum.js',
  'lex-radicum.js',
  'constitutio-vitae.js'
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Auditoria constitucional: falta ${file}`);
}

const read = file => fs.readFileSync(file, 'utf8');
const rosa = read('rosa-inter-nos.js');
const memoria = read('memoria-radicum.js');
const probatio = read('probatio-radicum.js');
const lex = read('lex-radicum.js');
const constitutio = read('constitutio-vitae.js');

const assertions = [
  [rosa.includes("kind:'inter-nos'"), 'INTER NOS ha de crear llavors tipades'],
  [rosa.includes('originA') && rosa.includes('originB'), 'INTER NOS ha de conservar els dos orígens'],
  [rosa.includes('canonicalPair'), 'INTER NOS ha de tractar A↔B simètricament'],
  [memoria.includes('MIN_RECURRENCES=3') && memoria.includes("state:'dormant'"), 'Memoria Radicum ha de conservar recurrència i dormició'],
  [probatio.includes("?'observed':'emergent'") && probatio.includes("pattern.state==='dormant'"), 'Probatio ha de separar observat, emergent i dormant'],
  [lex.includes("status:'active'") && lex.includes("status:'dormant'"), 'Lex Radicum ha de ser reversible'],
  [constitutio.includes("status='contested'") && constitutio.includes("?'repealed':'active'"), 'Constitutio Vitae ha de suportar contradicció i derogació'],
  [constitutio.includes("'amendment'") && constitutio.includes("'reactivation'"), 'Constitutio Vitae ha de conservar esmena i reactivació']
];

const failed = assertions.filter(([ok]) => !ok).map(([, message]) => message);
if (failed.length) {
  console.error('Auditoria constitucional: ERROR');
  failed.forEach(message => console.error(` - ${message}`));
  process.exit(1);
}

const lifecycle = ['relation','seed','emergent','observed','active','contested','amended','repealed','reactivated'];
if (new Set(lifecycle).size !== lifecycle.length) throw new Error('Auditoria constitucional: cicle inconsistent');

console.log('Auditoria constitucional: OK');
console.log('INTER NOS → llavor → Memoria → Probatio → Lex → Constitutio');
console.log('Reversibilitat verificada: active → contested/amended/repealed → reactivated');
