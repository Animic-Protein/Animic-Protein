# Looperum β·05 — Instrument i memòria reactivable

Data: 2026-09-04
Estat: implementació experimental

## Decisió

Looperum deixa de considerar el reproductor natiu com a instrument. El reproductor és només el motor de reproducció; la interfície del Còdex governa el gest creatiu.

## Cadena mínima

`source → fragment → loop → transformation → relation → provenance`

La cadena és única per a Looparium, Looperum i Videodrome.

## Regla constitucional

**Cap transformació multimèdia sobreescriu l’origen.**

Tota derivació conserva:

- `originId`: font material original;
- `parentId`: estat immediat anterior;
- `rootRecordId`: primera traça del llinatge;
- `generation`: profunditat de derivació;
- `history`: successió d’accions;
- `reversible: true`;
- `destructive: false`.

## Looparium

Looparium no és un cementiri d’arxius. És memòria reactivable.

Un loop conservat pot tornar a entrar a Looperum com a font derivada. Aquesta reentrada crea un nou registre i una relació `reactivated-from-looparium`; mai converteix el loop en una font sense passat.

## Gest únic de conservació

L’acció **Conservar** ha de registrar conjuntament:

1. el fragment IN/OUT;
2. el loop;
3. el mode o transformació activa;
4. la relació amb la font;
5. la procedència completa.

## Modes

- `forward`: LOOP →
- `reverse`: MOVIOLA ↶
- `versarium`: VERSARIUM ↔

Els modes són transformacions o comportaments derivats, no substitucions de la font.

## Criteri d’èxit β·05

La prova mínima completa és:

`vídeo original → IN/OUT → loop → transformació → Looparium → reobertura a Looperum → nova transformació → genealogia visible`

Si la genealogia es perd, la prova falla encara que el loop sigui perceptivament correcte.
