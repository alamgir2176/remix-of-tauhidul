import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { getNow } from "@/lib/content";
import { dateValue } from "@/lib/content-utils";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/now")({
  head: () =>
    pageMeta({
      title: "Now — Md Tauhidul Islam",
      description: "What I am reading, working on and thinking about at the moment.",
      path: "/now",
    }),
  component: NowPage,
});

function NowPage() {
  const now = getNow();
  const when = now.updated && dateValue(now.updated) ? new Date(`${now.updated.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
  return (
    <PageShell>
      <PageIntro number="09" label="Now" title="What I am up to," accent="at the moment.">
        {now.intro || "A short page that changes as my days do."}
      </PageIntro>
      <section className="page-section" aria-label="Now">
        {now.note && <p className="reader-note now-note"><span>About this page</span>{now.note}</p>}
        {now.entries.length > 0 ? (
          <dl className="now-list">
            {now.entries.map((e) => (
              <div key={e.label}>
                <dt className="micro-label">{e.label}</dt>
                <dd>{e.text}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <EmptyState icon={<Clock />} title="Nothing here yet.">This page will fill in as there is something to share.</EmptyState>
        )}
        {when && <p className="now-updated">Last updated {when}</p>}
      </section>
    </PageShell>
  );
}
