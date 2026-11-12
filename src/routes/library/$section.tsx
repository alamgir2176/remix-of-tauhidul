import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { ExternalCard } from "@/components/content-cards";
import { getExternalItems } from "@/lib/content";
import { EXTERNAL_SECTIONS, findExternalSection } from "@/lib/content-utils";
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
  const items = getExternalItems(section);
  return (
    <PageShell>
      <PageIntro label={section.title} title={section.title}>{section.blurb}</PageIntro>
      <section className="page-section" aria-label={section.title}>
        {items.length > 0 ? (
          <div className="card-grid">{items.map((item, i) => <ExternalCard key={`${item.url}-${i}`} item={item} kind={section.singular} />)}</div>
        ) : (
          <EmptyState title={`No ${section.title.toLowerCase()} yet.`}>Entries will appear here as soon as they are added.</EmptyState>
        )}
        <nav className="section-switch" aria-label="Other sections">
          {EXTERNAL_SECTIONS.filter((s) => s.slug !== section.slug).map((s) => (
            <Link key={s.slug} to="/library/$section" params={{ section: s.slug }}>{s.title}</Link>
          ))}
        </nav>
      </section>
    </PageShell>
  );
}
