/**
 * Pure helpers that turn files from the `content/` folder into typed objects.
 * No file-system or bundler APIs here, so they are easy to test.
 */
import { blocksText, parseMarkdown, resolveAsset, safeUrl, type Block } from "./markdown";

/* ------------------------------------------------------------------ */
/* Section registry                                                    */
/* ------------------------------------------------------------------ */

export interface ExternalSection {
  /** URL segment: /library/<slug> */
  slug: string;
  /** JSON file in content/external/<slug>.json */
  title: string;
  singular: string;
  blurb: string;
}

export const EXTERNAL_SECTIONS: readonly ExternalSection[] = [
  { slug: "projects", title: "Projects", singular: "Project", blurb: "Work and initiatives I have taken part in or led." },
  { slug: "books", title: "Books", singular: "Book", blurb: "Books I have written, contributed to, or recommend." },
  { slug: "research", title: "Research", singular: "Research", blurb: "Academic and independent research, papers and studies." },
  { slug: "articles", title: "Articles", singular: "Article", blurb: "Articles of mine published on other websites and journals." },
  { slug: "editorials", title: "Editorials", singular: "Editorial", blurb: "Editorials published in newspapers and magazines." },
  { slug: "opinion-pieces", title: "Opinion pieces", singular: "Opinion", blurb: "Opinion pieces and commentary published elsewhere." },
  { slug: "talk-shows", title: "Talk shows", singular: "Talk show", blurb: "Television, radio and online talk-show appearances." },
  { slug: "seminars", title: "Seminars", singular: "Seminar", blurb: "Seminars, lectures and conferences I have taken part in." },
] as const;

export function findExternalSection(slug: string): ExternalSection | undefined {
  return EXTERNAL_SECTIONS.find((s) => s.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

/** Accepts YYYY-MM-DD (or a full ISO string) and returns a sortable timestamp, 0 if invalid. */
export function dateValue(input: unknown): number {
  if (typeof input !== "string" && !(input instanceof Date)) return 0;
  const value = input instanceof Date ? input.toISOString() : input.trim();
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const time = m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

/** Always formatted in UTC so server and browser agree and the day never shifts. */
export function formatDate(input: unknown): string {
  const time = dateValue(input);
  if (!time) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(time),
  );
}

/* ------------------------------------------------------------------ */
/* Frontmatter                                                         */
/* ------------------------------------------------------------------ */

export function parseFrontmatter(raw: string): { data: Record<string, string | boolean | string[]>; body: string } {
  const text = raw.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const m = text.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!m) return { data: {}, body: text };
  const data: Record<string, string | boolean | string[]> = {};
  for (const line of (m[1] ?? "").split("\n")) {
    const kv = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (!kv || !kv[1]) continue;
    let value = (kv[2] ?? "").trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      data[kv[1]] = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      continue;
    }
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else if (value === "true" || value === "false") {
      data[kv[1]] = value === "true";
      continue;
    }
    data[kv[1]] = value;
  }
  return { data, body: text.slice(m[0].length) };
}

/* ------------------------------------------------------------------ */
/* Blog posts                                                          */
/* ------------------------------------------------------------------ */

export interface Post {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  excerpt: string;
  cover: string;
  coverAlt: string;
  tags: string[];
  readingMinutes: number;
  blocks: Block[];
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

function cleanSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugFromPath(path: string): string {
  const file = path.split("/").pop() ?? path;
  return cleanSlug(file.replace(/\.md$/i, ""));
}

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 30)).replace(/[,;:.\s]+$/, "") + "…";
}

export function countWords(text: string): number {
  return (text.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu) ?? []).length;
}

/** Returns null for drafts or files without a usable title. */
export function buildPost(path: string, raw: string): Post | null {
  const { data, body } = parseFrontmatter(raw);
  if (data["draft"] === true) return null;
  const blocks = parseMarkdown(body);
  const text = blocksText(blocks);
  const firstHeading = blocks.find((b) => b.t === "heading");
  const title =
    str(data["title"]) ||
    (firstHeading && firstHeading.t === "heading" ? blocksText([firstHeading]) : "") ||
    slugFromPath(path).replace(/-/g, " ");
  const slug = cleanSlug(str(data["slug"])) || slugFromPath(path);
  if (!slug || !title) return null;
  const date = str(data["date"]);
  const cover = str(data["cover"]) ? resolveAsset("image", str(data["cover"])) : "";
  const tags = Array.isArray(data["tags"]) ? data["tags"] : [];
  const excerpt = str(data["excerpt"]) || str(data["description"]) || truncate(text, 180);
  return {
    slug,
    title,
    date,
    dateLabel: formatDate(date),
    excerpt,
    cover,
    coverAlt: str(data["coverAlt"]) || str(data["cover_alt"]) || title,
    tags,
    readingMinutes: Math.max(1, Math.round(countWords(text) / 200)),
    blocks,
  };
}

export function buildPosts(files: Record<string, string>): Post[] {
  const seen = new Set<string>();
  const posts: Post[] = [];
  for (const path of Object.keys(files).sort()) {
    // Files whose name starts with "_" are templates and are never published.
    if ((path.split("/").pop() ?? "").startsWith("_")) continue;
    const post = buildPost(path, files[path] ?? "");
    if (!post || seen.has(post.slug)) continue;
    seen.add(post.slug);
    posts.push(post);
  }
  return posts.sort((a, b) => dateValue(b.date) - dateValue(a.date) || a.title.localeCompare(b.title));
}

/* ------------------------------------------------------------------ */
/* JSON-backed sections                                                */
/* ------------------------------------------------------------------ */

type Json = Record<string, unknown>;

/** Accepts `[ … ]` or `{ "items": [ … ] }`, and ignores anything that is not an object. */
export function toList(data: unknown): Json[] {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as Json)["items"])
      ? ((data as Json)["items"] as unknown[])
      : [];
  return list.filter((x): x is Json => !!x && typeof x === "object" && !Array.isArray(x));
}

const isTrue = (v: unknown) => v === true || v === "true";
const httpUrl = (v: unknown): string => {
  const url = safeUrl(str(v));
  return /^https?:\/\//i.test(url) ? url : "";
};

export interface ExternalItem {
  title: string;
  url: string;
  host: string;
  description: string;
  category: string;
  source: string;
  image: string;
  date: string;
  dateLabel: string;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function normalizeExternal(data: unknown): ExternalItem[] {
  const items: ExternalItem[] = [];
  for (const row of toList(data)) {
    if (isTrue(row["hidden"]) || isTrue(row["draft"])) continue;
    const title = str(row["title"]);
    const url = httpUrl(row["url"] ?? row["link"]);
    if (!title || !url) continue;
    const image = str(row["image"] ?? row["thumbnail"]);
    items.push({
      title,
      url,
      host: hostOf(url),
      description: str(row["description"] ?? row["excerpt"]),
      category: str(row["category"] ?? row["type"]),
      source: str(row["source"] ?? row["publisher"]),
      image: image ? resolveAsset("image", image.startsWith("/") || /^https?:/i.test(image) ? image : `/images/external/${image}`) : "",
      date: str(row["date"]),
      dateLabel: formatDate(row["date"]),
    });
  }
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => dateValue(b.item.date) - dateValue(a.item.date) || a.index - b.index)
    .map(({ item }) => item);
}

export interface DocumentItem {
  title: string;
  date: string;
  dateLabel: string;
  description: string;
  pdf: string;
  fileName: string;
}

/** `folder` is where bare PDF file names are looked up, e.g. `/documents/notices/`. */
export function normalizeDocuments(data: unknown, folder: string): DocumentItem[] {
  const items: DocumentItem[] = [];
  for (const row of toList(data)) {
    if (isTrue(row["hidden"]) || isTrue(row["draft"])) continue;
    const title = str(row["title"]);
    if (!title) continue;
    const file = str(row["pdf"] ?? row["file"]);
    let pdf = "";
    if (file) {
      if (/^https?:\/\//i.test(file) || file.startsWith("/")) pdf = file.startsWith("//") ? "" : file;
      else pdf = folder + file.replace(/^\.\//, "");
    }
    items.push({
      title,
      date: str(row["date"]),
      dateLabel: formatDate(row["date"]),
      description: str(row["description"]),
      pdf,
      fileName: pdf ? decodeURIComponent(pdf.split("/").pop() ?? "") : "",
    });
  }
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => dateValue(b.item.date) - dateValue(a.item.date) || a.index - b.index)
    .map(({ item }) => item);
}

export interface Photo {
  image: string;
  caption: string;
  alt: string;
  activity: string;
  date: string;
  dateLabel: string;
  location: string;
}

export interface PhotoGroup {
  activity: string;
  date: string;
  dateLabel: string;
  photos: Photo[];
}

export function normalizePhotos(data: unknown): Photo[] {
  const photos: Photo[] = [];
  for (const row of toList(data)) {
    if (isTrue(row["hidden"]) || isTrue(row["draft"])) continue;
    const file = str(row["image"] ?? row["file"]);
    if (!file) continue;
    const image =
      /^https?:\/\//i.test(file) || file.startsWith("/") ? (file.startsWith("//") ? "" : file) : `/images/activities/${file.replace(/^\.\//, "")}`;
    if (!image) continue;
    const caption = str(row["caption"]);
    photos.push({
      image,
      caption,
      alt: str(row["alt"]) || caption || str(row["activity"]) || "Activity photograph",
      activity: str(row["activity"] ?? row["title"]),
      date: str(row["date"]),
      dateLabel: formatDate(row["date"]),
      location: str(row["location"]),
    });
  }
  return photos;
}

/** Groups photos by activity name (newest group first); photos without a name share one group. */
export function groupPhotos(photos: Photo[]): PhotoGroup[] {
  const groups = new Map<string, PhotoGroup>();
  for (const photo of photos) {
    const key = photo.activity || "";
    const group = groups.get(key) ?? { activity: key, date: "", dateLabel: "", photos: [] };
    group.photos.push(photo);
    if (dateValue(photo.date) > dateValue(group.date)) {
      group.date = photo.date;
      group.dateLabel = photo.dateLabel;
    }
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group, index) => ({ group, index }))
    .sort((a, b) => {
      if (!a.group.activity !== !b.group.activity) return a.group.activity ? -1 : 1;
      return dateValue(b.group.date) - dateValue(a.group.date) || a.index - b.index;
    })
    .map(({ group }) => group);
}
