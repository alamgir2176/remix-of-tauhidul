import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { getAnnouncements, getFeed, getPhotos, getPosts, getQuotations } from "@/lib/content";
import { useI18n, type Lang } from "@/lib/i18n";
import { blocksText } from "@/lib/markdown";
import { applyTheme, type ThemeId } from "@/lib/theme";

interface Entry {
  id: string;
  title: string;
  kind: string;
  desc: string;
  /** Extra searchable text (an article's full text, for example). */
  text: string;
  to?: string;
  params?: Record<string, string>;
  hash?: string;
  href?: string;
  theme?: ThemeId;
  /** Untranslated kind, for grouping logic. */
  group?: string;
}

const PAGES: Entry[] = [
  { id: "p-home", kind: "Page", title: "Home", desc: "The start of this website", text: "", to: "/" },
  { id: "p-library", kind: "Page", title: "Writing & work", desc: "Articles, projects, books, research and more", text: "blog library", to: "/library" },
  { id: "p-writings", kind: "Page", title: "Writings", desc: "Essays and reflections on this site", text: "blog articles", to: "/writings" },
  { id: "p-notices", kind: "Page", title: "Updates", desc: "Notices, news and press releases", text: "announcements", to: "/notices" },
  { id: "p-activities", kind: "Page", title: "Activities & gallery", desc: "Photographs from events and the field", text: "photos pictures", to: "/activities" },
  { id: "p-quotations", kind: "Page", title: "Quotations", desc: "Lines worth keeping", text: "quotes", to: "/quotations" },
  { id: "p-now", kind: "Page", title: "Now", desc: "What I am up to at the moment", text: "currently reading", to: "/now" },
  { id: "p-media", kind: "Page", title: "Media kit", desc: "Biography and photograph for organisers and editors", text: "press bio", to: "/media" },
  { id: "p-contact", kind: "Page", title: "Contact", desc: "Send a message", text: "get in touch", to: "/", hash: "contact" },
  { id: "p-cv", kind: "Page", title: "Request my CV", desc: "Ask for a copy of the CV", text: "resume", to: "/", hash: "request-cv" },
  { id: "a-minimal", kind: "Action", title: "Switch to the Minimal theme", desc: "Light, calm and paper-like", text: "light theme appearance", theme: "minimal" },
  { id: "a-dark", kind: "Action", title: "Switch to the Dark theme", desc: "Easy on the eyes at night", text: "night theme appearance", theme: "dark" },
  { id: "a-colorful", kind: "Action", title: "Switch to the Colorful theme", desc: "Warmer, brighter colours", text: "colourful theme appearance", theme: "colorful" },
];

/** Lower-case and drop Latin accents; Bengali letters and vowel signs are kept as they are. */
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

function buildEntries(lang: Lang, t: (s: string) => string): Entry[] {
  // Pages and actions are searchable by their English name too, so "home" works in Bengali mode.
  const out: Entry[] = PAGES.map((e) => ({ ...e, group: e.kind, kind: t(e.kind), title: t(e.title), desc: t(e.desc), text: `${e.text} ${e.title} ${e.desc}` }));
  for (const p of getPosts(lang)) {
    out.push({ id: `w-${p.slug}`, kind: t("Writing"), title: p.title, desc: p.excerpt, text: `${p.tags.join(" ")} ${blocksText(p.blocks)}`, to: "/writings/$slug", params: { slug: p.slug } });
  }
  for (const item of getFeed(lang)) {
    if (item.slug) continue;
    out.push({ id: `f-${item.key}`, kind: t(item.type), title: t(item.title), desc: t(item.description), text: "", ...(item.url ? { href: item.url } : { to: "/library" }) });
  }
  for (const a of getAnnouncements()) {
    out.push({ id: `n-${a.title}-${a.date}`, kind: t("Update"), title: t(a.title), desc: t(a.description), text: a.dateLabel, ...(a.pdf ? { href: a.pdf } : { to: "/notices" }) });
  }
  getQuotations().forEach((q, i) => out.push({ id: `q-${i}`, kind: t("Quotation"), title: t(q.text), desc: t(q.source), text: q.note, to: "/quotations" }));
  for (const ph of getPhotos()) {
    out.push({ id: `ph-${ph.image}`, kind: t("Photo"), title: t(ph.caption || ph.activity || "Photograph"), desc: [t(ph.activity), ph.dateLabel, t(ph.location)].filter(Boolean).join(" · "), text: ph.alt, to: "/activities" });
  }
  return out;
}

interface Hit { entry: Entry; snippet: string }

function search(entries: Entry[], query: string): Hit[] {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return entries.filter((e) => e.group === "Page" || e.group === "Action").map((entry) => ({ entry, snippet: entry.desc }));
  const hits: { hit: Hit; score: number }[] = [];
  for (const entry of entries) {
    const title = norm(entry.title);
    const desc = norm(entry.desc);
    const text = norm(entry.text);
    const kind = norm(entry.kind);
    let score = 0;
    let matched = true;
    let snippet = entry.desc;
    for (const t of tokens) {
      let s = 0;
      if (title.startsWith(t)) s += 9; else if (title.includes(` ${t}`)) s += 7; else if (title.includes(t)) s += 5;
      if (kind.startsWith(t)) s += 3;
      if (desc.includes(t)) s += 3;
      if (text.includes(t)) {
        s += 1;
        if (!title.includes(t) && !desc.includes(t)) {
          const at = text.indexOf(t);
          const from = Math.max(0, at - 50);
          snippet = `${from > 0 ? "…" : ""}${entry.text.slice(from, from + 130).trim()}…`;
        }
      }
      if (s === 0) { matched = false; break; }
      score += s;
    }
    if (matched) hits.push({ hit: { entry, snippet }, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.hit.entry.title.localeCompare(b.hit.entry.title)).slice(0, 30).map((h) => h.hit);
}

export default function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const entries = useMemo(() => buildEntries(lang, t), [lang, t]);
  const hits = useMemo(() => search(entries, query), [entries, query]);

  useEffect(() => { input.current?.focus(); document.documentElement.classList.add("search-open"); return () => document.documentElement.classList.remove("search-open"); }, []);
  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => { list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" }); }, [active]);

  function choose(hit: Hit | undefined) {
    if (!hit) return;
    const e = hit.entry;
    onClose();
    if (e.theme) { applyTheme(e.theme); return; }
    if (e.href) { if (e.href.startsWith("/")) window.location.assign(e.href); else window.open(e.href, "_blank", "noopener,noreferrer"); return; }
    if (e.to) void router.navigate({ to: e.to, ...(e.params ? { params: e.params } : {}), ...(e.hash ? { hash: e.hash } : {}) } as never);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(hits.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(hits[active]); }
    else if (e.key === "Tab") { e.preventDefault(); }
  }

  let lastKind = "";
  return (
    <div className="sp" role="dialog" aria-modal="true" aria-label={t("Search this website")} onKeyDown={onKeyDown}>
      <div className="sp-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sp-panel">
        <div className="sp-field">
          <Search aria-hidden="true" />
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Search writing, updates, photos, quotations…")}
            role="combobox"
            aria-expanded="true"
            aria-controls="sp-list"
            aria-activedescendant={hits[active] ? `sp-opt-${active}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          <kbd aria-hidden="true">Esc</kbd>
        </div>
        <ul id="sp-list" ref={list} role="listbox" aria-label={t("Results")} className="sp-list">
          {hits.map((hit, i) => {
            const showKind = hit.entry.kind !== lastKind;
            lastKind = hit.entry.kind;
            return (
              <li key={hit.entry.id} role="presentation">
                {showKind && <span className="sp-kind" aria-hidden="true">{hit.entry.kind}</span>}
                <div id={`sp-opt-${i}`} data-index={i} role="option" aria-selected={i === active} className="sp-item" onMouseMove={() => setActive(i)} onClick={() => choose(hit)}>
                  <strong>{hit.entry.title.length > 90 ? `${hit.entry.title.slice(0, 90)}…` : hit.entry.title}</strong>
                  {hit.snippet && <span>{hit.snippet}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        {hits.length === 0 && <p className="sp-empty" role="status">{t("Nothing found for “{query}”. Try a shorter word.", { query })}</p>}
        <p className="sp-hint" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> {t("to move")}</span><span><kbd>Enter</kbd> {t("to open")}</span></p>
      </div>
    </div>
  );
}
