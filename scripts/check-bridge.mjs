import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const expectedSite = "https://animic-protein.animic-protein.chatgpt.site";
const expectedRepository = "https://github.com/Animic-Protein/Animic-Protein.github.io";
const expectedFallback = "https://animic-protein.github.io/fusio-total/";
const expectedInterNos = "https://animic-protein.github.io/inter-nos-creative/";
const local = JSON.parse(await readFile(new URL("../pont-site.json", import.meta.url), "utf8"));

assert.equal(local.protocol, "PONS-AP-1.0");
assert.equal(local.site.url, expectedSite);
assert.equal(local.site.fallback_url, expectedFallback);
assert.equal(local.laboratories.fusion_total_2_4.url, expectedFallback);
assert.equal(local.organs.inter_nos.url, expectedInterNos);
assert.equal(local.organs.inter_nos.status, "stable_v1_reopen_by_evidence");
assert.equal(local.organs.cambra_nua_2.url, "https://animic-protein.github.io/cambra-nua-2/");
assert.equal(local.governance.current_construction, "cambra_nua_del_temps_2_1_sala_blanca");
assert.equal(local.organs.cambra_nua_2.edition, "2.1-sala-blanca");
assert.equal(local.organs.cambra_nua_2.visual_mode, "white_room_colored_light");
assert.equal(local.repository.url, expectedRepository);
assert.equal(local.governance.automatic_canonical_status, false);
assert.equal(local.governance.human_editorial_decision_required, true);
assert.equal(local.governance.traceability_required, true);
assert.equal(local.governance.reversibility_required, true);

const fusion = await readFile(new URL("../fusio-total/index.html", import.meta.url), "utf8");
const interNos = await readFile(new URL("../inter-nos-creative/index.html", import.meta.url), "utf8");
const cambra = await readFile(new URL("../cambra-nua-2/index.html", import.meta.url), "utf8");
const portal = await readFile(new URL("../index.html", import.meta.url), "utf8");
const cambraIcon = await readFile(new URL("../assets/cambra-nua.svg", import.meta.url), "utf8");
assert.match(fusion, /Fusi[oó] Total 2\.4/);
assert.match(fusion, /inter-nos-creative/);
assert.match(interNos, /INTERLOCUTOR/);
assert.match(interNos, /LOCUTUS/);
assert.match(interNos, /CONSTITUCIÓ DE RECIPROCITAT/);
assert.match(interNos, /ORGANISME ESTABLE/);
assert.match(cambra, /SALA BLANCA/);
assert.match(cambra, /DIRECCIÓ ABSENT/);
assert.match(cambra, /bottom-nav/);
assert.match(cambra, /cambra\\.salaBlanca/);
assert.match(cambra, /AudioContext/);
assert.match(cambra, /inter-nos-creative/);
assert.match(portal, /assets\\/cambra-nua\\.svg/);
assert.match(portal, /href="\\.\\/cambra-nua-2\\/"/);
assert.match(cambraIcon, /#087dff/);
assert.match(cambraIcon, /#f0a51d/);
assert.match(cambraIcon, /#00c875/);
console.log("Extrem canònic verificat: INTER NOS estable i Cambra Nua 2.1 · Sala Blanca connectada.");

let response;
try {
  response = await fetch(local.site.manifest_url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
} catch (error) {
  console.warn("Site experimental no disponible; el fallback canònic continua actiu.", error.message);
}

if (response?.ok) {
  const remote = await response.json();
  assert.equal(remote.protocol, local.protocol);
  assert.equal(remote.site.url, local.site.url);
  assert.equal(remote.repository.url, local.repository.url);
  assert.equal(remote.repository.pages_url, local.repository.pages_url);
  assert.equal(remote.governance.automatic_canonical_status, false);
  assert.equal(remote.governance.human_editorial_decision_required, true);
  assert.equal(remote.governance.traceability_required, true);
  assert.equal(remote.governance.reversibility_required, true);
  console.log("Extrem experimental coherent: Site i GitHub es reconeixen.");
} else if (response) {
  console.warn(`Site experimental degradada: HTTP ${response.status}; el fallback canònic continua actiu.`);
}

console.log("PONS·AP·I coherent: publicació canònica, traçable i reversible.");
