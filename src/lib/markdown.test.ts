import { describe, expect, it } from "vitest";
import { buildPost, buildPosts, groupPhotos, normalizeDocuments, normalizeExternal, normalizePhotos, parseFrontmatter } from "./content-utils";
import { parseInline, parseMarkdown, resolveAsset, safeUrl, youtubeId } from "./markdown";

describe("markdown blocks", () => {
  it("parses headings, paragraphs, quotes and lists", () => {
    const blocks = parseMarkdown("## Title\n\nHello **bold** and *italic*.\n\n> Quote line\n\n- a\n- b\n  - nested\n\n1. one\n2. two");
    expect(blocks.map((b) => b.t)).toEqual(["heading", "p", "quote", "list", "list"]);
    const ul = blocks[3];
    expect(ul && ul.t === "list" && ul.items.length).toBe(2);
    expect(ul && ul.t === "list" && ul.items[1]?.children[0]?.t).toBe("list");
    const ol = blocks[4];
    expect(ol && ol.t === "list" && ol.ordered).toBe(true);
  });

  it("turns standalone images into captioned figures and resolves bare file names", () => {
    const blocks = parseMarkdown('![Alt text](photo.jpg "A caption")\n![Second](/images/blog/two.jpg)');
    expect(blocks).toEqual([
      { t: "figure", src: "/images/blog/photo.jpg", alt: "Alt text", caption: "A caption" },
      { t: "figure", src: "/images/blog/two.jpg", alt: "Second", caption: "" },
    ]);
  });

  it("supports YouTube, audio and PDF directives", () => {
    const blocks = parseMarkdown(
      '::youtube[https://youtu.be/dQw4w9WgXcQ?t=42]{caption="Demo"}\n\n::audio[talk.mp3]{title="Talk"}\n\n::pdf[paper.pdf]{title="Paper" embed="true"}',
    );
    expect(blocks[0]).toMatchObject({ t: "youtube", id: "dQw4w9WgXcQ", start: 42, caption: "Demo" });
    expect(blocks[1]).toMatchObject({ t: "audio", src: "/audio/talk.mp3", title: "Talk" });
    expect(blocks[2]).toMatchObject({ t: "pdf", src: "/documents/blog/paper.pdf", embed: true });
  });

  it("embeds a lone YouTube link", () => {
    const blocks = parseMarkdown("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(blocks[0]).toMatchObject({ t: "youtube", id: "dQw4w9WgXcQ" });
  });

  it("parses tables and code fences", () => {
    const blocks = parseMarkdown("| A | B |\n|---|:-:|\n| 1 | 2 |\n\n```js\nconst x = 1;\n```");
    expect(blocks[0]).toMatchObject({ t: "table", align: [null, "center"] });
    expect(blocks[1]).toMatchObject({ t: "code", lang: "js", v: "const x = 1;" });
  });

  it("keeps Bengali heading ids and de-duplicates them", () => {
    const blocks = parseMarkdown("## আমার কথা\n\n## আমার কথা");
    expect(blocks[0]).toMatchObject({ id: "আমার-কথা" });
    expect(blocks[1]).toMatchObject({ id: "আমার-কথা-1" });
  });
});

describe("markdown inline + safety", () => {
  it("parses links, bare urls and escapes", () => {
    const nodes = parseInline("See [site](https://example.com) or https://example.org. \\*not italic\\*");
    expect(nodes[1]).toMatchObject({ t: "link", href: "https://example.com" });
    expect(nodes[3]).toMatchObject({ t: "link", href: "https://example.org" });
    expect(nodes.at(-1)).toMatchObject({ t: "text" });
  });

  it("blocks unsafe schemes", () => {
    expect(safeUrl("javascript:alert(1)")).toBe("#");
    expect(safeUrl("data:text/html,x")).toBe("#");
    expect(safeUrl("https://a.b")).toBe("https://a.b");
    expect(safeUrl("/about")).toBe("/about");
    expect(resolveAsset("image", "javascript:alert(1)")).toBe("");
    expect(youtubeId("https://evil.example/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("never emits raw html", () => {
    const blocks = parseMarkdown("<script>alert(1)</script>");
    expect(blocks[0]).toMatchObject({ t: "p" });
  });
});

describe("content normalisation", () => {
  it("builds posts from frontmatter, skipping drafts and templates", () => {
    const raw = '---\ntitle: "Hello"\ndate: 2026-11-13\nexcerpt: Short one\ncover: cover.jpg\ntags: [a, b]\n---\n\n## Intro\n\nBody text here.';
    const post = buildPost("/content/blog/hello-world.md", raw);
    expect(post).toMatchObject({ slug: "hello-world", title: "Hello", excerpt: "Short one", cover: "/images/blog/cover.jpg", tags: ["a", "b"], dateLabel: "13 November 2026" });
    expect(buildPost("/content/blog/x.md", "---\ndraft: true\ntitle: X\n---\nbody")).toBeNull();
    const posts = buildPosts({
      "/content/blog/_template.md": "---\ntitle: T\n---\nx",
      "/content/blog/old.md": "---\ntitle: Old\ndate: 2025-01-01\n---\nx",
      "/content/blog/new.md": "---\ntitle: New\ndate: 2026-01-01\n---\nx",
    });
    expect(posts.map((p) => p.slug)).toEqual(["new", "old"]);
  });

  it("derives an excerpt when none is given", () => {
    const post = buildPost("/content/blog/a.md", "---\ntitle: A\n---\n" + "word ".repeat(100));
    expect(post?.excerpt.endsWith("…")).toBe(true);
  });

  it("parses frontmatter values", () => {
    expect(parseFrontmatter("---\na: 'x'\nb: true\n---\nbody").data).toEqual({ a: "x", b: true });
  });

  it("normalises external items and drops invalid ones", () => {
    const items = normalizeExternal([
      { title: "Good", url: "https://example.com/a", image: "t.jpg", category: "Journal", date: "2026-02-01" },
      { title: "No url" },
      { title: "Bad scheme", url: "javascript:alert(1)" },
      { title: "Hidden", url: "https://example.com/h", hidden: true },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ host: "example.com", image: "/images/external/t.jpg", category: "Journal" });
    expect(normalizeExternal({ items: [{ title: "T", url: "https://x.y" }] })).toHaveLength(1);
    expect(normalizeExternal(null)).toEqual([]);
  });

  it("normalises notices with pdf paths", () => {
    const docs = normalizeDocuments(
      [{ title: "B", date: "2026-01-01", pdf: "b.pdf" }, { title: "A", date: "2026-05-01", pdf: "/documents/other/a.pdf" }, { title: "C" }],
      "/documents/notices/",
    );
    expect(docs.map((d) => d.title)).toEqual(["A", "B", "C"]);
    expect(docs[1]?.pdf).toBe("/documents/notices/b.pdf");
    expect(docs[0]?.pdf).toBe("/documents/other/a.pdf");
    expect(docs[2]?.pdf).toBe("");
  });

  it("normalises and groups photos", () => {
    const photos = normalizePhotos([
      { image: "a.jpg", caption: "One", activity: "Theatre Festival", date: "2026-01-01" },
      { image: "b.jpg", caption: "Two", activity: "Blood Drive", date: "2026-03-01" },
      { image: "c.jpg", caption: "Three", activity: "Theatre Festival", date: "2026-01-02" },
      { caption: "no image" },
    ]);
    expect(photos).toHaveLength(3);
    expect(photos[0]?.image).toBe("/images/activities/a.jpg");
    const groups = groupPhotos(photos);
    expect(groups.map((g) => g.activity)).toEqual(["Blood Drive", "Theatre Festival"]);
    expect(groups[1]?.photos).toHaveLength(2);
  });
});
