export const CODEX_MEDIA_SCHEMA_VERSION = "0.1.0";

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

  return {
    schema: `animic.codex.media/${CODEX_MEDIA_SCHEMA_VERSION}`,
    id: input.id || makeId("trace"),
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

  if (stage === "relation") {
    next.relation.push({ id: makeId("rel"), at, ...payload });
  } else if (stage === "provenance") {
    next.provenance = { ...next.provenance, ...payload, destructive: false };
  } else {
    next[stage] = { id: payload.id || makeId(stage.slice(0, 3)), at, ...payload };
  }

  next.provenance.parentId = record.id;
  next.provenance.history.push({ at, action: `${stage}.evolved`, ref: next[stage]?.id || null });
  return next;
}

export function validateRecord(record) {
  const errors = [];
  if (!record?.schema?.startsWith("animic.codex.media/")) errors.push("schema");
  if (!record?.source?.id) errors.push("source.id");
  if (!record?.provenance?.originId) errors.push("provenance.originId");
  if (record?.provenance?.destructive !== false) errors.push("provenance.destructive");
  return { valid: errors.length === 0, errors };
}
