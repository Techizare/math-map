// Checks data/concepts.json: unique ids, known domains, known prerequisites, no cycles.
// Usage: node tools/validate.mjs [path/to/concepts.json]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "data", "concepts.json");
const data = JSON.parse(readFileSync(path, "utf8"));
const errors = [];
const KINDS = new Set(["axiom", "concept", "theorem"]);

const domains = new Set(data.domains.map((d) => d.id));
const byId = new Map();
for (const c of data.concepts) {
  if (byId.has(c.id)) errors.push(`duplicate id: ${c.id}`);
  byId.set(c.id, c);
  if (!/^[a-z0-9-]+$/.test(c.id)) errors.push(`${c.id}: id must be lowercase letters, digits and hyphens`);
  if (!domains.has(c.domain)) errors.push(`${c.id}: unknown domain "${c.domain}"`);
  if (!KINDS.has(c.kind)) errors.push(`${c.id}: kind must be axiom, concept or theorem`);
  if (!c.name || !c.summary) errors.push(`${c.id}: missing name or summary`);
}
for (const c of data.concepts) {
  for (const r of c.requires) if (!byId.has(r)) errors.push(`${c.id}: requires unknown concept "${r}"`);
  if (new Set(c.requires).size !== c.requires.length) errors.push(`${c.id}: duplicate prerequisite`);
}

// Cycle check (depth-first search with colours).
const state = new Map();
const visit = (id, stack) => {
  if (state.get(id) === 2) return;
  if (state.get(id) === 1) { errors.push(`cycle: ${[...stack, id].join(" → ")}`); return; }
  state.set(id, 1);
  for (const r of byId.get(id)?.requires ?? []) visit(r, [...stack, id]);
  state.set(id, 2);
};
for (const id of byId.keys()) visit(id, []);

const edges = data.concepts.reduce((n, c) => n + c.requires.length, 0);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${byId.size} concepts, ${edges} dependencies, ${domains.size} domains`);
