import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import os from "node:os";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import * as ui from "../scripts/ui-translations.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const system = path.resolve(root, "../../systems/cain");
const require = createRequire(path.join(process.env.CAIN_TEST_TOOLS ?? path.join(os.tmpdir(), "cain-ru-testtools"), "package.json"));
const { JSDOM } = require("jsdom");
const { parse } = require("acorn");
const dom = new JSDOM();
const context = vm.createContext({ ...ui, console, Node: dom.window.Node, NodeFilter: dom.window.NodeFilter, document: dom.window.document, game: { system: { id: "cain" }, i18n: { lang: "ru" }, settings: { get: () => true } }, Hooks: { once() {}, on() {} } });
vm.runInContext(fs.readFileSync(path.join(root, "scripts/cain-ru.mjs"), "utf8").replace(/^import .*\n/, "") + "\nglobalThis.audit = {translateText, translateElement, shouldSkipElement};", context);
const files = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const normalize = (value) => value.replace(/\s+/g, " ").trim();
const allowed = /^(?:CAT(?: \d+)?|CAIN|XID|UUID|JSON|\d*d\d+(?:\+\d+)?|2d3|1d6|1d3|1D|0d|X|VII|VI|IV|III|II|I|KP|CL-9)$/;
const report = new Map();
function missing(file, text) {
  text = normalize(text);
  if (context.audit.translateText(text) !== text) return;
  text = text.replace(/\{<[^>]*>[^}]*\}/g, "").replace(/\b(?:CAT|CAIN|XID|UUID|KP|XP|NPC|GM|JSON|III|II|VII|VI|IV|I|V|X|CL-9|Discord|Google|GitHub)\b/g, "");
  if (/^\s*$/.test(text) || /[А-Яа-яЁё]/.test(text) || /^(?:pathos-tracker|hunt-tracker|cain-dice-roller|test-talisman|INVALID|UNDER\/\/HEAVEN)$/.test(text)) return;
  if (!/[A-Za-z]{2}/.test(text) || allowed.test(text) || /^(?:https?:|systems\/|worlds\/|src\/|cain-|#|\.|CAIN\.|flags\.)/.test(text)) return;
  if (context.audit.translateText(text) !== text) return;
  const values = report.get(file) ?? new Set();
  values.add(text);
  report.set(file, values);
}
function html(file, source) {
  const element = dom.window.document.createElement("div");
  element.innerHTML = source.replace(/\{\{!--[\s\S]*?--\}\}|\{\{![\s\S]*?\}\}/g, "").replace(/\{\{\{[\s\S]*?\}\}\}|\{\{[\s\S]*?\}\}/g, "Имя");
  for (const node of element.querySelectorAll("style, script, code, pre, kbd, samp")) node.remove();
  for (const node of element.querySelectorAll("textarea")) node.textContent = "";
  context.audit.translateElement(element);
  const walker = dom.window.document.createTreeWalker(element, dom.window.NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) if (!context.audit.shouldSkipElement(walker.currentNode.parentElement)) missing(file, walker.currentNode.nodeValue);
  for (const node of element.querySelectorAll("*")) for (const attribute of ["title", "placeholder", "data-tooltip", "aria-label", "alt"]) if (node.hasAttribute(attribute)) missing(file, node.getAttribute(attribute));
}
for (const file of [...files(path.join(system, "templates")), ...files(path.join(system, "module"))]) {
  const relative = path.relative(system, file);
  const source = fs.readFileSync(file, "utf8");
  if (file.endsWith(".hbs")) html(relative, source);
  if (!file.endsWith(".mjs") || file.includes(`${path.sep}data${path.sep}`)) continue;
  const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
  const sinStart = source.indexOf("const sinTypeMapping =");
  const sinEnd = source.indexOf("const sinTypeData =", sinStart);
  function visit(node, parent) {
    if (!node || typeof node !== "object") return;
    if (sinStart !== -1 && node.start >= sinStart && node.end <= sinEnd) return;
    if (node.type === "TemplateLiteral") {
      const value = node.quasis.map((part) => part.value.cooked).join("Имя");
      if (/<[a-z]/i.test(value)) html(relative, value);
    }
    if (node.type === "Literal" && typeof node.value === "string") {
      if (/<[a-z]/i.test(node.value)) html(relative, node.value);
      else if ((parent?.type === "Property" && ["name", "label", "title", "hint", "description"].includes(parent.key.name)) || (parent?.type === "CallExpression" && /notifications\./.test(source.slice(parent.start, node.start)))) missing(relative, node.value);
    }
    for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach((child) => visit(child, node)); else if (value?.type) visit(value, node);
  }
  visit(ast);
}
for (const [file, values] of report) console.log(JSON.stringify({ file, missing: [...values] }));
