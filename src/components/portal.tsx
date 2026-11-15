import type { CSSProperties, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { FeedCard, TYPE_HUE } from "@/components/content-cards";
import { formatDate, hostOf } from "@/lib/content-utils";
import type { FeedItem } from "@/lib/content";

/** Opens an article on this site, or the outside link for everything else. */
function ItemLink({ item, className, children }: { item: FeedItem; className: string; children: ReactNode }) {
  const style = { "--hue": TYPE_HUE[item.type] ?? 285 } as CSSProperties;
  return item.slug ? (
    <Link to="/writings/$slug" params={{ slug: item.slug }} className={className} style={style}>{children}</Link>
  ) : (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={className} style={style}>{children}</a>
  );
}

function Meta({ item }: { item: FeedItem }) {
  const date = formatDate(item.date);
  const host = !item.slug && item.url ? hostOf(item.url) : "";
  return (
    <p className="portal-meta">
      <span className="portal-type">{item.type}</span>
      {date && <span>{date}</span>}
      {host && <span className="portal-host">{host}</span>}
    </p>
  );
}

function Lead({ item }: { item: FeedItem }) {
  return (
    <ItemLink item={item} className="portal-lead">
      <div className="portal-lead-media">
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" decoding="async" className="photo-mono" />
        ) : (
          <span className="card-thumb-fallback" aria-hidden="true">{item.title.slice(0, 1).toUpperCase()}</span>
        )}
      </div>
      <div className="portal-lead-body">
        <Meta item={item} />
        <h3 className="portal-lead-title">{item.title}</h3>
        {item.description && <p className="portal-lead-text">{item.description}</p>}
        <span className="portal-read">{item.slug ? "Read" : "Open"} <ArrowUpRight aria-hidden="true" /></span>
      </div>
    </ItemLink>
  );
}

function Row({ item }: { item: FeedItem }) {
  return (
    <ItemLink item={item} className="portal-row">
      <div className="portal-row-body">
        <Meta item={item} />
        <h3 className="portal-row-title">{item.title}</h3>
      </div>
      {item.image && <img src={item.image} alt="" loading="lazy" decoding="async" className="photo-mono" />}
    </ItemLink>
  );
}

/**
 * Front-page layout: one lead story, a column of shorter items beside it.
 * `more` adds a closing link row (for example "+8 more").
 */
export function PortalFeed({ items, more }: { items: FeedItem[]; more?: ReactNode | undefined }) {
  const [lead, ...side] = items;
  if (!lead) return null;
  const hasSide = side.length > 0 || Boolean(more);
  return (
    <div className={`portal${hasSide ? "" : " portal-solo"}`}>
      <Lead item={lead} />
      {hasSide && (
        <ul className="portal-side">
          {side.map((item) => (
            <li key={item.key}><Row item={item} /></li>
          ))}
          {more && <li>{more}</li>}
        </ul>
      )}
    </div>
  );
}

/** A full listing page: the front-page layout for the newest few, then a grid for everything else. */
export function PortalPage({ items }: { items: FeedItem[] }) {
  const front = items.slice(0, 4);
  const rest = items.slice(4);
  return (
    <>
      <PortalFeed items={front} />
      {rest.length > 0 && (
        <>
          <p className="portal-earlier micro-label">Earlier</p>
          <div className="portal-grid">
            {rest.map((item) => (
              <FeedCard key={item.key} item={item} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export function PortalMore({ to, children }: { to: "/library"; children: ReactNode }) {
  return (
    <Link to={to} className="portal-more">
      <span>{children}</span>
      <ArrowUpRight aria-hidden="true" />
    </Link>
  );
}
