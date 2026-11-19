/**
 * Loads everything under the repository's top-level `content/` folder at build time.
 *
 * Add, edit or delete files in `content/` and redeploy: no source code needs to change.
 * Folders and file names are described in `content/README.md`.
 */
import {
  EXTERNAL_SECTIONS,
  buildPosts,
  dateValue,
  buildPost,
  slugFromPath,
  groupPhotos,
  normalizeDocuments,
  normalizeExternal,
  normalizeMedia,
  normalizeNow,
  normalizeQuotations,
  normalizePhotos,
  type DocumentItem,
  type ExternalItem,
  type ExternalSection,
  type MediaKit,
  type NowPage,
  type Photo,
  type PhotoGroup,
  type Quotation,
  type Post,
} from "./content-utils";
import type { Lang } from "./i18n";

const allMarkdown = import.meta.glob("/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// Files and folders starting with "_" (such as content/_examples) are templates and never published.
const jsonFiles = import.meta.glob(["/content/**/*.json", "!/content/_*/**", "!/content/i18n/**"], {
  import: "default",
  eager: true,
}) as Record<string, unknown>;

// "name.bn.md" / "name.en.md" are translations of "name.md": same article, other language.
const TRANSLATION = /\.(bn|en)\.md$/;
const markdownFiles: Record<string, string> = {};
const translationFiles: Record<Lang, Record<string, string>> = { en: {}, bn: {} };
for (const [path, raw] of Object.entries(allMarkdown)) {
  const m = TRANSLATION.exec(path);
  if (m) translationFiles[m[1] as Lang][path.replace(TRANSLATION, ".md")] = raw;
  else markdownFiles[path] = raw;
}

const posts: Post[] = buildPosts(markdownFiles);
const translatedPosts: Record<Lang, Post[]> = {
  en: applyTranslations("en"),
  bn: applyTranslations("bn"),
};

/** The article in the visitor's language where a translation file exists; otherwise the original, unchanged. */
function applyTranslations(lang: Lang): Post[] {
  const files = translationFiles[lang];
  return posts.map((post) => {
    const entry = Object.entries(files).find(([path]) => slugFromPath(path) === post.slug || buildPost(path, files[path] ?? "")?.slug === post.slug);
    if (!entry) return post;
    const tr = buildPost(entry[0], entry[1]);
    if (!tr) return post;
    return {
      ...post,
      title: tr.title,
      excerpt: tr.excerpt,
      blocks: tr.blocks,
      readingMinutes: tr.readingMinutes,
      coverAlt: tr.coverAlt === tr.title ? tr.title : tr.coverAlt,
      note: tr.note || post.note,
      tags: tr.tags.length > 0 ? tr.tags : post.tags,
    };
  });
}

function jsonAt(path: string): unknown {
  return jsonFiles[`/content/${path}`];
}

export function getPosts(lang: Lang = "en"): Post[] {
  return translatedPosts[lang];
}

export function getPost(slug: string, lang: Lang = "en"): Post | undefined {
  return translatedPosts[lang].find((p) => p.slug === slug);
}

export function getExternalItems(section: ExternalSection): ExternalItem[] {
  return normalizeExternal(jsonAt(`external/${section.slug}.json`));
}

export function getNotices(): DocumentItem[] {
  return normalizeDocuments(jsonAt("notices.json"), "/documents/notices/");
}

export function getPressReleases(): DocumentItem[] {
  return normalizeDocuments(jsonAt("press-releases.json"), "/documents/press-releases/");
}

export interface Announcement extends DocumentItem {
  kind: "Notice" | "Press release";
}

/** One editorial stream for official updates; the source files remain separate for content management. */
export function getAnnouncements(): Announcement[] {
  return [
    ...getNotices().map((item) => ({ ...item, kind: "Notice" as const })),
    ...getPressReleases().map((item) => ({ ...item, kind: "Press release" as const })),
  ]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => dateValue(b.item.date) - dateValue(a.item.date) || a.index - b.index)
    .map(({ item }) => item);
}

export function getPhotos(): Photo[] {
  return normalizePhotos(jsonAt("activities.json"));
}

export function getPhotoGroups(): PhotoGroup[] {
  return groupPhotos(getPhotos());
}

export interface FeedItem {
  key: string;
  /** Type tag shown on the card: Blog, Project, Book, ... */
  type: string;
  title: string;
  description: string;
  image: string;
  date: string;
  /** Blog posts open an article page on this website; everything else is an external link. */
  slug?: string;
  url?: string;
  featured: boolean;
}

export function getSectionFeed(section: ExternalSection): FeedItem[] {
  return getExternalItems(section).map((item, i) => ({
    key: `${section.slug}-${i}-${item.url}`,
    type: section.singular,
    title: item.title,
    description: item.description,
    image: item.image,
    date: item.date,
    url: item.url,
    featured: item.featured,
  }));
}

/** Blog posts and every external-link section in one list, newest first. */
export function getFeed(lang: Lang = "en"): FeedItem[] {
  const feed: FeedItem[] = translatedPosts[lang].map((post) => ({
    key: `post-${post.slug}`,
    type: "Blog",
    title: post.title,
    description: post.excerpt,
    image: post.cover,
    date: post.date,
    slug: post.slug,
    featured: post.featured,
  }));
  for (const section of EXTERNAL_SECTIONS) {
    getExternalItems(section).forEach((item, i) => {
      feed.push({
        key: `${section.slug}-${i}-${item.url}`,
        type: section.singular,
        title: item.title,
        description: item.description,
        image: item.image,
        date: item.date,
        url: item.url,
        featured: item.featured,
      });
    });
  }
  return feed
    .map((item, index) => ({ item, index }))
    .sort((a, b) => dateValue(b.item.date) - dateValue(a.item.date) || a.index - b.index)
    .map(({ item }) => item);
}

export function getQuotations(): Quotation[] {
  return normalizeQuotations(jsonAt("quotations.json"));
}

export function getNow(): NowPage {
  return normalizeNow(jsonAt("now.json"));
}

export function getMedia(): MediaKit {
  return normalizeMedia(jsonAt("media.json"));
}

/** The articles of one series, in reading order. */
export function getSeries(name: string, lang: Lang = "en"): Post[] {
  if (!name) return [];
  return translatedPosts[lang].filter((p) => p.series === name).sort((a, b) => a.part - b.part || dateValue(a.date) - dateValue(b.date));
}
