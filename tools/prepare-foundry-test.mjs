import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const userData = path.resolve(root, "../../..");
const location = path.join(os.tmpdir(), "cain-ru-foundry-test");
fs.mkdirSync(path.join(location, "Config"), { recursive: true });
fs.copyFileSync(path.join(userData, "Config/license.json"), path.join(location, "Config/license.json"));
fs.writeFileSync(path.join(location, "Config/options.json"), JSON.stringify({ dataPath: location, port: 30009, upnp: false, telemetry: false, language: "ru", hotReload: false }));
fs.cpSync(path.join(userData, "Data/systems/cain"), path.join(location, "Data/systems/cain"), { recursive: true });
for (const module of ["cain-ru", "babele", "ru-ru"]) fs.cpSync(path.join(userData, "Data/modules", module), path.join(location, "Data/modules", module), { recursive: true, filter: (entry) => !entry.includes(`${path.sep}.git`) });
const world = path.join(location, "Data/worlds/cain-ru-test");
fs.mkdirSync(path.join(world, "data"), { recursive: true });
fs.writeFileSync(path.join(world, "world.json"), JSON.stringify({ id: "cain-ru-test", title: "CAIN RU Test", system: "cain", coreVersion: "14.368", systemVersion: "1.3.26", compatibility: { minimum: "14", verified: "14" } }));
const require = createRequire("C:/Program Files/Foundry Virtual Tabletop/resources/app/package.json");
const { ClassicLevel } = require("classic-level");
for (const [collection, documents] of Object.entries({
  users: [{ _id: "CainRuTestGM0001", name: "Test GM", role: 4, password: null, color: "#22aa55" }, { _id: "CainRuPlayer0001", name: "Test Player", role: 1, password: null, color: "#aa2255" }],
  settings: [{ _id: "CainRuModules001", key: "core.moduleConfiguration", value: JSON.stringify({ "cain-ru": true, babele: true, "ru-ru": true }) }, { _id: "CainRuLanguage01", key: "core.language", value: JSON.stringify("ru") }, { _id: "CainRuTutorial01", key: "cain.GMTutorialFinished", value: "true" }]
})) {
  const database = new ClassicLevel(path.join(world, "data", collection), { valueEncoding: "json" });
  await database.clear();
  const sublevel = database.sublevel(collection, { valueEncoding: "json" });
  for (const document of documents) await sublevel.put(document._id, document);
  await database.close();
}
console.log(location);
