import { createFileRoute } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { PortalPage } from "@/components/portal";
import { TypeChips } from "@/components/type-chips";
import { getFeed } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/library/")({
  head: () =>
    pageMeta({
      title: "Writing & Work — Md Tauhidul Islam",
      description:
        "Writings, projects, books, research, articles, editorials, opinion pieces, talk shows and seminars.",
      path: "/library",
    }),
  component: LibraryPage,
});

function LibraryPage() {
  const { t, lang } = useI18n();
  const feed = getFeed(lang);
  return (
    <PageShell>
      <PageIntro number="02" label="Writing & work" title="Ideas, set down" accent="on the page.">
        Blog posts, projects, books, research, articles, editorials, opinion pieces, talk shows and
        seminars.
      </PageIntro>
      <section className="page-section" aria-label={t("All writing and work")}>
        <TypeChips active="all" />
        {feed.length > 0 ? (
          <PortalPage items={feed} />
        ) : (
          <EmptyState icon={<PenLine />} title="Nothing published yet.">
            Writings, projects, books and talks will appear here.
          </EmptyState>
        )}
      </section>
    </PageShell>
  );
}
