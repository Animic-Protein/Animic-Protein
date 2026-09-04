export const CODEX_MEDIA_SCHEMA_VERSION = "0.2.0";

export const CODEX_MEDIA_STAGES = Object.freeze([
  "source",
  "fragment",
  "loop",
  "transformation",
  "relation",
  "provenance",
]);

const makeId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const now = () => new Date().toISOString();

export function createCodexMediaRecord(input = {}) {
  const createdAt = now();
  const sourceId = input.source?.id || makeId("src");
  const id = input.id || makeId("trace");

  return {
    schema: `animic.codex.media/${CODEX_MEDIA_SCHEMA_VERSION}`,
    id,
    source: {
      id: sourceId,
      kind: input.source?.kind || "unknown",
      uri: input.source?.uri || null,
      name: input.source?.name || "Font sense nom",
      mime: input.source?.mime || null,
      createdAt: input.source?.createdAt || createdAt,
      external: input.source?.external ?? true,
    },
    fragment: input.fragment || null,
    loop: input.loop || null,
    transformation: input.transformation || null,
    relation: Array.isArray(input.relation) ? input.relation : [],
    provenance: {
      originId: input.provenance?.originId || sourceId,
      parentId: input.provenance?.parentId || null,
      rootRecordId: input.provenance?.rootRecordId || id,
      generation: Number.isFinite(input.provenance?.generation)
        ? input.provenance.generation
        : 0,
      createdAt,
      createdBy: input.provenance?.createdBy || "portal-multimedia",
      reversible: input.provenance?.reversible ?? true,
      destructive: false,
      history: Array.isArray(input.provenance?.history)
        ? input.provenance.history
        : [{ at: createdAt, action: "source.registered", ref: sourceId }],
    },
  };
}

export function evolveRecord(record, stage, payload = {}) {
  if (!CODEX_MEDIA_STAGES.includes(stage)) {
    throw new Error(`Etapa desconeguda: ${stage}`);
  }

  const next = structuredClone(record);
  const at = now();
  next.id = makeId("trace");

  if (stage === "relation") {
    next.relation.push({ id: makeId("rel"), at, ...payload });
  } else if (stage === "provenance") {
    next.provenance = { ...next.provenance, ...payload, destructive: false };
  } else {
    next[stage] = { id: payload.id || makeId(stage.slice(0, 3)), at, ...payload };
  }

  next.provenance.parentId = record.id;
  next.provenance.rootRecordId = record.provenance?.rootRecordId || record.id;
  next.provenance.generation = (record.provenance?.generation || 0) + 1;
  next.provenance.history.push({
    at,
    action: `${stage}.evolved`,
    ref: stage === "relation" ? next.relation.at(-1)?.id || null : next[stage]?.id || null,
  });
  return next;
}

export function deriveLoopRecord(record, payload = {}) {
  const at = now();
  const fragment = {
    id: payload.fragmentId || makeId("fra"),
    at,
    start: Number(payload.start || 0),
    end: Number(payload.end || 0),
    duration: Math.max(0, Number(payload.end || 0) - Number(payload.start || 0)),
  };
  let next = evolveRecord(record, "fragment", fragment);
  next = evolveRecord(next, "loop", {
    id: payload.loopId || makeId("loo"),
    start: fragment.start,
    end: fragment.end,
    duration: fragment.duration,
    mode: payload.mode || "forward",
    rate: Number(payload.rate || 1),
  });
  if (payload.transformation) {
    next = evolveRecord(next, "transformation", payload.transformation);
  }
  return next;
}

export function reactivateLoopRecord(loopRecord, source = {}) {
  const at = now();
  const sourceId = source.id || makeId("src");
  const next = createCodexMediaRecord({
    source: {
      id: sourceId,
      kind: source.kind || loopRecord.source?.kind || "unknown",
      uri: source.uri ?? loopRecord.source?.uri ?? null,
      name: source.name || `${loopRecord.source?.name || "Loop"} · reactivat`,
      mime: source.mime || loopRecord.source?.mime || null,
      external: false,
      createdAt: at,
    },
    provenance: {
      originId: loopRecord.provenance?.originId || loopRecord.source?.id || sourceId,
      parentId: loopRecord.id,
      rootRecordId: loopRecord.provenance?.rootRecordId || loopRecord.id,
      generation: (loopRecord.provenance?.generation || 0) + 1,
      createdBy: "looparium.reactivate",
      reversible: true,
      history: [
        ...(loopRecord.provenance?.history || []),
        { at, action: "loop.reactivated", ref: loopRecord.loop?.id || loopRecord.id },
      ],
    },
  });
  next.relation.push({
    id: makeId("rel"),
    at,
    kind: "reactivated-from-looparium",
    target: loopRecord.id,
  });
  return next;
}

export function validateRecord(record) {
  const errors = [];
  if (!record?.schema?.startsWith("animic.codex.media/")) errors.push("schema");
  if (!record?.id) errors.push("id");
  if (!record?.source?.id) errors.push("source.id");
  if (!record?.provenance?.originId) errors.push("provenance.originId");
  if (!record?.provenance?.rootRecordId) errors.push("provenance.rootRecordId");
  if (record?.provenance?.destructive !== false) errors.push("provenance.destructive");
  return { valid: errors.length === 0, errors };
}
