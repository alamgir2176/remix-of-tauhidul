import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { PortalPage } from "@/components/portal";
import { TypeChips } from "@/components/type-chips";
import { getFeed, getPosts } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
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
  const { t, lang } = useI18n();
  const posts = getFeed(lang).filter((item) => item.slug);
  const [tag, setTag] = useState<string | null>(null);
  // Tags come from the articles themselves; the filter appears once there is enough to filter.
  const tagsBySlug = useMemo(() => new Map(getPosts(lang).map((p) => [p.slug, p.tags])), [lang]);
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tg of tagsBySlug.values()) for (const x of tg) counts.set(x, (counts.get(x) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name]) => name);
  }, [tagsBySlug]);
  const showFilter = posts.length >= 4 && tags.length >= 2;
  const shown = tag ? posts.filter((item) => item.slug && tagsBySlug.get(item.slug)?.includes(tag)) : posts;
  return (
    <PageShell>
      <PageIntro
        number="02"
        label="Blog & personal writings"
        title="Thoughts, in"
        accent="my own words."
      >
        Essays and reflections published here, on my own website.
      </PageIntro>
      <section className="page-section" aria-label={t("Articles")}>
        <TypeChips active="blog" />
        {posts.length > 0 ? (
          <>
            {showFilter && (
              <div className="notice-filter-set tag-filter" role="group" aria-label={t("Filter by topic")}>
                <button type="button" className="notice-chip" aria-pressed={tag === null} onClick={() => setTag(null)}>{t("All")}</button>
                {tags.map((name) => (
                  <button key={name} type="button" className="notice-chip" aria-pressed={tag === name} onClick={() => setTag(tag === name ? null : name)}>{t(name)}</button>
                ))}
              </div>
            )}
            <PortalPage items={shown} />
          </>
        ) : (
          <EmptyState icon={<PenLine />} title="No writings yet.">
            New essays and reflections will appear here once they are published.
          </EmptyState>
        )}
      </section>
    </PageShell>
  );
}
