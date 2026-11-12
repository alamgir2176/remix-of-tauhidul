import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageIntro, PageShell } from "@/components/page-shell";
import { PhotoFigure } from "@/components/content-cards";
import { getPhotoGroups } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/activities")({
  head: () =>
    pageMeta({
      title: "Activities & Events — Md Tauhidul Islam",
      description: "Photographs from the activities, events and community work of Md Tauhidul Islam.",
      path: "/activities",
    }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const groups = getPhotoGroups();
  return (
    <PageShell>
      <PageIntro number="06" label="Activities & events" title="Moments from" accent="the field.">
        Photographs from activities, events, programmes and community work.
      </PageIntro>
      <section className="page-section" aria-label="Photo gallery">
        {groups.length === 0 && <EmptyState title="No photographs yet.">Photographs from activities will appear here.</EmptyState>}
        {groups.map((group, g) => (
          <div key={`${group.activity}-${g}`} className="gallery-group">
            {(group.activity || group.dateLabel) && (
              <div className="gallery-head">
                <h2 className="page-section-title">{group.activity || "More moments"}</h2>
                {group.dateLabel && <p className="micro-label">{group.dateLabel}</p>}
              </div>
            )}
            <div className="gallery">
              {group.photos.map((photo, i) => <PhotoFigure key={`${photo.image}-${i}`} photo={photo} />)}
            </div>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
