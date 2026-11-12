/**
 * Loads everything under the repository's top-level `content/` folder at build time.
 *
 * Add, edit or delete files in `content/` and redeploy: no source code needs to change.
 * Folders and file names are described in `content/README.md`.
 */
import {
  EXTERNAL_SECTIONS,
  buildPosts,
  groupPhotos,
  normalizeDocuments,
  normalizeExternal,
  normalizePhotos,
  type DocumentItem,
  type ExternalItem,
  type ExternalSection,
  type Photo,
  type PhotoGroup,
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

export function getPhotos(): Photo[] {
  return normalizePhotos(jsonAt("activities.json"));
}

export function getPhotoGroups(): PhotoGroup[] {
  return groupPhotos(getPhotos());
}

export interface DirectoryEntry {
  key: string;
  title: string;
  blurb: string;
  count: number;
  to: "/writings" | "/library/$section" | "/notices" | "/activities";
  params?: { section: string };
  hash?: string;
}

/** One entry per website section, used by the homepage and the /library index. */
export function getDirectory(): DirectoryEntry[] {
  return [
    {
      key: "writings",
      title: "Blog & personal writings",
      blurb: "Original essays and reflections, published here.",
      count: posts.length,
      to: "/writings",
    },
    ...EXTERNAL_SECTIONS.map(
      (section): DirectoryEntry => ({
        key: section.slug,
        title: section.title,
        blurb: section.blurb,
        count: getExternalItems(section).length,
        to: "/library/$section",
        params: { section: section.slug },
      }),
    ),
    {
      key: "notices",
      title: "Notices",
      blurb: "Official notices, available as PDF downloads.",
      count: getNotices().length,
      to: "/notices",
      hash: "notices",
    },
    {
      key: "press-releases",
      title: "Press releases",
      blurb: "Press releases, available as PDF downloads.",
      count: getPressReleases().length,
      to: "/notices",
      hash: "press-releases",
    },
    {
      key: "activities",
      title: "Activities",
      blurb: "Photographs from events and activities.",
      count: getPhotos().length,
      to: "/activities",
    },
  ];
}
