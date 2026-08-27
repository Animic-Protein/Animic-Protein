import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const expectedSite = "https://animic-protein.animic-protein.chatgpt.site";
const expectedRepository = "https://github.com/Animic-Protein/Animic-Protein.github.io";
const local = JSON.parse(await readFile(new URL("../pont-site.json", import.meta.url), "utf8"));

assert.equal(local.protocol, "PONS-AP-1.0");
assert.equal(local.site.url, expectedSite);
assert.equal(local.repository.url, expectedRepository);
assert.equal(local.governance.automatic_canonical_status, false);
assert.equal(local.governance.human_editorial_decision_required, true);
assert.equal(local.governance.traceability_required, true);
assert.equal(local.governance.reversibility_required, true);

const response = await fetch(local.site.manifest_url, {
  headers: { accept: "application/json" },
  signal: AbortSignal.timeout(15000),
});
assert.equal(response.ok, true, `La Site no exposa el manifest: HTTP ${response.status}`);
const remote = await response.json();

assert.equal(remote.protocol, local.protocol);
assert.equal(remote.site.url, local.site.url);
assert.equal(remote.repository.url, local.repository.url);
assert.equal(remote.repository.pages_url, local.repository.pages_url);
assert.equal(remote.governance.automatic_canonical_status, false);
assert.equal(remote.governance.human_editorial_decision_required, true);
assert.equal(remote.governance.traceability_required, true);
assert.equal(remote.governance.reversibility_required, true);

console.log("PONS·AP·I coherent: Site i GitHub es reconeixen sense publicació canònica automàtica.");
