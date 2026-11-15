#!/usr/bin/env node
/**
 * Writes public/sitemap.xml and the Sitemap line of public/robots.txt from the content folder.
 * Runs automatically before every build (see "prebuild" in package.json), so new articles
 * appear in the sitemap by themselves. Drafts and hidden entries are left out.
 *   node scripts/generate-sitemap.mjs
 * The address comes from VITE_SITE_URL, or falls back to https://tauhidul.vercel.app/
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const origin = (() => {
  try {
    const u = new URL(process.env.VITE_SITE_URL || "https://tauhidul.vercel.app/");
    return u.protocol === "https:" ? u.origin : "https://tauhidul.vercel.app";
  } catch {
    return "https://tauhidul.vercel.app";
  }
})();

const SECTIONS = ["projects", "books", "research", "articles", "editorials", "opinion-pieces", "talk-shows", "seminars"];
const cleanSlug = (v) => v.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const urls = [];
const add = (path, lastmod) => urls.push({ loc: origin + path, lastmod });
const isoDay = (v) => (/^\d{4}-\d{2}-\d{2}/.test(String(v ?? "")) ? String(v).slice(0, 10) : undefined);

function jsonRows(file) {
  try {
    const rows = JSON.parse(readFileSync(file, "utf8"));
    return Array.isArray(rows) ? rows.filter((r) => r && r.hidden !== true && r.draft !== true) : [];
  } catch {
    return [];
  }
}

add("/");
add("/writings");
add("/library");
add("/notices");
add("/activities");

for (const s of SECTIONS) {
  if (jsonRows(join(root, "content/external", `${s}.json`)).length > 0) add(`/library/${s}`);
}

const blogDir = join(root, "content/blog");
if (existsSync(blogDir)) {
  for (const name of readdirSync(blogDir).sort()) {
    if (!name.endsWith(".md") || name.startsWith("_")) continue;
    const text = readFileSync(join(blogDir, name), "utf8");
    const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? "";
    const field = (k) => new RegExp(`^${k}:\\s*(.+)$`, "m").exec(front)?.[1]?.trim().replace(/^["']|["']$/g, "");
    if (field("draft") === "true" || !field("title")) continue;
    const slug = cleanSlug(field("slug") ?? "") || cleanSlug(name.slice(0, -3));
    add(`/writings/${encodeURI(slug)}`, isoDay(field("date")) ?? isoDay(statSync(join(blogDir, name)).mtime.toISOString()));
  }
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n") +
  `\n</urlset>\n`;
writeFileSync(join(root, "public/sitemap.xml"), xml);

const robotsFile = join(root, "public/robots.txt");
const robots = existsSync(robotsFile) ? readFileSync(robotsFile, "utf8") : "User-agent: *\nAllow: /\n";
const line = `Sitemap: ${origin}/sitemap.xml`;
writeFileSync(
  robotsFile,
  /^Sitemap:.*$/m.test(robots) ? robots.replace(/^Sitemap:.*$/m, line) : `${robots.replace(/\s*$/, "\n")}\n${line}\n`,
);
console.log(`sitemap: ${urls.length} addresses (${origin})`);
