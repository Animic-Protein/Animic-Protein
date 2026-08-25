const dialogs = document.querySelectorAll('dialog');

document.querySelectorAll('[data-open]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.open);
    if (target && typeof target.showModal === 'function') target.showModal();
  });
});

dialogs.forEach((dialog) => {
  const close = dialog.querySelector('.close');
  if (close) close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
});

const seeds = [
  'Escolta una textura fins que deixi de semblar música. Llavors entra-hi.',
  'Canvia una sola regla del tema i conserva totes les conseqüències.',
  'Comença pel final: deixa que la forma recordi com va néixer.',
  'Fes audible un silenci que normalment amagaries.',
  'Tria un compàs imparell i fes que deixi de notar-se.',
  'Converteix un error en material estructural.',
  'Pregunta a la peça què necessita abans d’afegir-hi res.',
  'Pren una idea aliena al tema i fes-la passar pel compost.',
  'Improvisa una resposta que ningú no hagi demanat.',
  'Redueix la forma fins que només quedi la seva necessitat.'
];

const seedButton = document.getElementById('seed-button');
const seedOutput = document.getElementById('seed-output');

if (seedButton && seedOutput) {
  seedButton.addEventListener('click', () => {
    const previous = seedOutput.dataset.index;
    let index;
    do {
      index = Math.floor(Math.random() * seeds.length);
    } while (seeds.length > 1 && String(index) === previous);
    seedOutput.dataset.index = String(index);
    seedOutput.textContent = seeds[index];
  });
}

const map = document.getElementById('living-map');
const nodeTitle = document.getElementById('node-title');
const nodeDesc = document.getElementById('node-desc');
const relationOutput = document.getElementById('relation-output');
const revealAction = document.getElementById('reveal-action');
const relateAction = document.getElementById('relate-action');
const seedAction = document.getElementById('seed-action');
const nodePanel = document.getElementById('node-panel');

let activeNode = null;
let relationStart = null;
const MEMORY_KEY = 'animic-protein-inter-nos-v2';
const RELATION_STATES = ['canonica', 'emergent', 'sembrada', 'compostada'];

const stateLabels = {
  canonica: 'Canònica',
  emergent: 'Emergent',
  sembrada: 'Sembrada',
  compostada: 'Compostada'
};

const canonicalRelations = {
  'harmonia-viva|retrodansa': {
    title: 'Retroharmonia corporal',
    text: 'La forma harmònica també pot aprendre a caminar enrere: una tensió pot revelar-se abans que la causa que l’ha produïda.',
    action: 'Prova una seqüència harmònica de 4 estats i reconstrueix-la des de l’últim acord fins al primer.'
  },
  'compost|mutatio': {
    title: 'Mutació per descomposició',
    text: 'Allò que es descarta no desapareix: el compost conserva rastres que poden reaparèixer transformats en una nova estructura.',
    action: 'Recupera un fragment rebutjat i canvia-li només una regla abans de tornar-lo a sembrar.'
  },
  'silenci|zajj': {
    title: 'Improvisació negativa',
    text: 'En Zajj-viu, el silenci deixa de ser pausa i es converteix en resposta: també s’improvisa decidint no ocupar l’espai.',
    action: 'Construeix un solo on cada tercera decisió sigui no tocar.'
  },
  'microtonalitat|pedals': {
    title: 'Pedal desviat',
    text: 'Un pedal microtonal converteix la referència estable en una superfície mòbil i obliga l’oïda a redefinir què considera centre.',
    action: 'Mantén un pedal i desplaça’l lentament entre dos semitons sense abandonar-lo del tot.'
  },
  'inter-nos|tracabilitat': {
    title: 'Genealogia de la relació',
    text: 'INTER NOS no només crea connexions: també ha de poder recordar quan van néixer, entre quins nodes i amb quina conseqüència.',
    action: 'Conserva aquesta relació a la memòria viva del mapa.'
  },
  'amo|governanca': {
    title: 'Governar sense imposar',
    text: 'Amo: volo ut sis aplicat a la governança significa crear regles que protegeixin l’emergència d’una forma sense decidir per endavant què ha de ser.',
    action: 'Formula una regla que protegeixi una contribució sense determinar-ne el resultat.'
  },
  'atzar|vortex': {
    title: 'Atzar amb gravetat',
    text: 'El Vòrtex no elimina l’atzar: li dóna camp. Les desviacions aleatòries són atretes, deformades i retornades al sistema.',
    action: 'Genera tres accidents i conserva només el que alteri una relació existent.'
  },
  'rosetta|univers-visual': {
    title: 'Traducció simbòlica',
    text: 'Rosetta converteix l’univers visual en una gramàtica: un símbol pot travessar imatge, text, so i gest sense quedar reduït a una sola lectura.',
    action: 'Tria un símbol de l’escut i tradueix-lo a un gest i a un so.'
  }
};

function normalizeRelationKey(a, b) {
  const aliases = {
    'llavor-mutatio': 'mutatio',
    'univers-visual': 'univers-visual',
    'zajj': 'zajj',
    'harmonia-viva': 'harmonia-viva'
  };
  const na = aliases[a] || a;
  const nb = aliases[b] || b;
  return [na, nb].sort().join('|');
}

function readMemory() {
  try {
    const next = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
    return Array.isArray(next) ? next : [];
  } catch {
    return [];
  }
}

function writeMemory(memory) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory.slice(-24)));
  } catch {
    // El mapa continua funcionant encara que el navegador bloquegi l’emmagatzematge local.
  }
}

function relationIdentity(aId, bId) {
  return [aId, bId].sort().join('::');
}

function getRelationResult(aNode, bNode) {
  const key = normalizeRelationKey(aNode.dataset.node, bNode.dataset.node);
  const canonical = canonicalRelations[key];
  if (canonical) return { ...canonical, state: 'canonica' };

  const a = aNode.dataset.title || aNode.textContent.trim();
  const b = bNode.dataset.title || bNode.textContent.trim();
  return {
    title: 'Relació emergent',
    text: `${a} i ${b} encara no tenen una relació canònica. El Còdex la tracta com una hipòtesi viva, no com una absència.`,
    action: `Pregunta viva: què hauria de canviar en «${a}» perquè «${b}» deixés de ser extern?`,
    state: 'emergent'
  };
}

function rememberRelation(aNode, bNode, result) {
  const memory = readMemory();
  const aId = aNode.dataset.node;
  const bId = bNode.dataset.node;
  const id = relationIdentity(aId, bId);
  const a = aNode.dataset.title || aNode.textContent.trim();
  const b = bNode.dataset.title || bNode.textContent.trim();
  const previous = memory.find((item) => item.id === id);
  const entry = {
    id,
    a,
    b,
    aId,
    bId,
    title: result.title,
    text: result.text,
    action: result.action,
    state: previous?.state || result.state || 'emergent',
    timestamp: new Date().toISOString()
  };
  const next = memory.filter((item) => item.id !== id);
  next.push(entry);
  writeMemory(next);
  renderMemory();
  drawPersistentRelations();
  return entry;
}

function changeRelationState(id, state) {
  if (!RELATION_STATES.includes(state)) return;
  const memory = readMemory().map((item) => item.id === id ? { ...item, state, timestamp: new Date().toISOString() } : item);
  writeMemory(memory);
  renderMemory();
  drawPersistentRelations();
}

function nextState(current) {
  const index = Math.max(0, RELATION_STATES.indexOf(current));
  return RELATION_STATES[(index + 1) % RELATION_STATES.length];
}

function ensureRelationLayer() {
  if (!map) return null;
  let svg = map.querySelector('.relation-layer');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('relation-layer');
    svg.setAttribute('aria-hidden', 'true');
    map.prepend(svg);
  }
  return svg;
}

function nodeCenter(node) {
  const mapRect = map.getBoundingClientRect();
  const rect = node.getBoundingClientRect();
  return {
    x: rect.left - mapRect.left + rect.width / 2,
    y: rect.top - mapRect.top + rect.height / 2
  };
}

function drawPersistentRelations() {
  const svg = ensureRelationLayer();
  if (!svg || !map) return;
  const width = map.clientWidth;
  const height = map.clientHeight;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.innerHTML = '';

  readMemory().forEach((item) => {
    const a = map.querySelector(`[data-node="${item.aId}"]`);
    const b = map.querySelector(`[data-node="${item.bId}"]`);
    if (!a || !b) return;

    const p1 = nodeCenter(a);
    const p2 = nodeCenter(b);
    const dx = p2.x - p1.x;
    const curve = Math.max(28, Math.min(110, Math.abs(dx) * .18));
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${p1.x} ${p1.y} C ${p1.x + dx * .35} ${p1.y - curve}, ${p2.x - dx * .35} ${p2.y + curve}, ${p2.x} ${p2.y}`);
    path.classList.add('living-relation', `state-${item.state || 'emergent'}`);
    path.dataset.relationId = item.id;
    svg.appendChild(path);
  });
}

function flashRelation(aNode, bNode) {
  [aNode, bNode].forEach((node) => {
    node.classList.add('is-related', 'is-pulsing');
    setTimeout(() => node.classList.remove('is-related', 'is-pulsing'), 2600);
  });
}

function showRelation(entry) {
  if (!entry || !relationOutput) return;
  relationOutput.innerHTML = `<strong>${entry.title}</strong><br>${entry.text}<br><span>${entry.action || ''}</span><br><em>Estat: ${stateLabels[entry.state] || stateLabels.emergent}</em>`;
}

function renderMemory() {
  if (!nodePanel) return;
  let memoryBox = nodePanel.querySelector('.relation-memory');
  if (!memoryBox) {
    memoryBox = document.createElement('div');
    memoryBox.className = 'relation-memory';
    nodePanel.appendChild(memoryBox);
  }

  const memory = readMemory().slice(-6).reverse();
  if (!memory.length) {
    memoryBox.innerHTML = '<p class="memory-title">Memòria INTER NOS</p><p class="memory-empty">Encara no hi ha relacions conservades.</p>';
    return;
  }

  memoryBox.innerHTML = `
    <p class="memory-title">Memòria INTER NOS</p>
    <div class="state-legend">
      ${RELATION_STATES.map((state) => `<span class="state-chip state-${state}">${stateLabels[state]}</span>`).join('')}
    </div>
    <div class="memory-list">
      ${memory.map((item) => `<div class="memory-item state-${item.state || 'emergent'}">
        <button class="memory-open" type="button" data-memory-id="${item.id}"><strong>${item.title}</strong><span>${item.a} ↔ ${item.b}</span></button>
        <button class="memory-state" type="button" data-state-id="${item.id}" title="Canvia l’estat">${stateLabels[item.state || 'emergent']}</button>
      </div>`).join('')}
    </div>`;

  memoryBox.querySelectorAll('.memory-open').forEach((button) => {
    button.addEventListener('click', () => {
      const item = readMemory().find((entry) => entry.id === button.dataset.memoryId);
      if (!item) return;
      const a = map?.querySelector(`[data-node="${item.aId}"]`);
      const b = map?.querySelector(`[data-node="${item.bId}"]`);
      if (a && b) {
        flashRelation(a, b);
        activateNode(b);
        showRelation(item);
      }
    });
  });

  memoryBox.querySelectorAll('.memory-state').forEach((button) => {
    button.addEventListener('click', () => {
      const item = readMemory().find((entry) => entry.id === button.dataset.stateId);
      if (item) changeRelationState(item.id, nextState(item.state || 'emergent'));
    });
  });
}

function activateNode(node) {
  if (!node) return;
  map?.querySelectorAll('[data-node].is-active').forEach((el) => el.classList.remove('is-active'));
  node.classList.add('is-active');
  activeNode = node;
  if (nodeTitle) nodeTitle.textContent = node.dataset.title || node.textContent.trim();
  if (nodeDesc) nodeDesc.textContent = node.dataset.desc || 'Aquest node encara està germinant.';

  if (relationStart && relationStart !== node) {
    const start = relationStart;
    relationStart = null;
    const result = getRelationResult(start, node);
    flashRelation(start, node);
    const entry = rememberRelation(start, node, result);
    showRelation(entry);
  }
}

if (map) {
  map.querySelectorAll('[data-node]').forEach((node) => {
    node.addEventListener('click', () => activateNode(node));
  });
}

if (revealAction) {
  revealAction.addEventListener('click', () => {
    if (!activeNode) return;
    const cluster = activeNode.closest('.constellation');
    const children = cluster?.querySelectorAll('.satellites button') || [];
    children.forEach((child, index) => {
      child.animate([
        { opacity: .45, transform: 'translateY(4px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 300, delay: index * 55, easing: 'ease-out' });
    });
    if (relationOutput) relationOutput.textContent = children.length ? 'Revelat: observa les branques i tria on entrar.' : 'Aquest node no té subbranques visibles encara.';
  });
}

if (relateAction) {
  relateAction.addEventListener('click', () => {
    if (!activeNode) return;
    relationStart = activeNode;
    activeNode.classList.add('is-related', 'is-pulsing');
    if (relationOutput) relationOutput.textContent = 'INTER NOS preparat. Ara toca un segon node.';
  });
}

if (seedAction) {
  seedAction.addEventListener('click', () => {
    const dialog = document.getElementById('sembra');
    if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
    if (seedOutput && activeNode) {
      const title = activeNode.dataset.title || activeNode.textContent.trim();
      seedOutput.textContent = `Llavor des de «${title}»: ${seeds[Math.floor(Math.random() * seeds.length)]}`;
    }
  });
}

window.addEventListener('resize', () => requestAnimationFrame(drawPersistentRelations));
window.addEventListener('orientationchange', () => setTimeout(drawPersistentRelations, 180));

renderMemory();
const core = map?.querySelector('[data-node="codex"]');
if (core) activateNode(core);
requestAnimationFrame(drawPersistentRelations);
