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

let activeNode = null;
let relationStart = null;

function activateNode(node) {
  if (!node) return;
  map?.querySelectorAll('[data-node].is-active').forEach((el) => el.classList.remove('is-active'));
  node.classList.add('is-active');
  activeNode = node;
  if (nodeTitle) nodeTitle.textContent = node.dataset.title || node.textContent.trim();
  if (nodeDesc) nodeDesc.textContent = node.dataset.desc || 'Aquest node encara està germinant.';

  if (relationStart && relationStart !== node) {
    relationStart.classList.remove('is-related');
    node.classList.add('is-related');
    const a = relationStart.dataset.title || relationStart.textContent.trim();
    const b = node.dataset.title || node.textContent.trim();
    if (relationOutput) relationOutput.textContent = `INTER NOS · ${a} ↔ ${b}: quina tercera forma pot néixer entre aquests dos nodes?`;
    relationStart = null;
    setTimeout(() => node.classList.remove('is-related'), 2200);
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
    activeNode.classList.add('is-related');
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

const core = map?.querySelector('[data-node="codex"]');
if (core) activateNode(core);
