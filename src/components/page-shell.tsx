import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKEDIN = "https://www.linkedin.com/in/md-tauhidul-islam-910612331";

const NAV = [
  { label: "Writings", to: "/writings" },
  { label: "Library", to: "/library" },
  { label: "Activities", to: "/activities" },
  { label: "Notices", to: "/notices" },
] as const;

/** Header + footer for every page except the homepage and article pages. Reuses the homepage styles. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div id="top">
      <header className="site-header is-scrolled">
        <Link to="/" className="wordmark" aria-label="Tauhidul Islam, home">
          tauhidul<span className="text-muted-foreground">.</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="nav-link" activeProps={{ className: "nav-link is-active" }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-4">
          <Button asChild variant="ghost" className="header-contact rounded-none px-0">
            <Link to="/" hash="contact">Let's talk <ArrowUpRight /></Link>
          </Button>
        </div>
      </header>
      <nav aria-label="Sections" className="page-subnav md:hidden">
        <Link to="/">Home</Link>
        {NAV.map((item) => (
          <Link key={item.to} to={item.to} activeProps={{ className: "is-active" }}>{item.label}</Link>
        ))}
      </nav>
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-identity">
          <Link to="/" className="footer-name" aria-label="Tauhidul Islam, back to home">tauhidul.</Link>
          <p>Dhaka, Bangladesh.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <span className="micro-label">Explore</span>
          <Link to="/writings">Writings<ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/library">Library<ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/activities">Activities<ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/notices">Notices &amp; press releases<ArrowUpRight aria-hidden="true" /></Link>
        </nav>
        <div className="footer-connect">
          <span className="micro-label">Keep in touch</span>
          <Button asChild variant="link" className="footer-link"><Link to="/" hash="contact">Start a conversation <ArrowUpRight aria-hidden="true" /></Link></Button>
          <Button asChild variant="link" className="footer-link"><Link to="/cv-request">Request my CV <ArrowUpRight aria-hidden="true" /></Link></Button>
          <Button asChild variant="link" className="footer-link"><a href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight aria-hidden="true" /></a></Button>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Md Tauhidul Islam</p>
        <span>A life in progress.</span>
        <Button asChild variant="ghost" className="rounded-none px-0"><Link to="/" hash="top">Home</Link></Button>
      </div>
    </footer>
  );
}

export function PageIntro({ label, title, accent, children }: { label: string; title: string; accent?: string; children?: ReactNode }) {
  return (
    <section className="page-intro">
      <div className="section-label"><span>{label}</span><Link to="/library" className="page-intro-link">All sections</Link></div>
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
