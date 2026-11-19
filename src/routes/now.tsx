import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { getNow } from "@/lib/content";
import { dateValue } from "@/lib/content-utils";
import { useI18n } from "@/lib/i18n";
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
  const { t, date, la } = useI18n();
  const now = getNow();
  const when = now.updated && dateValue(now.updated) ? date(now.updated.slice(0, 10)) : "";
  return (
    <PageShell>
      <PageIntro number="09" label="Now" title="What I am up to," accent="at the moment.">
        {t(now.intro || "A short page that changes as my days do.")}
      </PageIntro>
      <section className="page-section" aria-label={t("Now")}>
        {now.note && <p className="reader-note now-note"><span>{t("About this page")}</span>{t(now.note)}</p>}
        {now.entries.length > 0 ? (
          <dl className="now-list">
            {now.entries.map((e) => (
              <div key={e.label}>
                <dt className="micro-label">{t(e.label)}</dt>
                <dd {...la(e.text)}>{t(e.text)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <EmptyState icon={<Clock />} title="Nothing here yet.">This page will fill in as there is something to share.</EmptyState>
        )}
        {when && <p className="now-updated">{t("Last updated {when}", { when })}</p>}
      </section>
    </PageShell>
  );
}
