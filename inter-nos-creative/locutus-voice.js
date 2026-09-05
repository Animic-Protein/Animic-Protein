(() => {
  'use strict';

  const locutus = document.querySelector('#locutus');
  const conversation = document.querySelector('#conversation');
  const listenButton = document.querySelector('#listen');
  const input = document.querySelector('#input');
  if (!locutus || !conversation || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;

  const synth = window.speechSynthesis;
  const PREF_KEY = 'animic.locutus.voice.enabled/v1';
  let enabled = localStorage.getItem(PREF_KEY) !== 'false';
  let armed = false;
  let lastSpoken = '';

  const normalize = value => String(value || '').replace(/\s+/g, ' ').trim();

  function candidateScore(voice) {
    const lang = String(voice.lang || '').toLowerCase();
    const name = String(voice.name || '').toLowerCase();
    let score = 0;
    if (lang.startsWith('ca')) score += 100;
    else if (lang.startsWith('es')) score += 80;
    else if (lang.startsWith('en')) score += 20;
    if (/male|mascul|jorge|diego|pablo|xavier|joan|pau|compact|premium|enhanced/.test(name)) score += 15;
    if (/female|femal|mujer|dona/.test(name)) score -= 4;
    if (voice.localService) score += 3;
    return score;
  }

  function chooseVoice() {
    return [...synth.getVoices()].sort((a, b) => candidateScore(b) - candidateScore(a))[0] || null;
  }

  function speak(text) {
    const clean = normalize(text);
    if (!enabled || !armed || !clean || clean === lastSpoken) return false;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    const voice = chooseVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = document.documentElement.lang || 'ca-ES';
    }
    utterance.rate = 0.82;
    utterance.pitch = 0.58;
    utterance.volume = 0.96;
    utterance.onstart = () => locutus.dataset.voiceState = 'speaking';
    utterance.onend = () => locutus.dataset.voiceState = 'ready';
    utterance.onerror = () => locutus.dataset.voiceState = 'unavailable';
    lastSpoken = clean;
    synth.speak(utterance);
    return true;
  }

  function messageText(node) {
    if (!(node instanceof HTMLElement) || !node.classList.contains('msg') || node.classList.contains('you')) return '';
    const clone = node.cloneNode(true);
    clone.querySelector('small')?.remove();
    return normalize(clone.textContent);
  }

  const head = locutus.querySelector('.loc-head');
  if (head && !head.querySelector('#locutusVoiceToggle')) {
    const toggle = document.createElement('button');
    toggle.id = 'locutusVoiceToggle';
    toggle.type = 'button';
    toggle.style.cssText = 'border:1px solid #316899;background:transparent;color:inherit;padding:7px 10px;border-radius:999px;cursor:pointer;margin-left:10px';
    const refresh = () => {
      toggle.textContent = enabled ? 'VEU · ACTIVA' : 'VEU · SILENCI';
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.title = enabled
        ? 'LOCUTUS locuta les seves devolucions quan una interacció de veu és possible.'
        : 'La veu de LOCUTUS està silenciada. El text continua intacte.';
    };
    toggle.addEventListener('click', () => {
      armed = true;
      enabled = !enabled;
      localStorage.setItem(PREF_KEY, String(enabled));
      if (!enabled) synth.cancel();
      refresh();
    });
    head.append(toggle);
    refresh();
  }

  listenButton?.addEventListener('click', () => { armed = true; }, { capture: true });
  input?.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') armed = true;
  }, { capture: true });
  locutus.addEventListener('pointerdown', () => { armed = true; }, { once: true, capture: true });
  synth.addEventListener?.('voiceschanged', chooseVoice);

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        const text = messageText(node);
        if (text) speak(text);
      }
    }
  });
  observer.observe(conversation, { childList: true });

  window.LocutusVoice = Object.freeze({
    speak,
    stop: () => synth.cancel(),
    isEnabled: () => enabled,
    arm: () => { armed = true; },
  });

  locutus.dataset.voice = 'intrinsic-reversible';
  locutus.dataset.voiceState = 'ready';
})();
