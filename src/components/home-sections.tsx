import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Camera, FileText, PenLine } from "lucide-react";
import { DocumentList, FeedCard, PhotoFigure } from "@/components/content-cards";
import { EmptyState } from "@/components/page-shell";
import { getFeed, getNotices, getPhotos, getPressReleases } from "@/lib/content";

function SeeAll({ children, ...link }: { children: string; to: "/library" | "/notices" | "/activities" }) {
  return <Link {...link} className="see-all">{children} <ArrowUpRight aria-hidden="true" /></Link>;
}

/** 04: blog posts, projects, books, research, articles, editorials, opinion, talk shows and seminars. */
export function WritingSection() {
  const feed = getFeed().slice(0, 6);
  return (
    <section id="library" className="library-section section-space">
      <span className="section-mark" aria-hidden="true">04</span>
      <div className="section-label"><span>04 — Writing &amp; work</span><span>Words, projects and talks</span></div>
      <div className="section-head scroll-reveal">
        <h2 className="section-heading">Ideas, set down<br /><span className="font-editorial italic">on the page.</span></h2>
        <SeeAll to="/library">See everything</SeeAll>
      </div>
      {feed.length > 0 ? (
        <div className="card-grid">{feed.map((item) => <FeedCard key={item.key} item={item} />)}</div>
      ) : (
        <EmptyState icon={<PenLine />} title="Nothing published yet.">Writings, projects, books and talks will appear here.</EmptyState>
      )}
    </section>
  );
}

/** 05: notices and press releases together. */
export function NoticesSection() {
  const notices = getNotices().slice(0, 3);
  const releases = getPressReleases().slice(0, 3);
  return (
    <section id="notices" className="notices-section section-space">
      <span className="section-mark" aria-hidden="true">05</span>
      <div className="section-label"><span>05 — Notices &amp; press releases</span><span>Official announcements</span></div>
      <div className="section-head scroll-reveal">
        <h2 className="section-heading">Official<br /><span className="font-editorial italic">announcements.</span></h2>
        <SeeAll to="/notices">All notices &amp; releases</SeeAll>
      </div>
      <div className="notices-columns">
        <div>
          <h3 className="page-section-title">Notices</h3>
          {notices.length > 0 ? <DocumentList items={notices} /> : <EmptyState kind="list" icon={<FileText />} title="No notices yet.">New notices will be listed here.</EmptyState>}
        </div>
        <div>
          <h3 className="page-section-title">Press releases</h3>
          {releases.length > 0 ? <DocumentList items={releases} /> : <EmptyState kind="list" icon={<FileText />} title="No press releases yet.">New press releases will be listed here.</EmptyState>}
        </div>
      </div>
    </section>
  );
}

/** 06: activity and event photographs. */
export function ActivitiesSection() {
  const photos = getPhotos().slice(0, 6);
  return (
    <section id="activities" className="activities-section section-space">
      <span className="section-mark" aria-hidden="true">06</span>
      <div className="section-label"><span>06 — Activities &amp; events</span><span>Moments from the field</span></div>
      <div className="section-head scroll-reveal">
        <h2 className="section-heading">Moments from<br /><span className="font-editorial italic">the field.</span></h2>
        <SeeAll to="/activities">Full gallery</SeeAll>
      </div>
      {photos.length > 0 ? (
        <div className="photo-grid">{photos.map((photo, i) => <PhotoFigure key={`${photo.image}-${i}`} photo={photo} />)}</div>
      ) : (
        <EmptyState kind="photos" icon={<Camera />} title="No photographs yet.">Photographs from activities and events will appear here.</EmptyState>
      )}
    </section>
  );
}
