import {createCodexMediaRecord,evolveRecord,validateRecord,isExternalSource} from '../portal-multimedia/model.js';

const STORE_KEY='animic.codex.kreator1/v1';
const now=()=>new Date().toISOString();
const load=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return{}}};
const save=data=>localStorage.setItem(STORE_KEY,JSON.stringify(data));
const clean=value=>String(value||'').trim();
const hasPerceptibleDifference=session=>Boolean(clean(session?.record?.fragment?.difference));
const hasTraceableProvenance=session=>Boolean(clean(session?.record?.provenance?.originId)&&clean(session?.record?.source?.id));
const assertDifferenceForMovement=(session,action)=>{
  if(hasPerceptibleDifference(session))return;
  throw new Error(`Sense diferència perceptible, el Còdex no pot ${action}. Només quiet o reobserve.`);
};
const assertReturnReady=session=>{
  assertDifferenceForMovement(session,'retornar');
  if(!hasTraceableProvenance(session))throw new Error('RETURN exigeix procedència traçable.');
};

export const KREATOR1_IMPULSES=Object.freeze(['quiet','relate','reobserve','transform','return']);

export function beginKreator1Session({creator='KREATOR 1',sourceName='Font 001',sourceKind='media',uri='',mime='',rights='participant-authorized',description='',external}={}){
  const sessionId=`kreator1-${Date.now().toString(36)}`;
  const explicitExternal=typeof external==='boolean'?external:undefined;
  let record=createCodexMediaRecord({
    source:{id:`src-${sessionId}`,kind:sourceKind,name:clean(sourceName)||'Font 001',uri:clean(uri),mime:clean(mime),external:explicitExternal,createdAt:now()},
    provenance:{originId:`src-${sessionId}`,createdBy:clean(creator)||'KREATOR 1',rights,reversible:true,history:[{at:now(),action:'kreator1.session.started',ref:sessionId}]}
  });
  // Si no s'ha declarat explícitament, el model conserva la seva semàntica i els kinds
  // research/external-data continuen sent reconeguts com a fonts externes.
  if(explicitExternal===undefined&&isExternalSource(record))record.source.external=true;
  record=evolveRecord(record,'fragment',{id:`fragment-${sessionId}`,kind:'kreator1-observation',description:clean(description),status:'unselected',perceptibleDifference:null});
  const registry=load();registry[sessionId]={sessionId,status:'source',record,decision:null,impulse:null,createdAt:now(),updatedAt:now()};save(registry);
  return registry[sessionId];
}

export function selectKreator1Fragment(sessionId,{description='',difference=''}={}){
  const registry=load(),session=registry[sessionId];if(!session)throw new Error('Sessió KREATOR 1 desconeguda');
  session.record=evolveRecord(session.record,'fragment',{id:`fragment-${sessionId}-a`,kind:'kreator1-selected-fragment',description:clean(description),difference:clean(difference),status:'selected',perceptibleDifference:Boolean(clean(difference))});
  session.status='fragment';session.updatedAt=now();save(registry);return session;
}

export function transformKreator1(sessionId,{operation='',description=''}={}){
  const registry=load(),session=registry[sessionId];if(!session)throw new Error('Sessió KREATOR 1 desconeguda');
  assertDifferenceForMovement(session,'transformar');
  if(!clean(operation))throw new Error('Cal una única operació de transformació');
  session.record=evolveRecord(session.record,'transformation',{kind:'kreator1-first-mutation',operation:clean(operation),description:clean(description),reversible:true,at:now()});
  session.status='transformation';session.updatedAt=now();save(registry);return session;
}

export function relateKreator1(sessionId,{target='',kind='kreator1-emergent-relation',label=''}={}){
  const registry=load(),session=registry[sessionId];if(!session)throw new Error('Sessió KREATOR 1 desconeguda');
  assertDifferenceForMovement(session,'relacionar');
  if(!clean(target))return session;
  session.record=evolveRecord(session.record,'relation',{kind,target:clean(target),label:clean(label),suggested:true,decisionRequired:true,canonical:false,reversible:true,traceRef:session.record.provenance?.originId});
  session.status='relation';session.updatedAt=now();save(registry);return session;
}

export function closeKreator1Session(sessionId,{impulse='quiet',decision='',unexpected='',nextWish=''}={}){
  if(!KREATOR1_IMPULSES.includes(impulse))throw new Error('Impuls KREATOR 1 invàlid');
  const registry=load(),session=registry[sessionId];if(!session)throw new Error('Sessió KREATOR 1 desconeguda');
  const humanDecision=clean(decision);
  if(!humanDecision)throw new Error('La decisió humana ha de quedar registrada.');
  if(impulse==='return')assertReturnReady(session);
  else if(!['quiet','reobserve'].includes(impulse))assertDifferenceForMovement(session,`tancar amb impuls ${impulse}`);
  const check=validateRecord(session.record);if(!check.valid)throw new Error('Registre KREATOR 1 invàlid: '+check.errors.join(', '));
  session.impulse=impulse;session.decision=humanDecision;session.unexpected=clean(unexpected);session.nextWish=clean(nextWish);session.status='closed';session.updatedAt=now();
  session.record.provenance.history=[...(session.record.provenance.history||[]),{at:now(),action:'kreator1.session.closed',ref:sessionId,impulse,decision:session.decision}];
  save(registry);window.dispatchEvent(new CustomEvent('codex:kreator1-session',{detail:session}));return session;
}

export function getKreator1Sessions(){return Object.values(load())}
