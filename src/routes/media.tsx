import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, Download, Newspaper } from "lucide-react";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { getMedia } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/media")({
  head: () =>
    pageMeta({
      title: "Media kit — Md Tauhidul Islam",
      description: "Approved short and long biography, a photograph and how to credit them, for organisers, editors and hosts.",
      path: "/media",
    }),
  component: MediaPage,
});

function CopyBlock({ label, text }: { label: string; text: string }) {
  const { t, la } = useI18n();
  const [done, setDone] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); setDone(true); window.setTimeout(() => setDone(false), 2000); } catch { /* the text stays selectable */ }
  }
  return (
    <div className="media-block">
      <div className="media-block-head">
        <span className="micro-label">{t(label)}</span>
        <button type="button" onClick={copy}>{done ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}<span role="status">{done ? t("Copied") : t("Copy")}</span></button>
      </div>
      <p {...la(text)}>{t(text)}</p>
    </div>
  );
}

function MediaPage() {
  const { t } = useI18n();
  const kit = getMedia();
  const empty = !kit.short && !kit.long && kit.facts.length === 0 && !kit.photo;
  return (
    <PageShell>
      <PageIntro number="10" label="Media kit" title="For organisers" accent="and editors.">
        Approved text and a photograph you are welcome to use, with a line on how to credit them.
      </PageIntro>
      <section className="page-section" aria-label={t("Media kit")}>
        {kit.note && <p className="reader-note now-note"><span>{t("About this page")}</span>{t(kit.note)}</p>}
        {empty ? (
          <EmptyState icon={<Newspaper />} title="The media kit is being prepared.">Please use the contact form to ask for what you need.</EmptyState>
        ) : (
          <div className="media-kit">
            <div className="media-text">
              {kit.short && <CopyBlock label="Short biography" text={kit.short} />}
              {kit.long && <CopyBlock label="Longer biography" text={kit.long} />}
              {kit.credit && <CopyBlock label="How to credit" text={kit.credit} />}
              {kit.facts.length > 0 && (
                <dl className="media-facts">
                  {kit.facts.map((f) => <div key={f.label}><dt className="micro-label">{t(f.label)}</dt><dd>{t(f.value)}</dd></div>)}
                </dl>
              )}
              <p className="media-contact">{t("Need something else?")} <Link to="/" hash="contact">{t("Send a message")}</Link>.</p>
            </div>
            {kit.photo && (
              <figure className="media-photo">
                <img src={kit.photo} alt={t("Portrait of Md Tauhidul Islam")} loading="lazy" decoding="async" />
                <figcaption>{t(kit.photoCredit)}</figcaption>
                <a href={kit.photo} download className="media-download"><Download aria-hidden="true" /> {t("Download the photograph")}</a>
              </figure>
            )}
          </div>
        )}
      </section>
    </PageShell>
  );
}
