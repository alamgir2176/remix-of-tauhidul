import { createFileRoute, notFound } from "@tanstack/react-router";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { FeedCard } from "@/components/content-cards";
import { TypeChips } from "@/components/type-chips";
import { getSectionFeed } from "@/lib/content";
import { findExternalSection } from "@/lib/content-utils";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/library/$section")({
  loader: ({ params }) => {
    const section = findExternalSection(params.section);
    if (!section) throw notFound();
    return { slug: section.slug };
  },
  head: ({ loaderData }) => {
    const section = loaderData ? findExternalSection(loaderData.slug) : undefined;
    return pageMeta({
      title: `${section?.title ?? "Library"} — Md Tauhidul Islam`,
      description: section?.blurb ?? "Work by Md Tauhidul Islam.",
      path: `/library/${section?.slug ?? ""}`,
    });
  },
  component: SectionPage,
});

function SectionPage() {
  const { slug } = Route.useLoaderData();
  const section = findExternalSection(slug);
  if (!section) return null;
  const items = getSectionFeed(section);
  return (
    <PageShell>
      <PageIntro number="04" label={section.title} title={section.title}>{section.blurb}</PageIntro>
      <section className="page-section" aria-label={section.title}>
        <TypeChips active={section.slug} />
        {items.length > 0 ? (
          <div className="card-grid">{items.map((item) => <FeedCard key={item.key} item={item} />)}</div>
        ) : (
          <EmptyState title={`No ${section.title.toLowerCase()} yet.`}>Entries will appear here as soon as they are added.</EmptyState>
        )}
      </section>
    </PageShell>
  );
}
