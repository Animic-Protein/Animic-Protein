# Looparium β·07 · Memòria persistent

## Estat
Implementació experimental sobre `portal-multimedia/`.

## Principi
Looparium deixa de ser només memòria de sessió. Un loop conservat ha de poder sobreviure al tancament o recàrrega de la pàgina i tornar al Looperum amb la seva font, IN/OUT, mode, velocitat, registre i genealogia.

## Persistència
- IndexedDB és el magatzem local principal.
- Cada entrada conserva `record`, metadades del loop i un `Blob` de la font original.
- Els `blob:` object URLs són efímers i mai es consideren identitat persistent; es regeneren en reactivar una entrada.
- Es demana `navigator.storage.persist()` quan el navegador ho permet, sense assumir que serà concedit.
- Cap dada multimèdia s’envia al repositori ni a un servidor en β·07.

## Regla constitucional
Persistir no significa immobilitzar. L’origen es preserva, la reactivació crea una nova generació i la genealogia continua sent reversible i traçable.

## Degradació
Si IndexedDB o l’emmagatzematge persistent no estan disponibles, Looperum ha de continuar funcionant en memòria de sessió i informar-ho sense perdre l’acció creativa.

## Criteri de prova
1. Carregar àudio o vídeo.
2. Definir IN/OUT i una transformació.
3. Conservar al Looparium.
4. Recarregar Safari.
5. Obrir Looparium.
6. Reobrir el loop al Looperum.
7. Verificar font, IN/OUT, mode, velocitat i genealogia.
