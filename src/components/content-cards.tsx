import { Link } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import type { FeedItem } from "@/lib/content";
import type { DocumentItem, Photo } from "@/lib/content-utils";

/** Card for any item of the "writing & work" group. The only label is its type tag. */
export function FeedCard({ item }: { item: FeedItem }) {
  const inner = (
    <>
      <div className="card-thumb">
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" decoding="async" className="photo-mono" />
        ) : (
          <span className="card-thumb-fallback" aria-hidden="true">{item.title.slice(0, 1).toUpperCase()}</span>
        )}
        <span className="card-tag">{item.type}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{item.title}</h3>
        {item.description && <p className="card-text">{item.description}</p>}
      </div>
    </>
  );
  return item.slug ? (
    <Link to="/writings/$slug" params={{ slug: item.slug }} className="content-card">{inner}</Link>
  ) : (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="content-card">{inner}</a>
  );
}

export function DocumentList({ items }: { items: DocumentItem[] }) {
  return (
    <ul className="doc-list">
      {items.map((doc, i) => (
        <li key={`${doc.title}-${i}`} className="doc-row">
          <FileText aria-hidden="true" className="doc-icon" />
          <div className="doc-main">
            <h3 className="doc-title">{doc.title}</h3>
            <p className="micro-label">{doc.dateLabel}</p>
            {doc.description && <p className="card-text">{doc.description}</p>}
          </div>
          {doc.pdf ? (
            <a href={doc.pdf} download={doc.fileName || true} target="_blank" rel="noopener noreferrer" className="doc-download" aria-label={`Download PDF: ${doc.title}`}>
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
      <a href={photo.image} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size photo: ${photo.caption || photo.alt}`}>
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
