import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(os.tmpdir(), "cain-ru-testtools/package.json"));
const { chromium } = require("playwright");
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.on("pageerror", (error) => console.error("PAGE ERROR:", error.message));
  page.on("console", (message) => { if (message.type() === "error") console.error(message.text().slice(0, 500)); });
  await page.goto("http://127.0.0.1:30009/join");
  await page.locator("input[name='username']").fill("Test GM");
  await page.locator("button[name='join']").click();
  await page.waitForURL("**/game");
  await page.waitForFunction(() => globalThis.game?.ready && game.modules.get("cain-ru")?.active, null, { timeout: 30000 });
  await page.waitForFunction(() => globalThis.game?.items?.size > 900, null, { timeout: 30000 });
  console.log("READY", await page.evaluate(() => ({ items: game.items.size, language: game.i18n.lang, module: game.modules.get("cain-ru").version })));
  const result = await page.evaluate(async (originals) => {
    const tests = [];
    const untranslated = [];
    const assert = (condition, message) => { if (!condition) throw new Error(message); tests.push(message); };
    for (const pack of game.packs) {
      if (!pack.collection.startsWith("cain.")) continue;
      const documents = await pack.getDocuments();
      console.log("AUDIT PACK", pack.collection, documents.length);
      assert(documents.every((document) => /[А-Яа-яЁё]/.test(document.name) || /^\[/.test(document.name)), `Названия библиотеки ${pack.collection}`);
    }
    const itemPack = game.packs.get("cain.items");
    const weaponSource = originals.packs.items["Service Weapons"];
    const weapon = await itemPack.getDocument(weaponSource.id);
    assert(weapon.name.includes("оружие"), "Чтение переведённого предмета по UUID");
    const compendium = new itemPack.applicationClass({ collection: itemPack });
    await compendium.render({ force: true });
    const input = compendium.element.querySelector("input[type='search'], input[name='search']");
    for (const query of ["weapon", "оружие"]) {
      input.value = query;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 300));
      const row = compendium.element.querySelector(`[data-document-id='${weapon.id}'], [data-entry-id='${weapon.id}']`);
      assert(row && row.getClientRects().length > 0 && getComputedStyle(row).display !== "none", `Поиск в библиотеке: ${query}`);
    }
    await compendium.close();
    const character = await Actor.create({ name: "Тестовый экзорцист", type: "character", ownership: { CainRuPlayer0001: 3 } });
    async function checkSheet(document) {
      await document.sheet._render(true);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const start = performance.now();
      while (!document.sheet.element?.[0] && performance.now() - start < 5000) await new Promise((resolve) => requestAnimationFrame(resolve));
      const root = document.sheet.element[0];
      if (!(root instanceof Node)) throw new Error(`Sheet not rendered: ${document.type}`);
      const walker = window.document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const missing = new Set();
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest("script, style, code, pre, textarea, .editor-content, .ability-description, .affliction-description, .window-header")) continue;
        if (node.parentElement.closest(".font-picker, select[name*='font'], .blasphemy-power-body, .high-blasphemy-description")) continue;
        if (["Amiri", "Arial", "Beaufort", "Bruno Ace", "Courier", "Courier New", "Exocet", "GWENT", "Manuskript", "Marck Script", "Modesto Condensed", "OCR-A", "Roboto", "Roboto Condensed", "Roboto Serif", "Signika", "Times", "Times New Roman"].includes(node.nodeValue.trim())) continue;
        const text = node.nodeValue.trim().replace(/\{<[^>]*>[^}]*\}/g, "").replace(/\b(?:CAT|CAIN|XID|UUID|KP|XP|NPC|GM|JSON|CL-9|III|II|VII|VI|IV|I|V|X)\b/g, "");
        if (/[A-Za-z]{3}/.test(text)) missing.add(text);
      }
      if (missing.size) untranslated.push({ type: document.type, missing: [...missing] });
      await document.sheet.close();
    }
    const [embedded] = await character.createEmbeddedDocuments("Item", [weapon.toObject()]);
    assert(embedded.name === weapon.name && embedded.system.description === weapon.system.description, "Добавление предмета персонажу");
    await embedded.update({ "system.description": "Авторское описание игрока", name: "Личное оружие" });
    await character.sheet.getData();
    assert(embedded.system.description === "Авторское описание игрока" && embedded.name === "Личное оружие", "Сохранность пользовательского описания и названия");
    for (const type of ["agendaAbility", "blasphemyPower", "sinMarkAbility", "bondAbility"]) {
      const original = game.items.find((item) => item.type === type);
      const [ability] = await character.createEmbeddedDocuments("Item", [original.toObject()]);
      const field = type === "blasphemyPower" ? "powerDescription" : "abilityDescription";
      assert(ability.name === original.name && ability.system[field] === original.system[field] && /[А-Яа-яЁё]/.test(ability.system[field]), `Добавление способности: ${type}`);
    }
    const bond = game.items.find((item) => item.type === "bond");
    const bondData = await bond.sheet.getData();
    assert(bondData.bondAbilities.every((item) => item.system.abilityName === item.name), "Названия способностей в листе узы");
    for (const type of Object.keys(CONFIG.Item.dataModels)) {
      const document = game.items.find((item) => item.type === type);
      if (document) await checkSheet(document);
    }
    for (const type of ["mundane", "npc", "opponent"]) {
      const document = await Actor.create({ name: "Тестовый персонаж", type, ownership: { CainRuPlayer0001: 3 } });
      await checkSheet(document);
    }
    let clearedSinId;
    for (const sinType of Object.keys(originals.sins)) {
      const sin = await Actor.create({ name: `Тест ${sinType}`, type: "sin", system: { sinType }, ownership: { CainRuPlayer0001: 3 } });
      await sin.sheet.getData();
      assert(/[А-Яа-яЁё]/.test(sin.system.palace) && /[А-Яа-яЁё]/.test(sin.system.biography), `Досье нового греха: ${sinType}`);
      await sin.update({ "system.palace": "Мой собственный дворец" });
      await sin.sheet.getData();
      assert(sin.system.palace === "Мой собственный дворец", `Сохранность дворца: ${sinType}`);
      await checkSheet(sin);
      if (sinType === "centipede") {
        await sin.update({ "system.pressure": "", "system.biography": "" });
        await sin.sheet.getData();
        assert(sin.system.pressure === "" && sin.system.biography === "", "Намеренно очищенные поля досье сохраняются");
        clearedSinId = sin.id;
      }
    }
    const sin = game.actors.find((actor) => actor.type === "sin");
    await sin.update({ "system.sinType": "toad" });
    sin.sheet._onSinTypeSelect("toad");
    await new Promise((resolve) => setTimeout(resolve, 200));
    await sin.sheet.getData();
    assert(/[А-Яа-яЁё]/.test(sin.system.palace) && !sin.system.palace.includes("toad"), `Смена типа греха сохраняет русский текст: ${sin.system.palace.slice(0,100)}`);
    const { HomebrewWindow } = await import("/systems/cain/module/documents/homebrew-window.mjs");
    const { PlayerOverview } = await import("/systems/cain/module/documents/player-overview.mjs");
    const { SessionEndAdvancement } = await import("/systems/cain/module/documents/session-end-advancement.mjs");
    const { TalismanWindow } = await import("/systems/cain/module/documents/talisman-window.mjs");
    const { CainDicePanel } = await import("/systems/cain/module/dice/chat-dice-panel.mjs");
    const { default: HuntTracker } = await import("/systems/cain/module/components/hunt-tracker/hunt-tracker.mjs");
    const hunt = foundry.utils.deepClone(game.settings.get("cain", "currentHunt"));
    Object.assign(hunt, { active: true, sinActorId: sin.id, sinName: "Тестовый грех", sinType: "toad", traumas: sin.system.traumas.map((entry) => ({ question: entry.question, discovered: false, used: false })) });
    await game.settings.set("cain", "currentHunt", hunt);
    for (const app of [new HomebrewWindow(), new PlayerOverview(), new SessionEndAdvancement(character), new TalismanWindow(), new CainDicePanel(), new HuntTracker()]) {
      if (app instanceof foundry.applications.api.ApplicationV2) await app.render({ force: true });
      else await app._render(true);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const root = app.element instanceof HTMLElement ? app.element : app.element[0];
      const walker = window.document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const missing = new Set();
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest("script, style, code, pre, textarea, input, .window-header")) continue;
        if (Array.from(game.users).some((user) => user.name === node.nodeValue.trim())) continue;
        const text = node.nodeValue.trim().replace(/\b(?:CAT|CAIN|XID|UUID|KP|XP|NPC|GM|JSON|CL-9|III|II|VII|VI|IV|I|V|X|TEMERITY|Discord|Google|Test|ogre|toad|redacted|hound|idol|lord|centipede)\b/g, "");
        if (/[A-Za-z]{3}/.test(text) && !/^(?:cain-|worlds\/|src\/)/.test(text)) missing.add(text);
      }
      if (missing.size) untranslated.push({ type: app.constructor.name, missing: [...missing] });
      await app.close();
    }
    await character.sheet.render(true);
    await checkSheet(character);
    await character.sheet._render(true);
    const search = character.sheet.element.find(".item-search-input");
    for (const query of ["weapon", "оружие"]) {
      search.val(query).trigger("input");
      await new Promise((resolve) => setTimeout(resolve, 200));
      assert(character.sheet.element.find(".item-search-result").length > 0, `Поиск предметов: ${query}`);
    }
    const catText = window.formatCatText("{<CAT> range +1}", 2);
    assert(catText.includes("в пределах квартала") && !catText.includes("down the block"), "Перевод вычисляемой дальности CAT");
    return { tests, untranslated, actorId: character.id, embeddedId: embedded.id, clearedSinId };
  }, JSON.parse(fs.readFileSync(path.join(root, "data/originals.json"), "utf8")));
  console.log(JSON.stringify(result, null, 2));
  if (result.untranslated.length) throw new Error("Untranslated UI remains: " + JSON.stringify(result.untranslated));
  await page.screenshot({ path: path.join(os.tmpdir(), "cain-ru-character.png"), fullPage: true });
  await page.reload();
  await page.waitForFunction(() => globalThis.game?.ready, null, { timeout: 30000 });
  console.log("RELOAD", await page.evaluate(async ({ actorId, embeddedId, clearedSinId }) => {
    const item = game.actors.get(actorId).items.get(embeddedId);
    if (item.system.description !== "Авторское описание игрока") throw new Error("Reload lost custom description");
    const sin = game.actors.get(clearedSinId);
    await sin.sheet.getData();
    if (sin.system.pressure !== "" || sin.system.biography !== "") throw new Error("Reload refilled cleared dossier fields");
    return "Пользовательский текст сохранён после перезагрузки";
  }, result));
  const playerContext = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const player = await playerContext.newPage();
  await player.goto("http://127.0.0.1:30009/join");
  await player.locator("input[name='username']").fill("Test Player");
  await player.locator("button[name='join']").click();
  await player.waitForURL("**/game");
  await player.waitForFunction(() => globalThis.game?.ready, null, { timeout: 30000 });
  console.log("PLAYER", await player.evaluate(async ({ actorId }) => {
    const actor = game.actors.get(actorId);
    await actor.sheet._render(true);
    if (!/навыки/i.test(actor.sheet.element[0].textContent)) throw new Error("Player sheet not translated");
    return "Лист игрока переведён";
  }, result));
  await playerContext.close();
} finally {
  await browser.close();
}
