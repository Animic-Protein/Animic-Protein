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
  function universe() {
    const organ = document.querySelector("#organ"),
      organName = document.querySelector("#organName"),
      ant = document.querySelector("#ant"),
      go = document.querySelector("#go");
    if (!organ) return;
    const revealHint = () =>
      setTimeout(
        () =>
          show(
            "indici",
            (organName?.textContent || "Un òrgan") +
              " s’ha fet pertinent, però encara no hi ha rastre.",
            "#organ",
            "Examinar l’òrgan",
          ),
        0,
      );
    document
      .querySelectorAll("[data-gesture],#errorBtn,#lostBtn")
      .forEach((b) => b.addEventListener("click", revealHint));
    document.querySelector("#trace")?.addEventListener("click", () =>
      setTimeout(() => {
        if (ant?.classList.contains("show"))
          show(
            "pont",
            "Dos rastres insinuen una relació. La Formiga assenyala un sol pas.",
            go?.getAttribute("href") || "#organ",
            "Entrar a l’òrgan pertinent",
          );
        else
          show(
            "cami",
            "Hi ha un primer rastre. Cal una altra diferència abans d’afirmar relació.",
            "#stage",
            "Continuar la travessa",
          );
      }, 0),
    );
    document.querySelector("#reset")?.addEventListener("click", hide);
  }
  function fusio() {
    const seed = document.querySelector("#seed"),
      score = document.querySelector("#score");
    if (!score) return;
    document.querySelector("#keep")?.addEventListener("click", () =>
      setTimeout(() => {
        if (!document.querySelector("#seed-result")?.hidden)
          show(
            "cami",
            "La llavor ha deixat de ser intuïció privada, però encara no és principi.",
            "#inter-nos",
            "Portar-la a la memòria viva",
          );
      }, 0),
    );
    document.querySelectorAll("#q,#qp").forEach((input) =>
      input.addEventListener("change", () => {
        const value = Number.parseInt(score.textContent, 10) || 0;
        show(
          value >= 55 ? "cami" : "indici",
          value >= 55
            ? "Instrument Z mostra una diferència prou visible per continuar."
            : "Les dues forces encara no produeixen una diferència clara.",
          "#z",
          "Revisar la tensió",
        );
      }),
    );
    document
      .querySelector("#turn")
      ?.addEventListener("click", () =>
        show(
          "indici",
          "La pregunta ha girat la percepció; encara no demana resposta.",
          "#rosa",
          "Sostenir la pregunta",
        ),
      );
    document
      .querySelectorAll("[data-memory]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          show(
            "pont",
            "La ressonància ja té una decisió humana i pot retornar sense legislar.",
            "../inter-nos-creative/#interlocutor",
            "Retornar amb INTER NOS",
          ),
        ),
      );
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
    if (p.includes("universe")) universe();
    else if (p.includes("fusio-total")) fusio();
    else if (p.includes("cambra-nua-2")) sala();
    else if (p.includes("inter-nos-creative")) internNos();
    else portal();
  });
})();
