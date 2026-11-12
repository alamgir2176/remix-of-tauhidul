import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, PageShell } from "@/components/page-shell";
import { DirectoryGrid } from "@/components/content-cards";
import { getDirectory } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/library/")({
  head: () =>
    pageMeta({
      title: "Library — Md Tauhidul Islam",
      description: "Writings, projects, books, research, talks, notices and activities of Md Tauhidul Islam.",
      path: "/library",
    }),
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <PageShell>
      <PageIntro label="Writing & work" title="Everything in" accent="one place.">
        Original writings, work published elsewhere, official notices and photographs from my activities.
      </PageIntro>
      <section className="page-section" aria-label="All sections"><DirectoryGrid entries={getDirectory()} /></section>
    </PageShell>
  );
}
