import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import * as ui from "../scripts/ui-translations.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(os.tmpdir(), "cain-ru-testtools/package.json"));
const { JSDOM } = require("jsdom");
const dom = new JSDOM("<body></body>");
const context = vm.createContext({ ...ui, console, Node: dom.window.Node, NodeFilter: dom.window.NodeFilter, document: dom.window.document, window: dom.window, MutationObserver: dom.window.MutationObserver, game: { system: { id: "cain" }, i18n: { lang: "ru" }, settings: { get: () => true } }, Hooks: { once() {}, on() {} }, fetch: async (url) => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(path.join(root, url.replace("modules/cain-ru/", "")), "utf8")) }) });
vm.runInContext(fs.readFileSync(path.join(root, "scripts/cain-ru.mjs"), "utf8").replace(/^import .*\n/, "") + "\nglobalThis.audit={loadTranslationIndex,buildTranslationPatch,buildSinDossierPatch,translateElement,observeRuntimeText,matchesBilingualSearch,applyTranslationToDocument};", context);
const audit = context.audit;
vm.runInContext("globalThis.audit.applyOwnI18nPriority = applyOwnI18nPriority;", context);
context.game.i18n.translations = { CAIN: { Skills: "Неверный перевод" }, CORE: { CustomLabel: "Unchanged" } };
await audit.applyOwnI18nPriority();
assert.equal(context.game.i18n.translations.CAIN.Skills, "Навыки");
assert.equal(context.game.i18n.translations.CORE.CustomLabel, "Unchanged");
await audit.loadTranslationIndex();
const originals = JSON.parse(fs.readFileSync(path.join(root, "data/originals.json"), "utf8"));
const set = (object, key, value) => { const parts = key.split("."); const last = parts.pop(); let current = object; for (const part of parts) current = current[part] ??= {}; current[last] = structuredClone(value); };
let checked = 0;
for (const [pack, records] of Object.entries(originals.packs)) {
  const translations = JSON.parse(fs.readFileSync(path.join(root, `compendium/cain/cain.${pack}.json`), "utf8"));
  for (const [name, record] of Object.entries(records)) {
    const source = { name, type: record.type, documentName: record.documentName, system: {}, _stats: { compendiumSource: `Compendium.cain.${pack}.${record.id}` } };
    for (const [field, value] of Object.entries(record.fields)) set(source, field, value);
    const patch = audit.buildTranslationPatch(source);
    assert.ok(patch, `${pack}: ${name}`);
    for (const [key, field] of Object.entries(translations.mapping)) {
      if (["pages", "results", "text"].includes(field) || translations.entries[name][key] === undefined) continue;
      let actual = patch;
      for (const part of field.split(".")) actual = actual?.[part];
      assert.equal(JSON.stringify(actual), JSON.stringify(translations.entries[name][key]), `${pack}: ${name}.${field}`);
    }
    if (record.fields["system.description"]) {
      source.system.description = "Custom player description: keep this text";
      assert.equal(audit.buildTranslationPatch(source)?.system?.description, undefined, `Preserve custom description: ${name}`);
      source.system.description = "";
      assert.equal(audit.buildTranslationPatch(source)?.system?.description, undefined, `Preserve cleared description: ${name}`);
    }
    checked++;
  }
}
for (const [sinType, system] of Object.entries(originals.sins)) {
  const actor = { documentName: "Actor", type: "sin", system: { ...structuredClone(system), sinType } };
  const patch = audit.buildSinDossierPatch(actor);
  assert.match(patch.system.palace, /[А-Яа-яЁё]/);
  assert.ok(Object.values(patch.system.domains).every((domain) => /[А-Яа-яЁё]/.test(domain.title) && /[А-Яа-яЁё]/.test(domain.value)), `Legacy domains: ${sinType}`);
  actor.system.palace += " Custom GM additions";
  assert.equal(audit.buildSinDossierPatch(actor)?.system?.palace, undefined, `Preserve customised English palace: ${sinType}`);
  actor.flags = { "cain-ru": { emptyDossierFields: ["biography", "pressure"] } };
  actor.system.biography = "";
  actor.system.pressure = "";
  const cleared = audit.buildSinDossierPatch(actor);
  assert.equal(cleared?.system?.biography, undefined, `Preserve cleared biography: ${sinType}`);
  assert.equal(cleared?.system?.pressure, undefined, `Preserve cleared pressure: ${sinType}`);
}
const weapon = { name: "Табельное оружие", type: "item", system: { type: "Предмет" }, toObject() { return this; } };
assert.equal(audit.matchesBilingualSearch(weapon, "weapon"), true);
assert.equal(audit.matchesBilingualSearch(weapon, "оружие"), true);
vm.runInContext("globalThis.audit.applyBilingualCompendiumFilter = applyBilingualCompendiumFilter;", context);
const directory = dom.window.document.createElement("div");
directory.innerHTML = '<li class="directory-item folder collapsed"><ol class="subdirectory"><li data-entry-id="gear">Табельное оружие</li></ol></li>';
const folder = directory.querySelector(".folder");
const states = new Map([[folder, { expanded: false, collapsed: true }]]);
audit.applyBilingualCompendiumFilter(directory, { index: new Map([["gear", { ...weapon, _id: "gear" }]]) }, "weapon", states);
assert.equal(folder.classList.contains("expanded"), true);
assert.equal(folder.classList.contains("collapsed"), false);
audit.applyBilingualCompendiumFilter(directory, { index: new Map([["gear", { ...weapon, _id: "gear" }]]) }, "", states);
assert.equal(folder.classList.contains("expanded"), false);
assert.equal(folder.classList.contains("collapsed"), true);
const source = { documentName: "Item", toObject: () => ({ name: "Service Weapons", type: "item", system: {} }), updateSource() { throw new Error("Must not translate in English mode"); } };
context.game.i18n.lang = "en";
assert.equal(audit.applyTranslationToDocument(source), false);
context.game.i18n.lang = "ru";
dom.window.document.body.innerHTML = '<form class="session-end-form"><label for="survival">Did you <b>survive</b>?</label><h3>Up to 2 from <b>bold</b> agendas</h3><button type="button">Roll</button></form><textarea placeholder="Task description...">My custom English description</textarea>';
let clicks = 0;
dom.window.document.querySelector("button").addEventListener("click", () => clicks++);
audit.translateElement(dom.window.document.body);
assert.equal(dom.window.document.querySelector("label").textContent, "Вы выжили?");
assert.ok(!/bold|agendas/.test(dom.window.document.querySelector("h3").textContent));
dom.window.document.querySelector("button").click();
assert.equal(clicks, 1);
assert.equal(dom.window.document.querySelector("textarea").value, "My custom English description");
assert.equal(dom.window.document.querySelector("textarea").placeholder, "Описание задачи...");
audit.observeRuntimeText();
const button = dom.window.document.querySelector("button");
button.title = "Change Theme";
button.firstChild.nodeValue = "Custom Roll";
await new Promise((resolve) => setTimeout(resolve, 20));
assert.equal(button.title, "Изменить тему");
assert.equal(button.textContent, "Свой бросок");
console.log(`Passed: ${checked} library records, seven sin types, preserved custom text, bilingual search, English mode, DOM events and dynamic attributes.`);
dom.window.close();
