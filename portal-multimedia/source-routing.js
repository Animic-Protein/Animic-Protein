// Routing de fonts del Còdex Viu.
// Proposa una porta d'entrada; no interpreta, no canonitza i no decideix per la persona.

export const CODEX_SOURCE_ROUTES = Object.freeze({
  research: Object.freeze({
    organ:'cambra-nua-del-temps',
    label:'Cambra Nua del Temps',
    href:'../cambra-nua-2/',
    purpose:'exposar una troballa al temps, contrastar-la i observar què resisteix',
    relationKind:'research-temporal-exposure'
  }),
  'external-data': Object.freeze({
    organ:'vigilia',
    label:'VIGILIA',
    href:null,
    purpose:'observar diferències externes sense convertir-les automàticament en significat',
    relationKind:'external-data-observation'
  }),
  generated: Object.freeze({
    organ:'compost',
    label:'Compost',
    href:'../#compost',
    purpose:'mantenir el material generat en estat provisional fins que superi els tests de MUTATIO',
    relationKind:'generated-provisional-material'
  }),
  media: Object.freeze({
    organ:'portal-multimedia',
    label:'Portal multimèdia',
    href:'./',
    purpose:'fragmentar, transformar, crear loops i conservar procedència abans de derivar',
    relationKind:'media-operational-entry'
  })
});

const normalizedKind=record=>String(record?.source?.kind||'unknown').trim().toLowerCase();

export function suggestSourceRoute(record,context={}){
  const kind=normalizedKind(record);
  const route=CODEX_SOURCE_ROUTES[kind]||null;
  if(!route)return null;
  return{
    ...route,
    sourceKind:kind,
    sourceId:record?.source?.id||null,
    reason:context.reason||route.purpose,
    suggested:true,
    decisionRequired:true,
    canonical:false,
    reversible:true
  };
}

export function createSourceRouteRelation(record,context={}){
  const route=suggestSourceRoute(record,context);
  if(!route)return null;
  return{
    kind:route.relationKind,
    target:route.organ,
    label:route.label,
    href:route.href,
    significant:Boolean(context.significant),
    strength:Number.isFinite(context.strength)?context.strength:0,
    traceRef:context.traceRef||record?.provenance?.originId||record?.source?.id||null,
    sourceKind:route.sourceKind,
    suggested:true,
    decisionRequired:true,
    canonical:false,
    reversible:true,
    note:context.note||null
  };
}

export function routeResearchToCambra(record,context={}){
  if(normalizedKind(record)!=='research')return null;
  return createSourceRouteRelation(record,context);
}
