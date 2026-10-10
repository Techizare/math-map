// Checks data/concepts.json: unique ids, known domains, known prerequisites, no cycles.
// Also checks data/details.json, if it sits next to it: every entry belongs to a known concept and has all its sections.
// Usage: node tools/validate.mjs [path/to/concepts.json]
import { readFileSync, existsSync } from "node:fs";
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

// Long explanations.
const detailsPath = join(dirname(path), "details.json");
let detailsLine = "";
if (existsSync(detailsPath)) {
  const { details = {}, illustrated = [] } = JSON.parse(readFileSync(detailsPath, "utf8"));
  for (const [id, d] of Object.entries(details)) {
    if (!byId.has(id)) errors.push(`details.json: unknown concept "${id}"`);
    for (const k of ["intuition", "exampleTitle", "example", "why"]) if (typeof d[k] !== "string" || !d[k].trim()) errors.push(`details.json: ${id} is missing "${k}"`);
  }
  for (const id of illustrated) if (!details[id]) errors.push(`details.json: illustrated "${id}" has no explanation`);
  detailsLine = `, ${Object.keys(details).length} long explanations, ${illustrated.length} animations`;
}

const edges = data.concepts.reduce((n, c) => n + c.requires.length, 0);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${byId.size} concepts, ${edges} dependencies, ${domains.size} domains${detailsLine}`);
