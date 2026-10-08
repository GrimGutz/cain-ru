import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = path.join(root, "compendium/cain");
const allowed = new Set(["CAT", "CAIN", "CASTLE", "TEMERITY", "Temerity", "Authority", "SEER", "GPS", "NPC", "GM", "DOCref", "ETM", "III", "Centura", "Vamigo", "CATd"]);
const protectedTokens = /\{<CAT[^}]*\}|@UUID\[[^\]]*\]|\[\[[\s\S]*?\]\]/g;
const flatten = (value, prefix = "", result = {}) => {
  if (value && typeof value === "object") for (const [key, entry] of Object.entries(value)) flatten(entry, prefix ? `${prefix}.${key}` : key, result);
  else result[prefix] = value;
  return result;
};
let records = 0;
for (const filename of fs.readdirSync(directory)) {
  const current = JSON.parse(fs.readFileSync(path.join(directory, filename), "utf8"));
  const previous = JSON.parse(execFileSync("git", ["show", `a6d01e7:compendium/cain/${filename}`], { cwd: root, encoding: "utf8" }));
  assert.deepEqual(Object.keys(current.entries ?? {}), Object.keys(previous.entries ?? {}), `${filename}: entry keys`);
  for (const [name, entry] of Object.entries(current.entries ?? {})) {
    records++;
    const before = flatten(previous.entries[name]);
    for (const [field, value] of Object.entries(flatten(entry))) {
      if (typeof value !== "string") {
        assert.deepEqual(value, before[field], `${filename}: ${name}.${field}`);
        continue;
      }
      assert.deepEqual(value.match(protectedTokens) ?? [], String(before[field] ?? "").match(protectedTokens) ?? [], `${filename}: ${name}.${field}: CAT/UUID/roll syntax`);
      if (/^(?:abilities|powers|boldedTasks|unboldedTasks|afflictionEffect)(?:\.|$)/.test(field)) {
        assert.equal(value, before[field], `${filename}: ${name}.${field}: reference`);
        continue;
      }
      const text = value.replace(protectedTokens, "").replace(/<[^>]*>/g, "");
      for (const word of text.match(/[A-Za-z]{3,}/g) ?? []) assert.ok(allowed.has(word), `${filename}: ${name}.${field}: untranslated ${word}`);
    }
  }
}
console.log(`Passed: ${records} translation entries, protected CAT/UUID/roll syntax and reference fields; no unexpected English.`);
