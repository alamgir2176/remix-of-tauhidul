import { createFileRoute } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { ShareLine } from "@/components/share-line";
import { getQuotations } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/quotations")({
  head: () =>
    pageMeta({
      title: "Quotations — Md Tauhidul Islam",
      description: "Lines worth keeping: the quotations that open this website, and a few more.",
      path: "/quotations",
    }),
  component: QuotationsPage,
});

function QuotationsPage() {
  const items = getQuotations();
  return (
    <PageShell>
      <PageIntro number="08" label="Quotations" title="Lines worth" accent="keeping.">
        The words that open this website, and others I come back to.
      </PageIntro>
      <section className="page-section" aria-label="Quotations">
        {items.length > 0 ? (
          <ol className="quote-list">
            {items.map((q, i) => (
              <li key={`${i}-${q.source}`}>
                <figure>
                  <blockquote className="font-editorial">“{q.text.replace(/^[“"]|[”"]$/g, "")}”</blockquote>
                  <figcaption>{q.source && <span>{q.source}</span>}{q.intro && <em>Opening sequence</em>}</figcaption>
                  {q.note && <p>{q.note}</p>}
                </figure>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState icon={<Quote />} title="No quotations yet.">Quotations will appear here once they are added.</EmptyState>
        )}
      </section>
      <ShareLine title="Quotations" byline="From my notebook · Md Tauhidul Islam" url="" scope=".quote-list blockquote" />
    </PageShell>
  );
}
