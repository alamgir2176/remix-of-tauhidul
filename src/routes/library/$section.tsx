import { createFileRoute, notFound } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { PortalPage } from "@/components/portal";
import { TypeChips } from "@/components/type-chips";
import { getSectionFeed } from "@/lib/content";
import { findExternalSection } from "@/lib/content-utils";
import { useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();
  const { slug } = Route.useLoaderData();
  const section = findExternalSection(slug);
  if (!section) return null;
  const items = getSectionFeed(section);
  return (
    <PageShell>
      <PageIntro number="02" label={section.title} title={section.title}>
        {section.blurb}
      </PageIntro>
      <section className="page-section" aria-label={t(section.title)}>
        <TypeChips active={section.slug} />
        {items.length > 0 ? (
          <PortalPage items={items} />
        ) : (
          <EmptyState icon={<PenLine />} title={t("No {name} yet.", { name: t(section.title).toLowerCase() })}>
            Entries will appear here as soon as they are added.
          </EmptyState>
        )}
      </section>
    </PageShell>
  );
}
