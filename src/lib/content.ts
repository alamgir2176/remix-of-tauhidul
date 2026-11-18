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

const markdownFiles = import.meta.glob("/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// Files and folders starting with "_" (such as content/_examples) are templates and never published.
const jsonFiles = import.meta.glob(["/content/**/*.json", "!/content/_*/**"], {
  import: "default",
  eager: true,
}) as Record<string, unknown>;

const posts: Post[] = buildPosts(markdownFiles);

function jsonAt(path: string): unknown {
  return jsonFiles[`/content/${path}`];
}

export function getPosts(): Post[] {
  return posts;
}

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
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
export function getFeed(): FeedItem[] {
  const feed: FeedItem[] = posts.map((post) => ({
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
export function getSeries(name: string): Post[] {
  if (!name) return [];
  return posts.filter((p) => p.series === name).sort((a, b) => a.part - b.part || dateValue(a.date) - dateValue(b.date));
}
