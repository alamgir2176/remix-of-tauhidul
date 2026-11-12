#!/usr/bin/env node
/**
 * Checks everything in content/ before you commit:
 *   node scripts/check-content.mjs     (or: bun run check:content)
 * Reports broken JSON, missing fields, missing image/PDF files and oversized files.
 * Exits with an error only for problems that would hide an entry; size notes are warnings.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const IMAGE_WARN = 500 * 1024;
const PDF_WARN = 5 * 1024 * 1024;
const AUDIO_WARN = 8 * 1024 * 1024;

function checkFile(publicPath, label, limit) {
  if (/^https?:\/\//i.test(publicPath)) return;
  const file = join(root, "public", decodeURIComponent(publicPath));
  if (!existsSync(file)) return err(`${label}: file not found -> public${publicPath}`);
  const size = statSync(file).size;
  if (size > limit) warn(`${label}: public${publicPath} is ${(size / 1048576).toFixed(1)} MB; consider compressing it`);
}
function asset(value, folder) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
  return `${folder}${value.replace(/^\.\//, "")}`;
}
function readJson(rel) {
  const file = join(root, "content", rel);
  if (!existsSync(file)) return [];
  try {
    const data = JSON.parse(readFileSync(file, "utf8"));
    const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : null;
    if (!list) err(`content/${rel}: must be a list ( [ ... ] )`);
    return list ?? [];
  } catch (e) {
    err(`content/${rel}: invalid JSON (${e.message})`);
    return [];
  }
}

const external = ["projects", "books", "research", "articles", "editorials", "opinion-pieces", "talk-shows", "seminars"];
for (const name of external) {
  readJson(`external/${name}.json`).forEach((row, i) => {
    const at = `content/external/${name}.json item ${i + 1}`;
    if (!row.title) err(`${at}: missing "title" (the entry will not be shown)`);
    if (!/^https?:\/\//i.test(row.url ?? row.link ?? "")) err(`${at}: "url" must start with https:// (the entry will not be shown)`);
    const img = row.image ?? row.thumbnail;
    if (img) checkFile(asset(img, "/images/external/"), at, IMAGE_WARN);
  });
}
for (const [name, folder] of [["notices", "/documents/notices/"], ["press-releases", "/documents/press-releases/"]]) {
  readJson(`${name}.json`).forEach((row, i) => {
    const at = `content/${name}.json item ${i + 1}`;
    if (!row.title) err(`${at}: missing "title" (the entry will not be shown)`);
    if (!row.date || Number.isNaN(Date.parse(row.date))) warn(`${at}: "date" should look like 2026-11-13`);
    if (!row.pdf && !row.file) warn(`${at}: no "pdf" file set; there will be no download button`);
    else checkFile(asset(row.pdf ?? row.file, folder), at, PDF_WARN);
  });
}
readJson("activities.json").forEach((row, i) => {
  const at = `content/activities.json item ${i + 1}`;
  if (!(row.image ?? row.file)) return err(`${at}: missing "image" (the photo will not be shown)`);
  if (!row.caption) warn(`${at}: missing "caption"`);
  checkFile(asset(row.image ?? row.file, "/images/activities/"), at, IMAGE_WARN);
});

const blogDir = join(root, "content", "blog");
if (existsSync(blogDir)) {
  const slugs = new Map();
  for (const f of readdirSync(blogDir).filter((n) => n.endsWith(".md") && !n.startsWith("_"))) {
    const at = `content/blog/${f}`;
    const text = readFileSync(join(blogDir, f), "utf8");
    const fm = text.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? "";
    const get = (k) => fm.match(new RegExp(`^${k}\\s*:\\s*(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "") ?? "";
    if (get("draft") === "true") continue;
    if (!get("title")) warn(`${at}: no "title" in the header; the file name will be used`);
    if (!get("date") || Number.isNaN(Date.parse(get("date")))) warn(`${at}: "date" should look like 2026-11-13`);
    const slug = (get("slug") || f.replace(/\.md$/, "")).toLowerCase();
    if (slugs.has(slug)) err(`${at}: same web address as ${slugs.get(slug)}`);
    slugs.set(slug, at);
    if (get("cover")) checkFile(asset(get("cover"), "/images/blog/"), at + " cover", IMAGE_WARN);
    for (const m of text.matchAll(/!\[[^\]]*\]\(\s*([^)\s"]+)/g)) checkFile(asset(m[1], "/images/blog/"), at, IMAGE_WARN);
    for (const m of text.matchAll(/^::audio\[([^\]]+)\]/gm)) checkFile(asset(m[1], "/audio/"), at, AUDIO_WARN);
    for (const m of text.matchAll(/^::pdf\[([^\]]+)\]/gm)) checkFile(asset(m[1], "/documents/blog/"), at, PDF_WARN);
  }
}

for (const w of warnings) console.log(`warning  ${w}`);
for (const e of errors) console.log(`ERROR    ${e}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
