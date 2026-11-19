import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Camera, FileText, PenLine } from "lucide-react";
import { NoticeBoard } from "@/components/notice-board";
import { PortalFeed, PortalMore } from "@/components/portal";
import { PhotoGallery } from "@/components/photo-gallery";
import { EmptyState } from "@/components/page-shell";
import { Rich, useI18n } from "@/lib/i18n";
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
  const { t, num, lang } = useI18n();
  const all = getFeed(lang);
  // A few chosen pieces: those marked "featured" first, otherwise the newest.
  const featured = all.filter((item) => item.featured);
  const feed = (featured.length > 0 ? featured : all).slice(0, 4);
  const moreCount = all.length - feed.length;
  return (
    <section id="library" className="library-section section-space">
      <span className="section-mark" aria-hidden="true">
        {num("02")}
      </span>
      <div className="section-label">
        <span>{num("02")} — {t("Writing & work")}</span>
        <span>{t("Words, projects and talks")}</span>
      </div>
      <div className="section-head scroll-reveal">
        <h2 className="section-heading">
          <Rich text={t("Ideas, set down\n*on the page.*")} />
        </h2>
        <SeeAll to="/library">{t("See everything")}</SeeAll>
      </div>
      {feed.length > 0 ? (
        <PortalFeed items={feed} more={moreCount > 0 ? <PortalMore to="/library">{t("+{n} more in Writing & work", { n: moreCount })}</PortalMore> : undefined} />
      ) : (
        <EmptyState icon={<PenLine />} title={t("Nothing published yet.")}>
          {t("Essays, projects, books and talks will be collected here as they are ready.")}
        </EmptyState>
      )}
    </section>
  );
}

/** 05: notices and press releases together. */
export function NoticesSection() {
  const { t, num } = useI18n();
  const all = getAnnouncements();
  const featured = all.filter((item) => item.featured);
  const announcements = (featured.length > 0 ? featured : all).slice(0, 4);
  const moreCount = all.length - announcements.length;
  return (
    <section id="notices" className="notices-section section-space">
      <span className="section-mark" aria-hidden="true">
        {num("05")}
      </span>
      <div className="section-label">
        <span>{num("05")} — {t("Updates")}</span>
        <span>{t("Notices, news and announcements")}</span>
      </div>
      <div className="section-head scroll-reveal">
        <h2 className="section-heading">
          <Rich text={t("Latest\n*updates.*")} />
        </h2>
        <SeeAll to="/notices">{t("All updates")}</SeeAll>
      </div>
      {announcements.length > 0 ? (
        <NoticeBoard items={announcements} more={moreCount} />
      ) : (
        <EmptyState kind="list" icon={<FileText />} title={t("Nothing new yet.")}>
          {t("Notices, news and announcements will be posted here.")}
        </EmptyState>
      )}
    </section>
  );
}

/** 06: activity and event photographs. */
const HOME_PHOTOS = 4;

export function ActivitiesSection() {
  const { t, num } = useI18n();
  const all = getPhotos();
  // The homepage shows a hand-picked few: photos marked "featured" first, otherwise the first few in the file.
  const featured = all.filter((photo) => photo.featured);
  const photos = (featured.length > 0 ? featured : all).slice(0, HOME_PHOTOS);
  const more = all.length - photos.length;
  return (
    <section id="activities" className="activities-section section-space">
      <span className="section-mark" aria-hidden="true">
        {num("06")}
      </span>
      <div className="section-label">
        <span>{num("06")} — {t("Activities & events")}</span>
        <span>{t("Moments from the field")}</span>
      </div>
      <div className="section-head scroll-reveal">
        <h2 className="section-heading">
          <Rich text={t("Moments from\n*the field.*")} />
        </h2>
        <SeeAll to="/activities">{t("Full gallery")}</SeeAll>
      </div>
      {photos.length > 0 ? (
        <PhotoGallery
          photos={photos}
          className="gallery-wall gallery-wall-home"
          tail={
            <Link to="/activities" className="gallery-more">
              <span className="gallery-more-count">{more > 0 ? `+${num(more)}` : num(all.length)}</span>
              <span className="gallery-more-text">{more > 0 ? t("more in the full gallery") : t("in the full gallery")}</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <EmptyState kind="photos" icon={<Camera />} title={t("No photographs yet.")}>
          {t("Photographs from events and activities will be added here.")}
        </EmptyState>
      )}
    </section>
  );
}
