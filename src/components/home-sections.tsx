import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Camera, FileText, PenLine } from "lucide-react";
import { NoticeBoard } from "@/components/notice-board";
import { PortalFeed, PortalMore } from "@/components/portal";
import { PhotoGallery } from "@/components/photo-gallery";
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
  const all = getFeed();
  // A few chosen pieces: those marked "featured" first, otherwise the newest.
  const featured = all.filter((item) => item.featured);
  const feed = (featured.length > 0 ? featured : all).slice(0, 4);
  const moreCount = all.length - feed.length;
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
        <PortalFeed items={feed} more={moreCount > 0 ? <PortalMore to="/library">{`+${moreCount} more in Writing & work`}</PortalMore> : undefined} />
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
  const all = getAnnouncements();
  const featured = all.filter((item) => item.featured);
  const announcements = (featured.length > 0 ? featured : all).slice(0, 4);
  const moreCount = all.length - announcements.length;
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
        <NoticeBoard items={announcements} more={moreCount} />
      ) : (
        <EmptyState kind="list" icon={<FileText />} title="Nothing new yet.">
          Notices, news and announcements will be posted here.
        </EmptyState>
      )}
    </section>
  );
}

/** 06: activity and event photographs. */
const HOME_PHOTOS = 4;

export function ActivitiesSection() {
  const all = getPhotos();
  // The homepage shows a hand-picked few: photos marked "featured" first, otherwise the first few in the file.
  const featured = all.filter((photo) => photo.featured);
  const photos = (featured.length > 0 ? featured : all).slice(0, HOME_PHOTOS);
  const more = all.length - photos.length;
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
        <PhotoGallery
          photos={photos}
          className="gallery-wall gallery-wall-home"
          tail={
            <Link to="/activities" className="gallery-more">
              <span className="gallery-more-count">{more > 0 ? `+${more}` : all.length}</span>
              <span className="gallery-more-text">{more > 0 ? "more in the full gallery" : "in the full gallery"}</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <EmptyState kind="photos" icon={<Camera />} title="No photographs yet.">
          Photographs from events and activities will be added here.
        </EmptyState>
      )}
    </section>
  );
}
