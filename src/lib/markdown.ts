/**
 * Small, dependency-free Markdown engine for the blog.
 *
 * It turns Markdown text into a typed block tree (never raw HTML), so rendering is safe by
 * construction. Beyond CommonMark basics it understands tables, strikethrough, bare links,
 * images with captions, and a few embed directives (YouTube, audio, PDF).
 *
 * Embed directive syntax (one per line):
 *   ::youtube[https://www.youtube.com/watch?v=VIDEO_ID]{caption="Optional caption"}
 *   ::audio[episode.mp3]{title="Episode 1" caption="Optional caption"}
 *   ::pdf[report.pdf]{title="Annual report" embed="true"}
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "code"; v: string }
  | { t: "strong"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "del"; c: Inline[] }
  | { t: "link"; href: string; c: Inline[] }
  | { t: "img"; src: string; alt: string }
  | { t: "br" };

export interface ListItem {
  c: Inline[];
  children: Block[];
}

export type Block =
  | { t: "heading"; level: number; id: string; c: Inline[] }
  | { t: "p"; c: Inline[] }
  | { t: "quote"; c: Block[] }
  | { t: "list"; ordered: boolean; start: number; items: ListItem[] }
  | { t: "code"; lang: string; v: string }
  | { t: "hr" }
  | { t: "figure"; src: string; alt: string; caption: string }
  | { t: "youtube"; id: string; start: number; caption: string; title: string }
  | { t: "audio"; src: string; title: string; caption: string }
  | { t: "pdf"; src: string; title: string; embed: boolean }
  | {
      t: "table";
      head: Inline[][];
      align: ("left" | "center" | "right" | null)[];
      rows: Inline[][][];
    };

/* ------------------------------------------------------------------ */
/* URLs and assets                                                     */
/* ------------------------------------------------------------------ */

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const SAFE_SCHEMES = /^(https?:|mailto:|tel:)/i;

/** Blocks javascript:, data:, vbscript: and any other unknown scheme. */
export function safeUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return "#";
  if (url.startsWith("//")) return "#";
  if (SCHEME.test(url)) return SAFE_SCHEMES.test(url) ? url : "#";
  return url;
}

export type AssetKind = "image" | "audio" | "document";

const ASSET_FOLDERS: Record<AssetKind, string> = {
  image: "/images/blog/",
  audio: "/audio/",
  document: "/documents/blog/",
};

/**
 * `/path` and `https://…` are kept as written. A bare file name such as `photo.jpg`
 * is looked up in the matching blog folder (images/blog, audio, documents/blog).
 */
export function resolveAsset(kind: AssetKind, src: string): string {
  const value = src.trim();
  if (!value) return "";
  if (value.startsWith("//")) return "";
  if (SCHEME.test(value)) return /^https?:/i.test(value) ? value : "";
  if (value.startsWith("/")) return value;
  return ASSET_FOLDERS[kind] + value.replace(/^\.\//, "");
}

export function youtubeId(url: string): { id: string; start: number } | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (!/^https?:$/.test(parsed.protocol)) return null;
  const host = parsed.hostname.replace(/^www\.|^m\./, "");
  let id = "";
  if (host === "youtu.be") id = parsed.pathname.slice(1).split("/")[0] ?? "";
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (parsed.pathname === "/watch") id = parsed.searchParams.get("v") ?? "";
    else {
      const m = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/);
      id = m?.[1] ?? "";
    }
  }
  if (!/^[\w-]{11}$/.test(id)) return null;
  const t = parsed.searchParams.get("t") ?? parsed.searchParams.get("start") ?? "";
  const start = /^\d+$/.test(t.replace(/s$/, "")) ? parseInt(t, 10) : 0;
  return { id, start };
}

/* ------------------------------------------------------------------ */
/* Inline parsing                                                      */
/* ------------------------------------------------------------------ */

const ESCAPABLE = /[\\`*_{}[\]()#+\-.!>~|<]/;
const isAlnum = (ch: string | undefined) => !!ch && /[\p{L}\p{N}]/u.test(ch);

interface LinkMatch {
  label: string;
  url: string;
  title: string;
  end: number;
}

/** Matches `[label](url "title")` starting at the `[` at index i. */
function matchLink(s: string, i: number): LinkMatch | null {
  let depth = 0;
  let j = i;
  for (; j < s.length; j++) {
    const ch = s[j];
    if (ch === "\\") j++;
    else if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) break;
    }
  }
  if (j >= s.length || s[j + 1] !== "(") return null;
  const label = s.slice(i + 1, j);
  let k = j + 2;
  let parens = 1;
  for (; k < s.length; k++) {
    const ch = s[k];
    if (ch === "\\") k++;
    else if (ch === "(") parens++;
    else if (ch === ")") {
      parens--;
      if (parens === 0) break;
    }
  }
  if (k >= s.length) return null;
  const inner = s.slice(j + 2, k).trim();
  const m = inner.match(/^(<[^>]*>|\S+)(?:\s+(?:"([^"]*)"|'([^']*)'))?$/);
  if (!m) return null;
  const rawUrl = m[1] ?? "";
  const url = rawUrl.startsWith("<") ? rawUrl.slice(1, -1) : rawUrl;
  return { label, url, title: m[2] ?? m[3] ?? "", end: k + 1 };
}

function closing(s: string, marker: string, from: number): number {
  let idx = from;
  while (true) {
    idx = s.indexOf(marker, idx);
    if (idx === -1) return -1;
    if (s[idx - 1] === "\\") {
      idx += 1;
      continue;
    }
    // A single-char marker must not be part of a longer run (e.g. `*` inside `**`).
    if (marker.length === 1 && (s[idx + 1] === marker || s[idx - 1] === marker)) {
      idx += 1;
      continue;
    }
    return idx;
  }
}

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push({ t: "text", v: buf });
      buf = "";
    }
  };
  let i = 0;
  while (i < s.length) {
    const ch = s[i] as string;
    const next = s[i + 1];

    if (ch === "\\" && next === "\n") {
      flush();
      out.push({ t: "br" });
      i += 2;
      continue;
    }
    if (ch === "\\" && next !== undefined && ESCAPABLE.test(next)) {
      buf += next;
      i += 2;
      continue;
    }
    if (ch === "\n") {
      if (buf.endsWith("  ")) {
        buf = buf.replace(/ +$/, "");
        flush();
        out.push({ t: "br" });
      } else {
        buf = buf.replace(/ +$/, "") + " ";
      }
      i += 1;
      continue;
    }
    if (ch === "`") {
      const end = s.indexOf("`", i + 1);
      if (end > i + 1) {
        flush();
        out.push({ t: "code", v: s.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (ch === "!" && next === "[") {
      const m = matchLink(s, i + 1);
      if (m) {
        flush();
        out.push({ t: "img", src: m.url, alt: m.label });
        i = m.end;
        continue;
      }
    }
    if (ch === "[") {
      const m = matchLink(s, i);
      if (m) {
        flush();
        out.push({ t: "link", href: m.url, c: parseInline(m.label) });
        i = m.end;
        continue;
      }
    }
    if (ch === "<") {
      const m = s.slice(i).match(/^<(https?:\/\/[^\s<>]+)>/);
      if (m?.[1]) {
        flush();
        out.push({ t: "link", href: m[1], c: [{ t: "text", v: m[1] }] });
        i += m[0].length;
        continue;
      }
    }
    if ((ch === "*" || ch === "_" || ch === "~") && next === ch) {
      const marker = ch + ch;
      const end = closing(s, marker, i + 2);
      const inner = end > -1 ? s.slice(i + 2, end) : "";
      const intraword = ch === "_" && isAlnum(s[i - 1]);
      if (end > -1 && inner.trim() && !/^\s/.test(inner) && !intraword) {
        flush();
        out.push({ t: ch === "~" ? "del" : "strong", c: parseInline(inner) });
        i = end + 2;
        continue;
      }
    }
    if (ch === "*" || ch === "_") {
      const end = closing(s, ch, i + 1);
      const inner = end > -1 ? s.slice(i + 1, end) : "";
      const intraword = ch === "_" && (isAlnum(s[i - 1]) || isAlnum(s[end + 1]));
      if (end > -1 && inner.trim() && !/^\s/.test(inner) && !/\s$/.test(inner) && !intraword) {
        flush();
        out.push({ t: "em", c: parseInline(inner) });
        i = end + 1;
        continue;
      }
    }
    if ((ch === "h" || ch === "H") && /^https?:\/\//i.test(s.slice(i, i + 8)) && !isAlnum(s[i - 1])) {
      const m = s.slice(i).match(/^https?:\/\/[^\s<>]+/i);
      if (m) {
        const url = m[0].replace(/[.,;:!?'")\]]+$/, "");
        flush();
        out.push({ t: "link", href: url, c: [{ t: "text", v: url }] });
        i += url.length;
        continue;
      }
    }
    buf += ch;
    i += 1;
  }
  flush();
  return out;
}

export function inlineText(nodes: Inline[]): string {
  return nodes
    .map((n) => {
      switch (n.t) {
        case "text":
        case "code":
          return n.v;
        case "img":
          return "";
        case "br":
          return " ";
        default:
          return inlineText(n.c);
      }
    })
    .join("");
}

/* ------------------------------------------------------------------ */
/* Block parsing                                                       */
/* ------------------------------------------------------------------ */

const LIST_RE = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const FENCE_RE = /^\s{0,3}(```+|~~~+)\s*([\w+-]*)/;
const HEADING_RE = /^\s{0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;
const HR_RE = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const QUOTE_RE = /^\s{0,3}>/;
const DIRECTIVE_RE = /^\s*::(youtube|audio|pdf)\[([^\]]*)\](?:\{(.*)\})?\s*$/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/;

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

function parseAttrs(raw: string | undefined): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (!raw) return attrs;
  for (const m of raw.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g)) {
    const key = m[1];
    if (key) attrs[key] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return attrs;
}

function splitRow(line: string): string[] {
  let row = line.trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|") && !row.endsWith("\\|")) row = row.slice(0, -1);
  const cells: string[] = [];
  let cur = "";
  for (let i = 0; i < row.length; i++) {
    if (row[i] === "\\" && row[i + 1] === "|") {
      cur += "|";
      i++;
    } else if (row[i] === "|") {
      cells.push(cur.trim());
      cur = "";
    } else cur += row[i];
  }
  cells.push(cur.trim());
  return cells;
}

const indentOf = (line: string) => (line.match(/^\s*/)?.[0] ?? "").replace(/\t/g, "    ").length;
const isBlank = (line: string | undefined) => line === undefined || line.trim() === "";

function startsBlock(line: string, nextLine: string | undefined): boolean {
  return (
    FENCE_RE.test(line) ||
    HEADING_RE.test(line) ||
    HR_RE.test(line) ||
    QUOTE_RE.test(line) ||
    DIRECTIVE_RE.test(line) ||
    LIST_RE.test(line) ||
    (line.includes("|") && nextLine !== undefined && TABLE_SEP_RE.test(nextLine) && nextLine.includes("-"))
  );
}

interface Ctx {
  ids: Map<string, number>;
}

function uniqueId(ctx: Ctx, text: string): string {
  const base = slugify(text);
  const seen = ctx.ids.get(base) ?? 0;
  ctx.ids.set(base, seen + 1);
  return seen === 0 ? base : `${base}-${seen}`;
}

function figureFrom(line: string): Block | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("![")) return null;
  const m = matchLink(trimmed, 1);
  if (!m || m.end !== trimmed.length) return null;
  const src = resolveAsset("image", m.url);
  if (!src) return null;
  return { t: "figure", src, alt: m.label, caption: m.title };
}

function blocksFromLines(lines: string[], ctx: Ctx): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] as string;
    if (isBlank(line)) {
      i++;
      continue;
    }

    const fence = line.match(FENCE_RE);
    if (fence?.[1]) {
      const marker = fence[1];
      const body: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] as string).trim().startsWith(marker)) {
        body.push(lines[i] as string);
        i++;
      }
      i++;
      blocks.push({ t: "code", lang: fence[2] ?? "", v: body.join("\n") });
      continue;
    }

    const directive = line.match(DIRECTIVE_RE);
    if (directive) {
      const kind = directive[1];
      const target = (directive[2] ?? "").trim();
      const attrs = parseAttrs(directive[3]);
      i++;
      if (kind === "youtube") {
        const yt = youtubeId(target);
        if (yt) {
          blocks.push({
            t: "youtube",
            id: yt.id,
            start: yt.start,
            caption: attrs["caption"] ?? "",
            title: attrs["title"] ?? "YouTube video",
          });
        }
      } else if (kind === "audio") {
        const src = resolveAsset("audio", target);
        if (src) blocks.push({ t: "audio", src, title: attrs["title"] ?? "", caption: attrs["caption"] ?? "" });
      } else if (kind === "pdf") {
        const src = resolveAsset("document", target);
        if (src) {
          blocks.push({
            t: "pdf",
            src,
            title: attrs["title"] ?? (src.split("/").pop() ?? "PDF document"),
            embed: attrs["embed"] === "true",
          });
        }
      }
      continue;
    }

    const heading = line.match(HEADING_RE);
    if (heading?.[1]) {
      const c = parseInline(heading[2] ?? "");
      blocks.push({ t: "heading", level: heading[1].length, id: uniqueId(ctx, inlineText(c)), c });
      i++;
      continue;
    }

    if (HR_RE.test(line)) {
      blocks.push({ t: "hr" });
      i++;
      continue;
    }

    if (QUOTE_RE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length && QUOTE_RE.test(lines[i] as string)) {
        inner.push((lines[i] as string).replace(/^\s{0,3}>\s?/, ""));
        i++;
      }
      blocks.push({ t: "quote", c: blocksFromLines(inner, ctx) });
      continue;
    }

    const listMatch = line.match(LIST_RE);
    if (listMatch) {
      const baseIndent = indentOf(line);
      const ordered = /\d/.test(listMatch[2] ?? "");
      const start = ordered ? parseInt(listMatch[2] ?? "1", 10) : 1;
      const items: ListItem[] = [];
      while (i < lines.length) {
        const cur = lines[i] as string;
        const m = cur.match(LIST_RE);
        if (!m || indentOf(cur) !== baseIndent || /\d/.test(m[2] ?? "") !== ordered) break;
        let text = m[3] ?? "";
        const sub: string[] = [];
        i++;
        while (i < lines.length) {
          const l = lines[i] as string;
          if (isBlank(l)) {
            // A blank line continues the item only if the next content is indented deeper.
            let k = i + 1;
            while (k < lines.length && isBlank(lines[k])) k++;
            if (k < lines.length && indentOf(lines[k] as string) > baseIndent) {
              sub.push("");
              i++;
              continue;
            }
            break;
          }
          if (indentOf(l) > baseIndent) {
            sub.push(l.replace(new RegExp(`^\\s{0,${baseIndent + 2}}`), ""));
            i++;
            continue;
          }
          if (sub.length === 0 && !startsBlock(l, lines[i + 1])) {
            text += "\n" + l.trim();
            i++;
            continue;
          }
          break;
        }
        items.push({ c: parseInline(text), children: blocksFromLines(sub, ctx) });
        // Skip blank lines between items of the same list.
        let k = i;
        while (k < lines.length && isBlank(lines[k])) k++;
        const peek = lines[k];
        const pm = peek?.match(LIST_RE);
        if (k > i && peek && pm && indentOf(peek) === baseIndent && /\d/.test(pm[2] ?? "") === ordered) i = k;
      }
      blocks.push({ t: "list", ordered, start, items });
      continue;
    }

    const nextLine = lines[i + 1];
    if (line.includes("|") && nextLine !== undefined && nextLine.includes("-") && TABLE_SEP_RE.test(nextLine)) {
      const head = splitRow(line).map(parseInline);
      const align = splitRow(nextLine).map((cell) => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        return left && right ? "center" : right ? "right" : left ? "left" : null;
      });
      const rows: Inline[][][] = [];
      i += 2;
      while (i < lines.length && !isBlank(lines[i]) && (lines[i] as string).includes("|")) {
        rows.push(splitRow(lines[i] as string).map(parseInline));
        i++;
      }
      blocks.push({ t: "table", head, align, rows });
      continue;
    }

    // Paragraph (or a run of standalone images / a lone YouTube link).
    const para: string[] = [];
    while (i < lines.length && !isBlank(lines[i])) {
      const l = lines[i] as string;
      if (para.length > 0 && startsBlock(l, lines[i + 1])) break;
      para.push(l);
      i++;
    }
    const figures = para.map(figureFrom);
    if (figures.every((f): f is Block => f !== null)) {
      blocks.push(...figures);
      continue;
    }
    if (para.length === 1) {
      const only = parseInline((para[0] as string).trim());
      const first = only[0];
      if (only.length === 1 && first && first.t === "link") {
        const yt = youtubeId(first.href);
        const bare = inlineText(first.c) === first.href;
        if (yt && bare) {
          blocks.push({ t: "youtube", id: yt.id, start: yt.start, caption: "", title: "YouTube video" });
          continue;
        }
      }
    }
    blocks.push({ t: "p", c: parseInline(para.join("\n")) });
  }
  return blocks;
}

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n");
  return blocksFromLines(lines, { ids: new Map() });
}

/** Plain text of a document, used for excerpts and reading time. */
export function blocksText(blocks: Block[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    switch (b.t) {
      case "heading":
      case "p":
        parts.push(inlineText(b.c));
        break;
      case "quote":
        parts.push(blocksText(b.c));
        break;
      case "list":
        for (const item of b.items) parts.push(inlineText(item.c), blocksText(item.children));
        break;
      case "table":
        for (const row of b.rows) for (const cell of row) parts.push(inlineText(cell));
        break;
      default:
        break;
    }
  }
  return parts.filter(Boolean).join(" ");
}
