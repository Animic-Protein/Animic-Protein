# SOURCE ROUTING 1.0 · Fonts → òrgans

## Estat

Protocol operatiu reversible. No és una regla de canonització.

## Principi

Una font no entra directament al Còdex com a significat. Entra com a material traçable i rep, com a màxim, una proposta de porta d'entrada.

**La Formiga assenyala; la persona decideix; el Còdex conserva el rastre.**

## Routing inicial

| `source.kind` | Porta suggerida | Funció |
| --- | --- | --- |
| `research` | **Cambra Nua del Temps** | Exposar la troballa al temps, contrastar-la i observar què resisteix. |
| `external-data` | **VIGILIA** | Observar diferències sense interpretar-les automàticament. |
| `generated` | **Compost** | Mantenir material generat en estat provisional fins que superi MUTATIO. |
| `media` | **Portal multimèdia** | Fragmentar, transformar, crear loops i preservar procedència abans de derivar. |

## SciSpace → Cambra Nua del Temps

SciSpace es normalitza com a `research`. Una troballa de recerca pot generar una relació suggerida `research-temporal-exposure` amb `cambra-nua-del-temps`.

Aquesta relació no afirma que la troballa sigui certa, rellevant ni canònica. Només afirma que hi ha material de recerca traçable que pot ser sotmès a l'instrument temporal.

La Cambra ha de poder conservar, com a mínim:

1. identificador i procedència de la font;
2. fragment o afirmació concreta que s'exposa;
3. moment d'entrada;
4. rastre de contrast o relectura posterior;
5. decisió humana de conservar, transformar, retornar o compostar.

## Formiga

La Formiga només emergeix com a senyal fort quan una relació exterior és significativa i traçable. El routing per tipus de font, per si sol, és una **suggerència feble** i no ha d'activar una alerta significativa.

Quan hi ha evidència explícita (`significant: true`) o força suficient (`strength >= 0.66`), la relació pot activar `codex:ant-relation`.

## Límit constitucional

`source.kind` classifica la naturalesa operativa de la font; no determina el seu valor. `research`, `external-data`, `generated` i `media` poden acabar en altres òrgans si una relació posterior ho justifica.

El routing ha de continuar sent simple, directe i reversible (Occam), i ha de conservar incertesa quan la relació encara no està establerta.