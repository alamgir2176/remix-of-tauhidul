import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { DocumentList } from "@/components/content-cards";
import { getAnnouncements } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/notices")({
  head: () =>
    pageMeta({
      title: "Updates — Md Tauhidul Islam",
      description: "Notices, news, announcements and press releases from Md Tauhidul Islam, with PDF downloads where available.",
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
        label="Updates"
        title="Latest"
        accent="updates."
      >
        Notices, news and announcements, each available as a PDF where there is one.
      </PageIntro>
      <section
        className="page-section announcements-page"
        id="notices"
        aria-labelledby="notices-title"
      >
        <div className="announcement-intro">
          <h2 id="notices-title" className="page-section-title">
            All updates
          </h2>
          <p>Everything in one place, newest first.</p>
        </div>
        {announcements.length > 0 ? (
          <DocumentList items={announcements} />
        ) : (
          <EmptyState kind="list" icon={<FileText />} title="Nothing new yet.">
            Notices, news and announcements will be posted here.
          </EmptyState>
        )}
      </section>
    </PageShell>
  );
}
