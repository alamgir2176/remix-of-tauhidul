import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Link2 } from "lucide-react";
import { MarkdownView } from "@/components/markdown-view";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { CiteBox } from "@/components/cite-box";
import { ReaderTools } from "@/components/reader-tools";
import { getPost, getPosts, getSeries } from "@/lib/content";
import { absoluteUrl, bengaliFontLink, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/writings/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { slug: post.slug };
  },
  head: ({ loaderData }) => {
    const post = loaderData ? getPost(loaderData.slug) : undefined;
    if (!post) return { meta: [{ title: "Writing — Md Tauhidul Islam" }], links: [bengaliFontLink] };
    return pageMeta({
      title: `${post.title} — Md Tauhidul Islam`,
      description: post.excerpt,
      path: `/writings/${post.slug}`,
      type: "article",
      ...(post.cover ? { image: post.cover } : {}),
    });
  },
  component: ArticlePage,
});

function CopyLink({ slug, title }: { slug: string; title: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function share() {
    const url = absoluteUrl(`/writings/${slug}`) ?? window.location.href;
    try {
      if (typeof navigator.share === "function" && window.matchMedia("(max-width: 768px)").matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2500);
  }
  return (
    <button type="button" onClick={share} className="reader-share">
      <Link2 aria-hidden="true" />
      <span role="status">{state === "copied" ? "Link copied" : state === "failed" ? "Copy the address bar link" : "Share this article"}</span>
    </button>
  );
}

function ArticlePage() {
  const { slug } = Route.useLoaderData();
  const post = getPost(slug);
  if (!post) return null;
  const series = getSeries(post.series);
  const at = series.findIndex((p) => p.slug === post.slug);
  const before = at > 0 ? series[at - 1] : undefined;
  const after = at >= 0 ? series[at + 1] : undefined;
  // Up to three other articles, those sharing a tag first, then the newest.
  const shared = (p: { tags: string[] }) => p.tags.filter((t) => post.tags.includes(t)).length;
  const next = getPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p, i) => ({ p, i }))
    .sort((a, b) => shared(b.p) - shared(a.p) || a.i - b.i)
    .slice(0, 3)
    .map(({ p }) => p);
  return (
    <div id="top" className="reader">
      <SiteHeader active="library" />
      <main id="main" tabIndex={-1}>
        <article className="reader-article">
          <header className="reader-head">
            <Link to="/writings" className="reader-back"><ArrowLeft aria-hidden="true" /> All writings</Link>
            <p className="micro-label">{[post.dateLabel, `${post.readingMinutes} min read`].filter(Boolean).join(" · ")}</p>
            {series.length > 1 && <p className="reader-series">{post.series}: part {at + 1} of {series.length}</p>}
            <h1>{post.title}</h1>
            {post.excerpt && <p className="reader-lede">{post.excerpt}</p>}
            {post.note && <p className="reader-note"><span>About this article</span>{post.note}</p>}
            {post.tags.length > 0 && <ul className="reader-tags">{post.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
            <ReaderTools />
          </header>
          {post.cover && (
            <figure className="reader-cover">
              <img src={post.cover} alt={post.coverAlt} fetchPriority="high" decoding="async" />
            </figure>
          )}
          <MarkdownView blocks={post.blocks} />
          {(before || after) && (
            <nav className="series-nav" aria-label={`More from ${post.series}`}>
              {before ? <Link to="/writings/$slug" params={{ slug: before.slug }}><span>Previous in the series</span>{before.title}</Link> : <span />}
              {after ? <Link to="/writings/$slug" params={{ slug: after.slug }} className="is-next"><span>Next in the series</span>{after.title}</Link> : <span />}
            </nav>
          )}
          <footer className="reader-foot">
            <CopyLink slug={post.slug} title={post.title} />
            <CiteBox title={post.title} date={post.date} url={absoluteUrl(`/writings/${post.slug}`) ?? (typeof window !== "undefined" ? window.location.href : "")} />
            <div className="reader-foot-links">
              <Link to="/writings"><ArrowLeft aria-hidden="true" /> Back to all writings</Link>
              <Link to="/">Back to the main website</Link>
            </div>
          </footer>
        </article>
        {next.length > 0 && (
          <aside className="read-next" aria-labelledby="read-next-title">
            <h2 id="read-next-title" className="micro-label">Keep reading</h2>
            <ul>
              {next.map((p) => (
                <li key={p.slug}>
                  <Link to="/writings/$slug" params={{ slug: p.slug }}>
                    {p.cover && <img src={p.cover} alt="" loading="lazy" decoding="async" />}
                    <span className="read-next-text">
                      <span className="read-next-meta">{[p.dateLabel, `${p.readingMinutes} min read`].filter(Boolean).join(" · ")}</span>
                      <strong>{p.title}</strong>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
