# Auditoria fundacional del Còdex Viu

Data: 2026-08-26
Repositori canònic: `Animic-Protein/Animic-Protein.github.io`
URL canònica: `https://animic-protein.github.io/`

## Principi de l’auditoria

L’objectiu no és congelar el Còdex, sinó garantir que pugui mutar sense perdre accés, memòria, traçabilitat ni capacitat de recuperació.

## Estat verificat

- Repositori canònic públic i branca principal `main`.
- GitHub Pages desplegat des de GitHub Actions.
- `index.html` present a l’arrel.
- Rutes internes, manifest i service worker basats en rutes relatives, compatibles amb l’URL arrel canònica.
- Manifest PWA amb `start_url` i `scope` a `./`.
- Service worker amb precàrrega dels actius essencials.
- Mapa Viu, INTER NOS i Germinació conserven memòria local limitada a 24 entrades.
- `LICENSE_STATUS: FINAL-RR-1.0`: drets reservats i explotació comercial només amb permís escrit previ.

## Correccions aplicades

### 1. Arrencada determinista

`app.js` carrega ara, en ordre explícit:

1. `foundation.js`
2. `core.js`
3. `germinacio.js`

Si un mòdul falla, queda un error visible al Còdex i un registre a consola.

### 2. Integritat de la memòria local

`foundation.js` valida i normalitza les dades persistides d’INTER NOS i Germinació abans d’activar el Còdex. Es descarten identificadors invàlids, estats desconeguts i contingut potencialment interpretable com HTML.

### 3. Accessibilitat fundacional

S’han afegit en temps d’arrencada:

- enllaç «Salta al contingut»;
- focus visible reforçat per teclat;
- etiquetatge dels diàlegs amb `aria-labelledby`;
- `aria-haspopup` i `aria-controls` als portals que obren diàlegs;
- anunci accessible de les respostes d’INTER NOS;
- respecte reforçat de `prefers-reduced-motion`.

### 4. Rosa de l’Escolta

Els enllaços interns d’un diàleg ara tanquen el diàleg abans de navegar a la secció de destí. Això evita que la navegació quedi oculta darrere d’un modal obert.

### 5. Robustesa offline

El cache del service worker passa a `codex-viu-canonical-v3`, inclou `foundation.js` i només conserva respostes HTTP correctes. Les caches antigues es retiren en activar-se la versió nova. La portada `index.html` només s’utilitza com a fallback offline per a navegacions, evitant retornar HTML quan falla la càrrega d’un recurs JavaScript, CSS o d’imatge.

## Criteris fundacionals de continuïtat

Qualsevol mutació futura hauria de preservar aquests mínims:

1. **Accés** — la portada canònica ha de continuar resolent a l’arrel.
2. **Traçabilitat** — cada canvi estructural ha de quedar en Git.
3. **Reversibilitat** — cap mutació crítica sense historial recuperable.
4. **Relació** — els nous nodes han de poder entrar a INTER NOS.
5. **Memòria** — les dades locals corruptes no han de poder bloquejar l’arrencada.
6. **Accessibilitat** — teclat, focus, reducció de moviment i semàntica no són decoració.
7. **Degradació digna** — un error de mòdul ha de ser visible i recuperable.

## Deute no bloquejant

- Afegir proves automatitzades de navegació i accessibilitat al workflow de Pages.
- Fer una prova visual periòdica en Safari/iPhone després de canvis importants de CSS o PWA.

---

**Estat:** base fundacional operativa. MUTATIO queda permesa, però no a costa de la memòria ni de l’accés.
