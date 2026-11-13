import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Camera, FileText, PenLine } from "lucide-react";
import { DocumentList, FeedCard, PhotoFigure } from "@/components/content-cards";
import { EmptyState } from "@/components/page-shell";
import { getAnnouncements, getFeed, getPhotos } from "@/lib/content";

function SeeAll({
  children,
  ...link
}: {
  children: string;
  to: "/library" | "/notices" | "/activities";
}) {
  return (
    <Link {...link} className="see-all">
      {children} <ArrowUpRight aria-hidden="true" />
    </Link>
  );
}

/** 04: blog posts, projects, books, research, articles, editorials, opinion, talk shows and seminars. */
export function WritingSection() {
  const feed = getFeed().slice(0, 6);
  return (
    <section id="library" className="library-section section-space">
      <span className="section-mark" aria-hidden="true">
        04
      </span>
      <div className="section-label">
        <span>04 — Writing &amp; work</span>
        <span>Words, projects and talks</span>
      </div>
      <div className="section-head scroll-reveal">
        <h2 className="section-heading">
          Ideas, set down
          <br />
          <span className="font-editorial italic">on the page.</span>
        </h2>
        <SeeAll to="/library">See everything</SeeAll>
      </div>
      {feed.length > 0 ? (
        <div className="editorial-feed editorial-feed-home">
          {feed.map((item, i) => (
            <div key={item.key} className={i === 0 ? "editorial-feature" : ""}>
              <FeedCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<PenLine />} title="Nothing published yet.">
          Essays, projects, books and talks will be collected here as they are ready.
        </EmptyState>
      )}
    </section>
  );
}

/** 05: notices and press releases together. */
export function NoticesSection() {
  const announcements = getAnnouncements().slice(0, 6);
  return (
    <section id="notices" className="notices-section section-space">
      <span className="section-mark" aria-hidden="true">
        05
      </span>
      <div className="section-label">
        <span>05 — Updates</span>
        <span>Notices, news and announcements</span>
      </div>
      <div className="section-head scroll-reveal">
        <h2 className="section-heading">
          Latest
          <br />
          <span className="font-editorial italic">updates.</span>
        </h2>
        <SeeAll to="/notices">All updates</SeeAll>
      </div>
      {announcements.length > 0 ? (
        <DocumentList items={announcements} />
      ) : (
        <EmptyState kind="list" icon={<FileText />} title="Nothing new yet.">
          Notices, news and announcements will be posted here.
        </EmptyState>
      )}
    </section>
  );
}

/** 06: activity and event photographs. */
export function ActivitiesSection() {
  const photos = getPhotos().slice(0, 6);
  return (
    <section id="activities" className="activities-section section-space">
      <span className="section-mark" aria-hidden="true">
        06
      </span>
      <div className="section-label">
        <span>06 — Activities &amp; events</span>
        <span>Moments from the field</span>
      </div>
      <div className="section-head scroll-reveal">
        <h2 className="section-heading">
          Moments from
          <br />
          <span className="font-editorial italic">the field.</span>
        </h2>
        <SeeAll to="/activities">Full gallery</SeeAll>
      </div>
      {photos.length > 0 ? (
        <div className="photo-grid photo-grid-home">
          {photos.map((photo, i) => (
            <div key={`${photo.image}-${i}`} className={i === 0 ? "photo-feature" : ""}>
              <PhotoFigure photo={photo} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState kind="photos" icon={<Camera />} title="No photographs yet.">
          Photographs from events and activities will be added here.
        </EmptyState>
      )}
    </section>
  );
}
