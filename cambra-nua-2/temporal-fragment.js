import {createCodexMediaRecord,evolveRecord,validateRecord} from '../portal-multimedia/model.js';

const STORE_KEY='animic.codex.temporal-fragments/v1';
const now=()=>new Date().toISOString();
const load=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return{}}};
const save=registry=>localStorage.setItem(STORE_KEY,JSON.stringify(registry));

function fingerprint(detail={}){
  const session=String(detail.sessionId||'');
  return session||`temporal-${Math.round(Number(detail.chronological||0)*1000)}-${Math.round(Number(detail.perceived||0)*1000)}-${Date.now().toString(36)}`;
}

export function createTemporalFragment(detail={}){
  const key=fingerprint(detail),registry=load();
  if(registry[key])return registry[key];
  const chronological=Number(detail.chronological||0),perceived=Number(detail.perceived||0),difference=Number(detail.difference??(perceived-chronological));
  let record=createCodexMediaRecord({
    source:{
      id:`src-${key}`,
      kind:'research',
      name:'Cambra Nua · Espera sense rellotge',
      uri:'cambra-nua-2/espera.html',
      mime:'application/vnd.animic.temporal-fragment+json',
      external:false,
      createdAt:now()
    },
    provenance:{
      originId:`src-${key}`,
      createdBy:'cambra-nua.temporal-fragment',
      reversible:true,
      history:[{at:now(),action:'temporal-test.completed',ref:key}]
    }
  });
  record=evolveRecord(record,'fragment',{
    id:`temporal-fragment-${key}`,
    kind:'temporal-perception-difference',
    chronological,
    perceived,
    difference,
    absoluteDifference:Math.abs(difference),
    sourceKind:'research',
    test:'espera-sense-rellotge',
    perceptibleDifference:Math.abs(difference)>=1
  });
  record=evolveRecord(record,'relation',{
    kind:'born-in-organ',
    target:'cambra-nua-del-temps',
    suggested:false,
    canonical:false,
    reversible:true,
    traceRef:record.provenance.originId
  });
  const check=validateRecord(record);
  if(!check.valid)throw new Error('Fragment temporal invàlid: '+check.errors.join(', '));
  registry[key]=record;save(registry);return record;
}

export const TEMPORAL_DESTINATIONS=Object.freeze({
  cambra:{target:'cambra-nua-del-temps',kind:'return-to-cambra',label:'Cambra Nua del Temps',href:'./'},
  resonance:{target:'biblioteca-de-ressonancies',kind:'return-to-resonance-library',label:'Biblioteca de Ressonàncies',href:'../#ressonancia'},
  compost:{target:'compost',kind:'return-to-compost',label:'Compost',href:'../#compost'},
  interNos:{target:'inter-nos',kind:'return-to-inter-nos',label:'INTER NOS',href:'../inter-nos-creative/#interlocutor'}
});

export function relateTemporalFragment(record,destinationKey){
  const dest=TEMPORAL_DESTINATIONS[destinationKey];
  if(!dest)throw new Error('Destí temporal desconegut');
  const existing=(record.relation||[]).find(rel=>rel.kind===dest.kind&&rel.target===dest.target);
  if(existing)return{record,relation:existing,deduplicated:true,destination:dest};
  const next=evolveRecord(record,'relation',{
    kind:dest.kind,
    target:dest.target,
    label:dest.label,
    href:dest.href,
    traceRef:record.provenance?.originId||record.source?.id,
    suggested:false,
    decisionRequired:true,
    canonical:false,
    reversible:true
  });
  const registry=load();
  const key=Object.keys(registry).find(k=>registry[k]?.provenance?.rootRecordId===record.provenance?.rootRecordId||registry[k]?.source?.id===record.source?.id);
  if(key){registry[key]=next;save(registry)}
  return{record:next,relation:next.relation.at(-1),deduplicated:false,destination:dest};
}

export function getTemporalFragments(){return Object.values(load())}
