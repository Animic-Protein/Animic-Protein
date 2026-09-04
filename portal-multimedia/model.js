import './media-runtime-hotfix.js';
import './beta12-ui.js';

export const CODEX_MEDIA_SCHEMA_VERSION = "0.5.0";
export const CODEX_MEDIA_STAGES = Object.freeze(["source","fragment","loop","transformation","relation","provenance"]);

export const CODEX_SOURCE_KINDS = Object.freeze(["media","research","external-data","generated","unknown"]);
const SOURCE_KIND_ALIASES = Object.freeze({
  audio:"media", video:"media", image:"media", file:"media", multimedia:"media",
  paper:"research", article:"research", scispace:"research", bibliography:"research",
  market:"external-data", sensor:"external-data", api:"external-data", data:"external-data", "market-data":"external-data",
  ai:"generated", synthetic:"generated", render:"generated"
});
export function normalizeSourceKind(kind){
  const raw=String(kind||'unknown').trim().toLowerCase();
  if(CODEX_SOURCE_KINDS.includes(raw))return raw;
  return SOURCE_KIND_ALIASES[raw]||raw||'unknown';
}
export function isExternalSource(record){
  const kind=normalizeSourceKind(record?.source?.kind);
  return record?.source?.external===true||kind==='research'||kind==='external-data';
}

// Gramàtica operativa metabolitzada al Còdex Viu.
// L'origen conceptual és un patró de lectura de sistemes vius; no importa dades financeres
// ni crea una dependència externa. Només tradueix tipus d'esdeveniment a funcions del Còdex.
export const CODEX_OPERATIONAL_GRAMMAR = Object.freeze({
  "market-data": Object.freeze({codex:"source",label:"Font"}),
  "security-fact": Object.freeze({codex:"fragment",label:"Fragment"}),
  signal: Object.freeze({codex:"relation",label:"Relació activa"}),
  catalyst: Object.freeze({codex:"transformation",label:"Transformació"}),
  "history-kline": Object.freeze({codex:"temporal-memory",label:"Memòria temporal"}),
  anomaly: Object.freeze({codex:"fertile-error",label:"Error fèrtil"}),
  watchlist: Object.freeze({codex:"looparium-observation",label:"Looparium d’observació"}),
  strategy: Object.freeze({codex:"instrument",label:"Instrument"}),
  provenance: Object.freeze({codex:"trace",label:"Rastre verificable"})
});

export const MUTATIO_TESTS = Object.freeze([
  "perceptible-difference",
  "traceability",
  "relation",
  "reversibility"
]);

export const CONFLUENTIA_DEFAULT_THRESHOLD = 3;

const makeId=prefix=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const now=()=>new Date().toISOString();

export function translateOperationalPattern(pattern){
  return CODEX_OPERATIONAL_GRAMMAR[String(pattern||'').toLowerCase()]||null;
}

export function createCodexMediaRecord(input={}){const createdAt=now(),sourceId=input.source?.id||makeId('src'),id=input.id||makeId('trace'),kind=normalizeSourceKind(input.source?.kind||'unknown');return{schema:`animic.codex.media/${CODEX_MEDIA_SCHEMA_VERSION}`,id,source:{id:sourceId,kind,legacyKind:kind!==String(input.source?.kind||'unknown').trim().toLowerCase()?(input.source?.kind||null):null,uri:input.source?.uri||null,name:input.source?.name||'Font sense nom',mime:input.source?.mime||null,createdAt:input.source?.createdAt||createdAt,external:input.source?.external??true},fragment:input.fragment||null,loop:input.loop||null,transformation:input.transformation||null,relation:Array.isArray(input.relation)?input.relation:[],provenance:{originId:input.provenance?.originId||sourceId,parentId:input.provenance?.parentId||null,rootRecordId:input.provenance?.rootRecordId||id,generation:Number.isFinite(input.provenance?.generation)?input.provenance.generation:0,createdAt,createdBy:input.provenance?.createdBy||'portal-multimedia',reversible:input.provenance?.reversible??true,destructive:false,history:Array.isArray(input.provenance?.history)?input.provenance.history:[{at:createdAt,action:'source.registered',ref:sourceId}]}}}

export function relationIsSignificant(record,relation={}){
  const target=relation.target||relation.organ||relation.instrument||null;
  const strength=Number(relation.strength??relation.score??0);
  const explicit=relation.significant===true||relation.meaningful===true;
  const traced=Boolean(relation.traceRef||record?.provenance?.originId);
  return Boolean(isExternalSource(record)&&target&&traced&&(explicit||strength>=0.66));
}

export function publishMeaningfulExternalRelation(record,relation){
  if(typeof window==='undefined'||!relationIsSignificant(record,relation))return false;
  window.dispatchEvent(new CustomEvent('codex:ant-relation',{detail:{recordId:record.id,source:record.source,relation}}));
  const ant=document?.querySelector?.('#antSuggest');
  if(ant){
    const target=relation.target||relation.organ||relation.instrument||'un òrgan del Còdex';
    ant.textContent=`🐜 Relació exterior significativa detectada → ${target}. La formiga insinua; no decideix.`;
    ant.dataset.active='true';
  }
  return true;
}

export function evolveRecord(record,stage,payload={}){if(!CODEX_MEDIA_STAGES.includes(stage))throw new Error(`Etapa desconeguda: ${stage}`);const next=structuredClone(record),at=now();next.id=makeId('trace');if(stage==='relation')next.relation.push({id:makeId('rel'),at,...payload});else if(stage==='provenance')next.provenance={...next.provenance,...payload,destructive:false};else next[stage]={id:payload.id||makeId(stage.slice(0,3)),at,...payload};next.provenance.parentId=record.id;next.provenance.rootRecordId=record.provenance?.rootRecordId||record.id;next.provenance.generation=(record.provenance?.generation||0)+1;next.provenance.history.push({at,action:`${stage}.evolved`,ref:stage==='relation'?next.relation.at(-1)?.id||null:next[stage]?.id||null});if(stage==='relation')publishMeaningfulExternalRelation(next,next.relation.at(-1));return next}
export function deriveLoopRecord(record,payload={}){const at=now(),fragment={id:payload.fragmentId||makeId('fra'),at,start:Number(payload.start||0),end:Number(payload.end||0),duration:Math.max(0,Number(payload.end||0)-Number(payload.start||0))};let next=evolveRecord(record,'fragment',fragment);next=evolveRecord(next,'loop',{id:payload.loopId||makeId('loo'),start:fragment.start,end:fragment.end,duration:fragment.duration,mode:payload.mode||'forward',rate:Number(payload.rate||1)});if(payload.transformation)next=evolveRecord(next,'transformation',payload.transformation);return next}
export function reactivateLoopRecord(loopRecord,source={}){const at=now(),sourceId=source.id||makeId('src'),next=createCodexMediaRecord({source:{id:sourceId,kind:source.kind||loopRecord.source?.kind||'unknown',uri:source.uri??loopRecord.source?.uri??null,name:source.name||`${loopRecord.source?.name||'Loop'} · reactivat`,mime:source.mime||loopRecord.source?.mime||null,external:false,createdAt:at},provenance:{originId:loopRecord.provenance?.originId||loopRecord.source?.id||sourceId,parentId:loopRecord.id,rootRecordId:loopRecord.provenance?.rootRecordId||loopRecord.id,generation:(loopRecord.provenance?.generation||0)+1,createdBy:'archivum.loop-chamber.reactivate',reversible:true,history:[...(loopRecord.provenance?.history||[]),{at,action:'loop.reactivated',ref:loopRecord.loop?.id||loopRecord.id}]}});next.relation.push({id:makeId('rel'),at,kind:'reactivated-from-archivum-loop',target:loopRecord.id});return next}
export function validateRecord(record){const errors=[];if(!record?.schema?.startsWith('animic.codex.media/'))errors.push('schema');if(!record?.id)errors.push('id');if(!record?.source?.id)errors.push('source.id');if(!record?.provenance?.originId)errors.push('provenance.originId');if(!record?.provenance?.rootRecordId)errors.push('provenance.rootRecordId');if(record?.provenance?.destructive!==false)errors.push('provenance.destructive');return{valid:errors.length===0,errors}}

// VIGILIA observa; no interpreta. Una observació només pot despertar la vigilància
// si declara una diferència. El significat queda fora d'aquesta facultat.
export function createVigilia(input={}){
  const at=now();
  return{
    id:input.id||makeId('vig'),
    subjectId:input.subjectId||null,
    createdAt:at,
    status:'watching',
    baseline:input.baseline??null,
    observations:[],
    awakenedAt:null,
    interpretation:null,
    decisionRequired:true
  };
}

export function observeVigilia(vigilia,observation={}){
  const next=structuredClone(vigilia),at=now();
  const item={
    id:observation.id||makeId('obs'),
    at,
    source:observation.source||'unknown',
    kind:observation.kind||'observation',
    difference:Boolean(observation.difference),
    traceRef:observation.traceRef||null,
    note:observation.note||null
  };
  next.observations.push(item);
  if(item.difference){next.status='awakened';next.awakenedAt=at;}
  return next;
}

// CONFLUENTIA no suma opinions repetides. Només compta fonts independents afirmatives.
export function assessConfluentia(evidence=[],options={}){
  const threshold=Math.max(2,Number(options.threshold||CONFLUENTIA_DEFAULT_THRESHOLD));
  const affirmative=(Array.isArray(evidence)?evidence:[]).filter(item=>item&&item.affirmative!==false&&item.source);
  const bySource=new Map();
  for(const item of affirmative)if(!bySource.has(item.source))bySource.set(item.source,item);
  const independent=[...bySource.values()];
  const count=independent.length;
  const status=count>=threshold?'confluent':count>=2?'converging':count===1?'isolated':'silent';
  return{
    status,
    count,
    threshold,
    independentSources:independent.map(item=>item.source),
    evidence:independent,
    decisionRequired:true,
    canonical:false,
    interpretation:null
  };
}

export function publishConfluentia(assessment,detail={}){
  if(typeof window==='undefined'||!assessment)return assessment;
  window.dispatchEvent(new CustomEvent('codex:confluentia',{detail:{...detail,assessment}}));
  return assessment;
}

export function assessMutatio(record,evidence={}){
  const trace=validateRecord(record).valid;
  const tests={
    "perceptible-difference":Boolean(evidence.perceptibleDifference??record?.transformation),
    traceability:Boolean(evidence.traceability??trace),
    relation:Boolean(evidence.relation??(Array.isArray(record?.relation)&&record.relation.length)),
    reversibility:Boolean(evidence.reversibility??(record?.provenance?.reversible===true&&record?.provenance?.destructive===false))
  };
  const passed=MUTATIO_TESTS.filter(test=>tests[test]);
  const score=passed.length;
  const status=score===4?'metabolizable':score>=2?'latent':'insufficient';
  return{status,score,total:MUTATIO_TESTS.length,tests,passed,decisionRequired:true,canonical:false};
}

export function suggestMutatioDestination(record,evidence={}){
  const assessment=assessMutatio(record,evidence);
  if(assessment.status!=='metabolizable')return evidence.anomaly?'compost':'return';
  if(evidence.canonicalCandidate)return'canon';
  if(evidence.repeatableStrategy)return'instrument';
  if(evidence.resonance)return'resonance-library';
  if(evidence.reusableLoop||record?.loop)return'looparium';
  if(evidence.anomaly)return'compost';
  return'return';
}
