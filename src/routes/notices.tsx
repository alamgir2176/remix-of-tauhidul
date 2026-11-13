import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { DocumentList } from "@/components/content-cards";
import { getAnnouncements } from "@/lib/content";
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
  const announcements = getAnnouncements();
  return (
    <PageShell>
      <PageIntro
        number="05"
        label="Notices & press releases"
        title="Official"
        accent="announcements."
      >
        Each entry can be downloaded as a PDF.
      </PageIntro>
      <section
        className="page-section announcements-page"
        id="notices"
        aria-labelledby="notices-title"
      >
        <div className="announcement-intro">
          <h2 id="notices-title" className="page-section-title">
            Latest announcements
          </h2>
          <p>Notices and press releases, together in one clear chronological record.</p>
        </div>
        {announcements.length > 0 ? (
          <DocumentList items={announcements} />
        ) : (
          <EmptyState kind="list" icon={<FileText />} title="No announcements yet.">
            New notices and press releases will be listed here.
          </EmptyState>
        )}
      </section>
    </PageShell>
  );
}
