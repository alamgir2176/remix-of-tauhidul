import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { DocumentList } from "@/components/content-cards";
import { getNotices, getPressReleases } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/notices")({
  head: () =>
    pageMeta({
      title: "Notices & Press Releases — Md Tauhidul Islam",
      description: "Official notices and press releases, each available as a PDF download.",
      path: "/notices",
    }),
  component: NoticesPage,
});

function NoticesPage() {
  const notices = getNotices();
  const releases = getPressReleases();
  return (
    <PageShell>
      <PageIntro number="05" label="Notices & press releases" title="Official" accent="announcements.">
        Each entry can be downloaded as a PDF.
      </PageIntro>
      <section className="page-section" id="notices" aria-labelledby="notices-title">
        <h2 id="notices-title" className="page-section-title">Notices</h2>
        {notices.length > 0 ? <DocumentList items={notices} /> : <EmptyState title="No notices yet.">New notices will be listed here.</EmptyState>}
      </section>
      <section className="page-section" id="press-releases" aria-labelledby="press-title">
        <h2 id="press-title" className="page-section-title">Press releases</h2>
        {releases.length > 0 ? <DocumentList items={releases} /> : <EmptyState title="No press releases yet.">New press releases will be listed here.</EmptyState>}
      </section>
    </PageShell>
  );
}
