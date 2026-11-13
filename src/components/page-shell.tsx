import type { CSSProperties, ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

/** Which homepage menu item a path belongs to. */
function activeFor(path: string): string {
  if (path.startsWith("/notices")) return "notices";
  if (path.startsWith("/activities")) return "activities";
  if (path.startsWith("/library") || path.startsWith("/writings")) return "library";
  return "";
}

/** Same header and footer as the homepage, around the content of an inner page. */
export function PageShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div id="top">
      <SiteHeader active={activeFor(path)} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({
  number,
  label,
  title,
  accent,
  children,
}: {
  number: string;
  label: string;
  title: string;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-intro">
      <span className="section-mark" aria-hidden="true">
        {number}
      </span>
      <div className="section-label">
        <span>
          {number} — {label}
        </span>
        <Link to="/" hash="top" className="page-intro-link">
          Back to home
        </Link>
      </div>
      <h1 className="section-heading">
        {title}
        {accent && (
          <>
            <br />
            <span className="font-editorial italic">{accent}</span>
          </>
        )}
      </h1>
      {children && <p className="section-intro">{children}</p>}
    </section>
  );
}

type EmptyKind = "cards" | "list" | "photos";

const GHOST_HUES = [285, 20, 190];

/** A calm empty panel with a faint preview of the live section's entry layout. */
export function EmptyState({
  title,
  icon,
  kind = "cards",
  children,
}: {
  title: string;
  icon: ReactNode;
  kind?: EmptyKind;
  children?: ReactNode;
}) {
  return (
    <div className="empty" role="status">
      <div className="empty-head">
        <span className="empty-icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <p className="empty-title">{title}</p>
          {children && <p className="empty-text">{children}</p>}
        </div>
        <span className="empty-pill">Ready for updates</span>
      </div>
      <div className={`ghost ghost-${kind}`} aria-hidden="true">
        {kind === "cards" &&
          GHOST_HUES.map((hue) => (
            <div key={hue} className="ghost-card" style={{ "--hue": hue } as CSSProperties}>
              <span className="ghost-thumb" />
              <span className="ghost-line" style={{ width: "72%" }} />
              <span className="ghost-line" />
              <span className="ghost-line" style={{ width: "48%" }} />
            </div>
          ))}
        {kind === "list" &&
          [0, 1].map((i) => (
            <div key={i} className="ghost-row">
              <span className="ghost-square" />
              <span className="ghost-lines">
                <span className="ghost-line" style={{ width: i ? "58%" : "76%" }} />
                <span className="ghost-line" style={{ width: "34%" }} />
              </span>
              <span className="ghost-pill" />
            </div>
          ))}
        {kind === "photos" &&
          [4 / 3, 4 / 3, 4 / 3].map((ratio, i) => (
            <span
              key={i}
              className="ghost-photo"
              style={{ aspectRatio: String(ratio), "--hue": GHOST_HUES[i] } as CSSProperties}
            />
          ))}
      </div>
    </div>
  );
}
