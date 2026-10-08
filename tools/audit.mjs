import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const system = path.resolve(root, "../../systems/cain");
const app = process.env.FOUNDRY_APP_PATH ?? "C:/Program Files/Foundry Virtual Tabletop/resources/app";
const require = createRequire(path.join(app, "package.json"));
const { ClassicLevel } = require("classic-level");
const manifest = JSON.parse(fs.readFileSync(path.join(system, "system.json"), "utf8"));
const get = (data, key) => key.split(".").reduce((value, part) => value?.[part], data);
const snapshot = { systemVersion: manifest.version, packs: {}, sins: {} };
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "cain-ru-audit-"));
let missingCount = 0;

// Only copies are opened: LevelDB can update housekeeping files even during reads.
for (const pack of manifest.packs) {
  const directory = path.join(temporary, pack.name);
  fs.cpSync(path.join(system, pack.path), directory, { recursive: true });
  const database = new ClassicLevel(directory, { valueEncoding: "json", createIfMissing: false });
  const translation = JSON.parse(fs.readFileSync(path.join(root, `compendium/cain/cain.${pack.name}.json`), "utf8"));
  const previous = JSON.parse(execFileSync("git", ["show", `a6d01e7:compendium/cain/cain.${pack.name}.json`], { cwd: root, encoding: "utf8" }));
  const documents = [];
  const embedded = new Map();
  try {
    await database.open();
    for await (const [key, data] of database.iterator()) {
      const collection = { Item: "items", Actor: "actors", RollTable: "tables", JournalEntry: "journal" }[pack.type];
      if (key.startsWith(`!${collection}!`) && data?.name && data?._id) documents.push(data);
      else if (data?._id) embedded.set(data._id, data);
    }
  } finally {
    await database.close();
  }
  const missing = documents.filter((data) => !translation.entries?.[data.name]);
  missingCount += missing.length;
  const sourceRecords = documents.map((data) => [data.name, {
    id: data._id,
    type: data.type,
    documentName: pack.type,
    previous: previous.entries?.[data.name],
    fields: Object.fromEntries(Object.values(translation.mapping ?? {}).map((key) => {
      let value = get(data, key);
      if (["results", "pages"].includes(key) && Array.isArray(value)) value = value.map((id) => embedded.get(id)).filter(Boolean);
      return [key, value];
    }).filter(([, value]) => value !== undefined))
  }]);
  snapshot.packs[pack.name] = {};
  for (const [name, record] of sourceRecords) {
    const existing = snapshot.packs[pack.name][name];
    if (!existing) snapshot.packs[pack.name][name] = record;
    else {
      existing.variants ??= [{ id: existing.id, type: existing.type, fields: existing.fields }];
      existing.variants.push({ id: record.id, type: record.type, fields: record.fields });
    }
  }
  console.log(JSON.stringify({ pack: pack.name, source: documents.length, translated: Object.keys(translation.entries ?? {}).length, missing: missing.map((data) => ({ name: data.name, type: data.type })) }));
}

const sheet = fs.readFileSync(path.join(system, "module/sheets/actor-sheet.mjs"), "utf8");
const start = sheet.indexOf("const sinTypeMapping = ") + "const sinTypeMapping = ".length;
const end = sheet.indexOf("const sinTypeData =", start);
snapshot.sins = vm.runInNewContext(`(${sheet.slice(start, end).trim().replace(/;$/, "")})`);
if (process.argv.includes("--snapshot")) {
  fs.mkdirSync(path.join(root, "data"), { recursive: true });
  fs.writeFileSync(path.join(root, "data/originals.json"), JSON.stringify(snapshot, null, 2) + "\n");
}
console.log(`Missing source documents: ${missingCount}`);
