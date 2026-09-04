# MEMÒRIA DE REGRESSIONS · CÒDEX VIU

Aquest document no és un backlog. És memòria immunitària: errors ja metabolitzats que el Còdex no ha de tornar a aprendre des de zero.

## R-001 · Doble pont Fototeca → Videodrum

**Símptoma:** un vídeo seleccionat podia obrir Videodrum abans que `ingest()` hagués creat la font activa i després tornar-lo a obrir.

**Causa:** dos listeners amb responsabilitat solapada.

**Regla adquirida:** una sola ruta d’entrada: `FONT → ingest → identitat activa → instrument`.

**Test permanent:** `storage.js` no pot reintroduir `installPhotoVideoBridge`.

## R-002 · Archivum construït durant l’arrencada

**Símptoma:** Portal, instruments i Fototeca trigaven a desplegar-se.

**Causa:** càrrega d’IndexedDB i construcció de fitxes tècniques abans que l’usuari obrís Archivum.

**Regla adquirida:** Archivum i Cambra de loops són lazy. La memòria no competeix amb el primer gest.

## R-003 · MutationObserver autoreferencial

**Símptoma:** Safari podia quedar bloquejat o el Portal aparentar una càrrega infinita.

**Causa:** un observer modificava el mateix subarbre que observava i es reactivava.

**Regla adquirida:** cap observer de normalització pot escriure indefinidament sobre el seu propi domini observat. Preferir normalització idempotent i acotada.

## R-004 · Cache antiga després d’un canvi crític

**Símptoma:** Pages estava desplegat però Safari podia continuar executant una combinació anterior de mòduls.

**Causa:** Service Worker sense revisió/versionat coordinat amb canvis del Portal.

**Regla adquirida:** qualsevol canvi funcional a `portal-multimedia/*.js` o `index.html` obliga a revisar `sw.js`, els assets crítics i la versió de cache.

## R-005 · Decodificació prematura de vídeo

**Símptoma:** una font de vídeo podia provocar feina de memòria/àudio abans que fos necessària per al gest visual.

**Causa:** barrejar visualització immediata amb processament complet de la font.

**Regla adquirida:** primer Object URL / element multimèdia; decodificació o persistència pesada només quan una operació ho exigeix.

## R-006 · Validació només a l’arrel

**Símptoma:** els workflows podien passar encara que un mòdul JavaScript intern del Portal tingués un problema sintàctic.

**Causa:** `find . -maxdepth 1`.

**Regla adquirida:** sintaxi JavaScript recursiva, excloent només dependències i directoris de control.

---

## Principi d’homeòstasi tècnica

Una regressió resolta es converteix en **regla verificable**, no només en record narratiu.

La memòria del Còdex ha de conservar tres coses:

`SÍMPTOMA → CAUSA → TEST PERMANENT`

Quan una incidència nova no encaixa en cap cas anterior, s’hi afegeix només després d’haver estat reproduïda i corregida.
