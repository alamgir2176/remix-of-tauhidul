import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Download, FileText } from "lucide-react";
import type { DirectoryEntry } from "@/lib/content";
import type { DocumentItem, ExternalItem, Post } from "@/lib/content-utils";

function Thumb({ src, alt, fallback }: { src: string; alt: string; fallback: string }) {
  return (
    <div className="card-thumb">
      {src ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" className="photo-mono" />
      ) : (
        <span className="card-thumb-fallback" aria-hidden="true">{fallback.slice(0, 1).toUpperCase()}</span>
      )}
    </div>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link to="/writings/$slug" params={{ slug: post.slug }} className="content-card">
      <Thumb src={post.cover} alt="" fallback={post.title} />
      <div className="card-body">
        <p className="micro-label">{[post.dateLabel, `${post.readingMinutes} min read`].filter(Boolean).join(" · ")}</p>
        <h3 className="card-title">{post.title}</h3>
        {post.excerpt && <p className="card-text">{post.excerpt}</p>}
        <span className="card-cta">Read article <ArrowUpRight aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

export function ExternalCard({ item, kind }: { item: ExternalItem; kind: string }) {
  const meta = [item.category || kind, item.source, item.dateLabel].filter(Boolean).join(" · ");
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="content-card">
      <Thumb src={item.image} alt="" fallback={item.title} />
      <div className="card-body">
        <p className="micro-label">{meta}</p>
        <h3 className="card-title">{item.title}</h3>
        {item.description && <p className="card-text">{item.description}</p>}
        <span className="card-cta">{item.host || "Open link"} <ArrowUpRight aria-hidden="true" /></span>
      </div>
    </a>
  );
}

export function DocumentList({ items, emptyId }: { items: DocumentItem[]; emptyId?: string }) {
  return (
    <ul className="doc-list" id={emptyId}>
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

function TileInner({ entry, index }: { entry: DirectoryEntry; index: number }) {
  return (
    <>
      <span className="directory-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="directory-name">{entry.title}</span>
      <span className="directory-count">{entry.count > 0 ? `${entry.count} ${entry.count === 1 ? "item" : "items"}` : "Coming soon"}</span>
      <ArrowUpRight aria-hidden="true" />
    </>
  );
}

export function DirectoryGrid({ entries }: { entries: DirectoryEntry[] }) {
  return (
    <ul className="directory-grid">
      {entries.map((entry, i) => (
        <li key={entry.key}>
          {entry.to === "/library/$section" ? (
            <Link to="/library/$section" params={{ section: entry.params?.section ?? "" }} className="directory-tile">
              <TileInner entry={entry} index={i} />
            </Link>
          ) : entry.to === "/notices" ? (
            <Link to="/notices" hash={entry.hash ?? "notices"} className="directory-tile">
              <TileInner entry={entry} index={i} />
            </Link>
          ) : entry.to === "/activities" ? (
            <Link to="/activities" className="directory-tile">
              <TileInner entry={entry} index={i} />
            </Link>
          ) : (
            <Link to="/writings" className="directory-tile">
              <TileInner entry={entry} index={i} />
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
