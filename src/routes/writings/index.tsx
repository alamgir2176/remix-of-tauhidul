import { createFileRoute } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
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
      <PageIntro
        number="04"
        label="Blog & personal writings"
        title="Thoughts, in"
        accent="my own words."
      >
        Essays and reflections published here, on my own website.
      </PageIntro>
      <section className="page-section" aria-label="Articles">
        <TypeChips active="blog" />
        {posts.length > 0 ? (
          <div className="editorial-feed editorial-feed-page">
            {posts.map((item, i) => (
              <div key={item.key} className={i === 0 ? "editorial-feature" : ""}>
                <FeedCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={<PenLine />} title="No writings yet.">
            New essays and reflections will appear here once they are published.
          </EmptyState>
        )}
      </section>
    </PageShell>
  );
}
