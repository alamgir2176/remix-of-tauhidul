import { createFileRoute } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { FeedCard } from "@/components/content-cards";
import { TypeChips } from "@/components/type-chips";
import { getFeed } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/library/")({
  head: () =>
    pageMeta({
      title: "Writing & Work — Md Tauhidul Islam",
      description: "Writings, projects, books, research, articles, editorials, opinion pieces, talk shows and seminars.",
      path: "/library",
    }),
  component: LibraryPage,
});

function LibraryPage() {
  const feed = getFeed();
  return (
    <PageShell>
      <PageIntro number="04" label="Writing & work" title="Ideas, set down" accent="on the page.">
        Blog posts, projects, books, research, articles, editorials, opinion pieces, talk shows and seminars.
      </PageIntro>
      <section className="page-section" aria-label="All writing and work">
        <TypeChips active="all" />
        {feed.length > 0 ? (
          <div className="card-grid">{feed.map((item) => <FeedCard key={item.key} item={item} />)}</div>
        ) : (
          <EmptyState icon={<PenLine />} title="Nothing published yet.">Writings, projects, books and talks will appear here.</EmptyState>
        )}
      </section>
    </PageShell>
  );
}
