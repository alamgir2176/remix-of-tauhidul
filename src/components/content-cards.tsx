import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import type { Announcement, FeedItem } from "@/lib/content";
import type { DocumentItem, Photo } from "@/lib/content-utils";

/** Colour of each type's tag in the Colorful theme (an OKLCH hue). Other themes ignore it. */
const TYPE_HUE: Record<string, number> = {
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
  const inner = (
    <>
      <div className="card-thumb">
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" decoding="async" className="photo-mono" />
        ) : (
          <span className="card-thumb-fallback" aria-hidden="true">
            {item.title.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="card-tag">{item.type}</span>
      </div>
      <div className="card-body">
        <p className="card-kicker">{item.type}</p>
        <h3 className="card-title">{item.title}</h3>
        {item.description && <p className="card-text">{item.description}</p>}
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
  return (
    <ul className="doc-list">
      {items.map((doc, i) => (
        <li key={`${doc.title}-${i}`} className="doc-row">
          <FileText aria-hidden="true" className="doc-icon" />
          <div className="doc-main">
            {"kind" in doc && <p className="doc-kind">{doc.kind}</p>}
            <h3 className="doc-title">{doc.title}</h3>
            <p className="micro-label">{doc.dateLabel}</p>
            {doc.description && <p className="card-text">{doc.description}</p>}
          </div>
          {doc.pdf ? (
            <a
              href={doc.pdf}
              download={doc.fileName || true}
              target="_blank"
              rel="noopener noreferrer"
              className="doc-download"
              aria-label={`Download PDF: ${doc.title}`}
            >
              <Download aria-hidden="true" /> <span>PDF</span>
            </a>
          ) : (
            <span className="micro-label">No file</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function PhotoFigure({ photo }: { photo: Photo }) {
  return (
    <figure className="gallery-item">
      <a
        href={photo.image}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open full-size photo: ${photo.caption || photo.alt}`}
      >
        <img src={photo.image} alt={photo.alt} loading="lazy" decoding="async" />
      </a>
      {(photo.caption || photo.location) && (
        <figcaption>
          {photo.caption}
          {photo.location && <span>{photo.location}</span>}
        </figcaption>
      )}
    </figure>
  );
}
