(() => {
  const labels = {
    indici: "Indici fèrtil",
    cami: "Camí possible",
    pont: "Pont disponible",
  };
  let box,
    closed = false,
    last = "";
  function mount() {
    if (box) return;
    box = document.createElement("aside");
    box.className = "formiga-pont";
    box.setAttribute("aria-live", "polite");
    box.innerHTML =
      '<span class="formiga-pont__ant" aria-hidden="true"><i></i><i></i><i></i></span><small class="formiga-pont__kind"></small><p class="formiga-pont__text"></p><a class="formiga-pont__go" href="#">Fer una passa més →</a><button class="formiga-pont__close" aria-label="Deixar marxar la Formiga">×</button><span class="formiga-pont__trail" aria-hidden="true"></span>';
    box.querySelector("button").onclick = () => {
      closed = true;
      hide();
    };
    document.body.append(box);
  }
  function show(level, text, href, label) {
    mount();
    const key = level + text;
    if (closed && key === last) return;
    closed = false;
    last = key;
    box.dataset.level = level;
    box.querySelector(".formiga-pont__kind").textContent = labels[level];
    box.querySelector(".formiga-pont__text").textContent = text;
    const go = box.querySelector(".formiga-pont__go");
    go.href = href || "#";
    go.textContent = (label || "Fer una passa més") + " →";
    go.hidden = !href;
  }
  function hide() {
    if (box) box.removeAttribute("data-level");
  }
  window.FormigaPont = { show, hide };
  function sala() {
    const signal = document.querySelector("#signal"),
      retorn = "../inter-nos-creative/#interlocutor";
    if (!signal) return;
    new MutationObserver(() => {
      if (/RASTRE/.test(signal.textContent))
        show(
          "cami",
          "El rastre ha sobreviscut a l’absència.",
          "#view-time",
          "Escoltar abans de decidir",
        );
    }).observe(signal, { childList: true });
    document
      .querySelectorAll("[data-decision]")
      .forEach((b) =>
        b.addEventListener("click", () =>
          show(
            "pont",
            "Gest, absència i decisió ja poden retornar junts.",
            retorn,
            "Portar el rastre a INTER NOS",
          ),
        ),
      );
  }
  function internNos() {
    const derivation = document.querySelector("#derivation"),
      route = document.querySelector("#routeName");
    if (!derivation) return;
    new MutationObserver(() => {
      if (derivation.classList.contains("visible"))
        show(
          "pont",
          "Hi ha una sola derivació plausible: " +
            (route?.textContent || "Centre") +
            ".",
          "#acceptRoute",
          "Examinar aquest pont",
        );
      else hide();
    }).observe(derivation, { attributes: true, attributeFilter: ["class"] });
  }
  function portal() {
    const nodes = document.querySelectorAll("[data-node]");
    if (!nodes.length) {
      const enter = document.querySelector(".enter");
      if (enter) {
        const hint = () =>
          show(
            "indici",
            "T’has apropat a un llindar. Encara pots entrar o retirar-te.",
            null,
          );
        enter.addEventListener("pointerenter", hint);
        enter.addEventListener("focus", hint);
        setTimeout(hint, 1400);
      }
      return;
    }
    const seen = new Set();
    nodes.forEach((n) =>
      n.addEventListener("click", () => {
        seen.add(n.dataset.node);
        if (seen.size === 1)
          show(
            "indici",
            "Un node s’ha mogut. Encara no és una relació.",
            "#mapa-viu",
            "Continuar observant",
          );
        if (seen.size > 1)
          show(
            "pont",
            "Dos nodes ja poden escoltar-se sense fusionar-se.",
            "./inter-nos-creative/#interlocutor",
            "Travessar amb INTER NOS",
          );
      }),
    );
    document
      .querySelector("#relate-action")
      ?.addEventListener("click", () =>
        show(
          "pont",
          "La relació ha trobat una continuació reversible.",
          "./inter-nos-creative/#interlocutor",
          "Travessar amb INTER NOS",
        ),
      );
  }
  document.addEventListener("DOMContentLoaded", () => {
    const p = location.pathname;
    if (p.includes("cambra-nua-2")) sala();
    else if (p.includes("inter-nos-creative")) internNos();
    else portal();
  });
})();
