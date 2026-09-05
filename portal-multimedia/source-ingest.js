import {createCodexMediaRecord,evolveRecord} from './model.js';
import {createSourceRouteRelation,suggestSourceRoute} from './source-routing.js';

// Porta única per registrar fonts externes sense saltar-se la traçabilitat.
// source.kind diu què és la font; source.agent diu qui o què l'ha aportada.
// L'agent no adquireix autoria canònica ni capacitat de decisió.
// El routing crea una relació suggerida; només una relació declarada significativa
// pot despertar la Formiga mitjançant evolveRecord().
export function ingestSource(input={},context={}){
  const record=createCodexMediaRecord(input);
  const route=suggestSourceRoute(record,context);
  if(!route)return{record,route:null,routed:false};
  const relation=createSourceRouteRelation(record,context);
  const routed=evolveRecord(record,'relation',relation);
  return{record:routed,route,routed:true};
}

export function ingestResearch(input={},context={}){
  return ingestSource({
    ...input,
    source:{...(input.source||{}),kind:'research',external:true}
  },context);
}

export function ingestSciSpace(input={},context={}){
  return ingestResearch({
    ...input,
    source:{
      ...(input.source||{}),
      kind:'scispace',
      external:true,
      agent:input.source?.agent||{id:'scispace',name:'SciSpace',kind:'research-service',external:true}
    }
  },{
    ...context,
    note:context.note||'Font de recerca aportada per SciSpace; exposició temporal suggerida.'
  });
}
