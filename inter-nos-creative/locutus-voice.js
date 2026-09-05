(() => {
  'use strict';

  const locutus = document.querySelector('#locutus');
  const conversation = document.querySelector('#conversation');
  const listenButton = document.querySelector('#listen');
  const input = document.querySelector('#input');
  if (!locutus || !conversation || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;

  const synth = window.speechSynthesis;
  const PREF_KEY = 'animic.locutus.voice.enabled/v1';
  const PROFILE = Object.freeze({ rate: 0.78, pitch: 0.54, volume: 0.94, pause: 240 });
  let enabled = localStorage.getItem(PREF_KEY) !== 'false';
  let armed = false;
  let lastSpoken = '';
  let speechToken = 0;

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

  function segments(text) {
    const clean = normalize(text);
    if (!clean) return [];
    return clean.match(/[^.!?;:]+[.!?;:]?/g)?.map(normalize).filter(Boolean) || [clean];
  }

  function speak(text) {
    const clean = normalize(text);
    if (!enabled || !armed || !clean || clean === lastSpoken) return false;
    const parts = segments(clean);
    if (!parts.length) return false;

    synth.cancel();
    const token = ++speechToken;
    const voice = chooseVoice();
    lastSpoken = clean;
    locutus.dataset.voiceState = 'speaking';

    const next = index => {
      if (token !== speechToken || !enabled) return;
      if (index >= parts.length) {
        locutus.dataset.voiceState = 'ready';
        return;
      }
      const utterance = new SpeechSynthesisUtterance(parts[index]);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = document.documentElement.lang || 'ca-ES';
      }
      utterance.rate = PROFILE.rate;
      utterance.pitch = PROFILE.pitch;
      utterance.volume = PROFILE.volume;
      utterance.onend = () => window.setTimeout(() => next(index + 1), PROFILE.pause);
      utterance.onerror = () => locutus.dataset.voiceState = 'unavailable';
      synth.speak(utterance);
    };

    next(0);
    return true;
  }

  function stop() {
    speechToken += 1;
    synth.cancel();
    locutus.dataset.voiceState = 'ready';
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
        ? 'LOCUTUS locuta amb una prosòdia pròpia, pausada i reversible.'
        : 'La veu de LOCUTUS està silenciada. El text continua intacte.';
    };
    toggle.addEventListener('click', () => {
      armed = true;
      enabled = !enabled;
      localStorage.setItem(PREF_KEY, String(enabled));
      if (!enabled) stop();
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
    stop,
    isEnabled: () => enabled,
    arm: () => { armed = true; },
    profile: PROFILE,
  });

  locutus.dataset.voice = 'intrinsic-reversible';
  locutus.dataset.voiceProfile = 'locutus-1';
  locutus.dataset.voiceState = 'ready';
})();
