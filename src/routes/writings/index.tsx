import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { FeedCard } from "@/components/content-cards";
import { TypeChips } from "@/components/type-chips";
import { getFeed } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/writings/")({
  head: () =>
    pageMeta({
      title: "Writings — Md Tauhidul Islam",
      description: "Original essays, articles and personal writings by Md Tauhidul Islam.",
      path: "/writings",
    }),
  component: WritingsPage,
});

function WritingsPage() {
  const posts = getFeed().filter((item) => item.slug);
  return (
    <PageShell>
      <PageIntro number="04" label="Blog & personal writings" title="Thoughts, in" accent="my own words.">
        Essays and reflections published here, on my own website.
      </PageIntro>
      <section className="page-section" aria-label="Articles">
        <TypeChips active="blog" />
        {posts.length > 0 ? (
          <div className="card-grid">{posts.map((item) => <FeedCard key={item.key} item={item} />)}</div>
        ) : (
          <EmptyState title="No writings yet.">New essays and reflections will appear here once they are published.</EmptyState>
        )}
      </section>
    </PageShell>
  );
}
