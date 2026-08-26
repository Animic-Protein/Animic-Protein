# Auditoria funcional · Fase II

Data: 2026-08-26
Repositori: `Animic-Protein/Animic-Protein.github.io`

## Àmbit revisat

- Mapa Viu i selecció de nodes.
- INTER NOS i memòria de relacions.
- Germinació i cicle vital.
- Portal permanent `Z`.
- Rosa de l’Escolta `?`.
- Navegació amb teclat i retorn de focus.
- Comportament PWA/offline després de canvis funcionals.

## Troballes

### 1. Z existia com a portal, però no actuava

El diàleg descrivia Z com un portal d’acció immediata, però només mostrava text. Això contradeia la taxonomia del Còdex: un portal permanent ha de permetre actuar.

**Correcció:** Z incorpora ara quatre accions reals:

- `Pregunta`: genera una pregunta viva contextual sobre el node actiu.
- `MUTATIO`: deriva directament a la sembra des del node actiu.
- `Silenci`: porta al node Silenci del Mapa Viu.
- `Retorn al Còdex`: torna al node central.

### 2. La Rosa de l’Escolta navegava a seccions massa genèriques

Harmonia, Retrodansa i Univers visual acabaven tots a la mateixa secció de cambres, i Silenci a principis. La Rosa funcionava com a índex aproximat, no com a brúixola precisa.

**Correcció:** cada opció activa ara el node concret del Mapa Viu:

- Harmonia → `harmonia-viva`
- Retrodansa → `retrodansa`
- Silenci → `silenci`
- Univers visual → `univers-visual`

El diàleg es tanca, el mapa entra en vista i el node queda actiu i enfocat.

### 3. Retorn de focus dels diàlegs

Després de tancar un portal, el focus podia quedar desplaçat, especialment en navegació amb teclat o lector de pantalla.

**Correcció:** el Còdex recorda quin control ha obert cada diàleg i hi retorna el focus en tancar-lo.

### 4. Cache PWA

La nova capa funcional modifica `foundation.js`; una cache antiga podia retardar-ne la visibilitat en instal·lacions PWA.

**Correcció:** cache canònica incrementada a `codex-viu-canonical-v4`.

## Elements que han superat aquesta fase

- Els nodes del mapa són controls `button`, per tant mantenen activació nativa amb teclat i tacte.
- INTER NOS conserva un màxim controlat de 24 relacions locals.
- Les relacions canòniques i emergents mantenen traça d’estat.
- Germinació deriva de relacions sembrades i conserva el seu origen.
- En mòbil, el mapa abandona el posicionament absolut i passa a una graella linealitzada.
- El mode de moviment reduït continua anul·lant animacions no essencials.

## Principi resultant

**Portal permanent = acció immediata. Portal secundari = orientació precisa.**

Aquesta distinció queda ara implementada, no només descrita.

---

**Estat Fase II:** reparacions funcionals aplicades. Preparat per auditoria visual i d’interacció real en Safari/iPhone.
