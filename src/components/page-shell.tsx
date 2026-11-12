import type { ReactNode } from "react";
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
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({ number, label, title, accent, children }: { number: string; label: string; title: string; accent?: string; children?: ReactNode }) {
  return (
    <section className="page-intro">
      <span className="section-mark" aria-hidden="true">{number}</span>
      <div className="section-label"><span>{number} — {label}</span><Link to="/" hash="top" className="page-intro-link">Back to home</Link></div>
      <h1 className="section-heading">
        {title}
        {accent && <><br /><span className="font-editorial italic">{accent}</span></>}
      </h1>
      {children && <p className="section-intro">{children}</p>}
    </section>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state-mark" aria-hidden="true">—</span>
      <p className="empty-state-title">{title}</p>
      {children && <p className="empty-state-text">{children}</p>}
    </div>
  );
}
