#!/usr/bin/env node
// Dev-only link checker (not loaded by the site). Run from anywhere:
//   node tools-dev/check-links.mjs                      print every problem
//   node tools-dev/check-links.mjs --save FILE          also write them to FILE
//   node tools-dev/check-links.mjs --baseline FILE      fail only on problems not in FILE
// Checks:
//   1. every local href/src in .html and .js files points to a file that exists
//      (.html refs resolve from the page; .js refs resolve from the JS file's folder
//      OR from any page that loads that script, since browsers resolve them from the page)
//   2. every ?v=x.y.z cache tag matches SITE_VERSION in site.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set([".git", "node_modules", "claude only", "uploads"]);
const SKIP_FILES = new Set(["tools-dev/check-links.mjs"]);
const VENDOR = /^assets\/vendor\//; // minified third-party code: no ref scan

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(path.relative(ROOT, p).split(path.sep).join("/"));
  }
  return out;
}

const files = walk(ROOT).filter((f) => /\.(html|js)$/i.test(f) && !SKIP_FILES.has(f));
const siteSrc = fs.readFileSync(path.join(ROOT, "site.js"), "utf8");
const SITE_VERSION = (siteSrc.match(/VERSION\s*=\s*"([^"]+)"/) || [])[1];

const REF = /\b(?:href|src)\s*(=|:)\s*(["'])([^"'\n]*?)\2/gi;
// `src: "mix"` / `src:"10.0.1.14"` in data objects aren't paths: for the object-key
// form, only check values that look like one (a slash or a file extension)
const PATHY = /\/|\.[a-z][a-z0-9]{0,4}$/i;
const VTAG = /\?v=([0-9]+\.[0-9]+\.[0-9]+)/g;

function isLocal(u) {
  if (!u || u.startsWith("#") || /^[A-Z_]+$|^\.\.\.$/.test(u) || u.includes("${") || u.includes("{{")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(u) || u.startsWith("//")) return false; // http:, mailto:, data:, javascript:
  return true;
}
function clean(u) { return decodeURIComponent(u.split("#")[0].split("?")[0]); }
function exists(rel) {
  const p = path.join(ROOT, rel);
  if (!p.startsWith(ROOT)) return false;
  const tries = [p, p + ".html", path.join(p, "index.html")];
  return tries.some((t) => { try { return fs.statSync(t).isFile(); } catch { return false; } });
}
function resolveFrom(dir, u) {
  return u.startsWith("/") ? u.slice(1) : path.posix.normalize(path.posix.join(dir, u));
}

// pass 1: which pages load which scripts (so JS refs can resolve from the page)
const loaders = new Map(); // js file -> Set(page dir)
for (const f of files.filter((f) => f.endsWith(".html"))) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  const dir = path.posix.dirname(f);
  for (const m of src.matchAll(/<script\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1/gi)) {
    if (!isLocal(m[2])) continue;
    const js = resolveFrom(dir, clean(m[2]));
    if (!loaders.has(js)) loaders.set(js, new Set());
    loaders.get(js).add(dir);
  }
}

const problems = [];
for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  const dir = path.posix.dirname(f);
  const isJs = f.endsWith(".js");
  const lineOf = (i) => src.slice(0, i).split("\n").length;
  if (!VENDOR.test(f)) {
    for (const m of src.matchAll(REF)) {
      const raw = m[3].trim();
      if (!isLocal(raw)) continue;
      if (m[1] === ":" && !PATHY.test(clean(raw))) continue;
      const u = clean(raw);
      if (!u || u === "." || u === "./") continue;
      // string concatenation ("../lobby.html?c=" + code) — check the static part only
      if (/['"]\s*\+/.test(src.slice(m.index + m[0].length - 1, m.index + m[0].length + 3)) && !/\.[a-z0-9]+$/i.test(u)) continue;
      const bases = [dir, ...(isJs ? loaders.get(f) || [] : [])];
      if (!bases.some((b) => exists(resolveFrom(b, u)))) problems.push(`MISSING  ${f}:${lineOf(m.index)}  ${raw}`);
    }
  }
  for (const m of src.matchAll(VTAG)) {
    if (m[1] !== SITE_VERSION) problems.push(`VERSION  ${f}:${lineOf(m.index)}  ?v=${m[1]} (site.js is ${SITE_VERSION})`);
  }
}

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
problems.sort();
if (opt("--save")) fs.writeFileSync(path.resolve(opt("--save")), problems.join("\n") + (problems.length ? "\n" : ""));

const base = opt("--baseline");
if (base) {
  // compare without line numbers so unrelated edits that shift lines don't count as new
  const key = (p) => p.replace(/:\d+ /, " ");
  const known = new Set(fs.readFileSync(path.resolve(base), "utf8").split("\n").filter(Boolean).map(key));
  const fresh = problems.filter((p) => !known.has(key(p)));
  console.log(`${files.length} files, SITE_VERSION ${SITE_VERSION}, ${problems.length} problems, ${fresh.length} new vs baseline`);
  fresh.forEach((p) => console.log("NEW " + p));
  process.exit(fresh.length ? 1 : 0);
}
problems.forEach((p) => console.log(p));
console.log(`${files.length} files, SITE_VERSION ${SITE_VERSION}, ${problems.length} problems`);
process.exit(problems.length ? 1 : 0);
