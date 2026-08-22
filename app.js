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
