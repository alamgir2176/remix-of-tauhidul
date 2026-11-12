import { createFileRoute } from "@tanstack/react-router";
import { CvRequestForm } from "@/components/cv-request-form";
import { PageIntro, PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/cv-request")({
  head: () => ({
    meta: [
      { title: "Request my CV — Md Tauhidul Islam" },
      { name: "description", content: "Request a copy of the CV of Md Tauhidul Islam. Each request is reviewed personally." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CvRequestPage,
});

function CvRequestPage() {
  return (
    <PageShell>
      <PageIntro label="CV / résumé" title="Request my" accent="CV.">
        My CV is not published online. Tell me a little about yourself and why you would like it. I review every request personally and reply by email if I am able to share it.
      </PageIntro>
      <section className="page-section cv-request-wrap" aria-label="CV request form"><CvRequestForm /></section>
    </PageShell>
  );
}
