import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { getAnnouncements, getNow, getPhotos, getPosts, getQuotations } from "@/lib/content";

type Kind = "writing" | "line" | "now" | "photo" | "update";

interface Tile {
  kind: Kind;
  label: string;
  title: string;
  text: string;
  to: string;
  params?: Record<string, string>;
  image?: string;
  alt?: string;
}

const ORDER: Kind[] = ["writing", "line", "photo", "now", "update"];

/** Same input, same output: the server and the browser always agree, and a page never reshuffles itself. */
function seed(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

function build(kind: Kind, salt: number, skipSlug: string): Tile | null {
  switch (kind) {
    case "writing": {
      const posts = getPosts().filter((p) => p.slug !== skipSlug);
      const p = posts[salt % Math.max(1, posts.length)];
      return p ? { kind, label: "To read", title: p.title, text: clip(p.excerpt, 110), to: "/writings/$slug", params: { slug: p.slug }, ...(p.cover ? { image: p.cover, alt: "" } : {}) } : null;
    }
    case "line": {
      const q = getQuotations();
      const item = q[salt % Math.max(1, q.length)];
      return item ? { kind, label: "A line to keep", title: `“${clip(item.text.replace(/^[“"]|[”"]$/g, ""), 120)}”`, text: item.source, to: "/quotations" } : null;
    }
    case "photo": {
      const photos = getPhotos();
      const p = photos[salt % Math.max(1, photos.length)];
      return p ? { kind, label: "From the field", title: p.caption || p.activity || "A photograph", text: [p.activity, p.location].filter(Boolean).join(" · "), to: "/activities", image: p.image, alt: p.alt } : null;
    }
    case "now": {
      const n = getNow();
      const e = n.entries[salt % Math.max(1, n.entries.length)];
      return e ? { kind, label: "Right now", title: e.label, text: clip(e.text, 110), to: "/now" } : null;
    }
    case "update": {
      const a = getAnnouncements()[0];
      return a ? { kind, label: a.kind, title: a.title, text: a.dateLabel, to: "/notices" } : null;
    }
  }
}

/**
 * A quiet "what next" strip: three doors into other parts of the website, different from the page you are on.
 * The choice is fixed per page (not random), so nothing jumps around and nothing is tracked.
 */
export function KeepExploring({ page, skip = [], skipSlug = "", title = "Keep exploring" }: { page: string; skip?: Kind[]; skipSlug?: string; title?: string }) {
  const s = seed(page);
  const kinds = ORDER.filter((k) => !skip.includes(k));
  // Rotate the starting point per page so each page opens different doors.
  const rotated = kinds.map((_, i) => kinds[(i + s) % kinds.length]!);
  const tiles = rotated.map((k, i) => build(k, s + i, skipSlug)).filter((t): t is Tile => t !== null).slice(0, 3);
  if (tiles.length < 2) return null;
  return (
    <aside className="explore" aria-labelledby="explore-title">
      <h2 id="explore-title" className="micro-label">{title}</h2>
      <ul>
        {tiles.map((t) => (
          <li key={t.kind}>
            <Link to={t.to as never} params={t.params as never} className={t.image ? "has-image" : undefined}>
              {t.image && <img src={t.image} alt={t.alt ?? ""} loading="lazy" decoding="async" />}
              <span className="explore-kind">{t.label}</span>
              <strong className={t.kind === "line" ? "is-line" : undefined}>{t.title}</strong>
              {t.text && <span className="explore-text">{t.text}</span>}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
