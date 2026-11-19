import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { LangTag } from "@/components/language-switch";
import { useI18n } from "@/lib/i18n";
import type { Announcement, FeedItem } from "@/lib/content";
import type { DocumentItem, Photo } from "@/lib/content-utils";

/** Colour of each type's tag in the Colorful theme (an OKLCH hue). Other themes ignore it. */
export const TYPE_HUE: Record<string, number> = {
  Blog: 38,
  Project: 165,
  Book: 82,
  Research: 255,
  Article: 200,
  Editorial: 8,
  Opinion: 320,
  "Talk show": 55,
  Seminar: 285,
};

/** Card for any item of the "writing & work" group. */
export function FeedCard({ item }: { item: FeedItem }) {
  const { t, la } = useI18n();
  const title = t(item.title);
  const description = t(item.description);
  const inner = (
    <>
      <div className="card-thumb">
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" decoding="async" className="photo-mono" />
        ) : (
          <span className="card-thumb-fallback" aria-hidden="true">
            {title.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="card-tag">{t(item.type)}</span>
      </div>
      <div className="card-body">
        <p className="card-kicker">{t(item.type)} <LangTag text={item.title} /></p>
        <h3 className="card-title" {...la(title)}>{title}</h3>
        {description && <p className="card-text" {...la(description)}>{description}</p>}
      </div>
    </>
  );
  const style = { "--hue": TYPE_HUE[item.type] ?? 285 } as CSSProperties;
  return item.slug ? (
    <Link to="/writings/$slug" params={{ slug: item.slug }} className="content-card" style={style}>
      {inner}
    </Link>
  ) : (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="content-card"
      style={style}
    >
      {inner}
    </a>
  );
}

export function DocumentList({ items }: { items: (DocumentItem | Announcement)[] }) {
  const { t, date, la } = useI18n();
  return (
    <ul className="doc-list">
      {items.map((doc, i) => (
        <li key={`${doc.title}-${i}`} className="doc-row">
          <FileText aria-hidden="true" className="doc-icon" />
          <div className="doc-main">
            {"kind" in doc && <p className="doc-kind">{t(doc.kind)}</p>}
            <h3 className="doc-title" {...la(t(doc.title))}>{t(doc.title)}</h3>
            <p className="micro-label">{date(doc.date, doc.dateLabel)}</p>
            {doc.description && <p className="card-text" {...la(t(doc.description))}>{t(doc.description)}</p>}
          </div>
          {doc.pdf ? (
            <a
              href={doc.pdf}
              download={doc.fileName || true}
              target="_blank"
              rel="noopener noreferrer"
              className="doc-download"
              aria-label={t("Download PDF: {title}", { title: t(doc.title) })}
            >
              <Download aria-hidden="true" /> <span>{t("PDF")}</span>
            </a>
          ) : (
            <span className="micro-label">{t("No file")}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function PhotoFigure({ photo, onOpen }: { photo: Photo; onOpen?: (trigger: HTMLElement) => void }) {
  const { t } = useI18n();
  return (
    <figure className="gallery-item">
      <a
        href={photo.image}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("Open full-size photo: {title}", { title: t(photo.caption || photo.alt) })}
        onClick={(e) => {
          // With a viewer available, open it in place; modified clicks still use the plain link.
          if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          onOpen(e.currentTarget);
        }}
      >
        <img src={photo.image} alt={t(photo.alt)} loading="lazy" decoding="async" />
      </a>
      {(photo.caption || photo.location) && (
        <figcaption>
          {t(photo.caption)}
          {photo.location && <span>{t(photo.location)}</span>}
        </figcaption>
      )}
    </figure>
  );
}
