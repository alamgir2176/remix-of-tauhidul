import { publicHomepage } from "@/lib/site-metadata";

const BENGALI_FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600&family=Noto+Sans+Bengali:wght@400;500;600&display=swap";

/** Bengali glyph fonts. Google serves them by unicode-range, so English-only pages never download them. */
export const bengaliFontLink = { rel: "stylesheet", href: BENGALI_FONTS } as const;

/** Used for link previews (WhatsApp, Facebook, X) on pages that have no picture of their own. */
export const DEFAULT_SHARE_IMAGE = "/share-card.jpg";

export function absoluteUrl(path: string): string | undefined {
  const origin = publicHomepage(import.meta.env["VITE_SITE_URL"]);
  return origin ? `${origin}${path.replace(/^\//, "")}` : undefined;
}

export function pageMeta(opts: { title: string; description: string; path: string; image?: string; type?: string }) {
  const url = absoluteUrl(opts.path);
  const shared = opts.image || DEFAULT_SHARE_IMAGE;
  const image = shared.startsWith("http") ? shared : absoluteUrl(shared);
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: opts.type ?? "website" },
      ...(url ? [{ property: "og:url", content: url }] : []),
      ...(image ? [{ property: "og:image", content: image }] : []),
      { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    ],
    links: [
      bengaliFontLink,
      ...(url ? [{ rel: "canonical", href: url }] : []),
    ],
  };
}
