import { useEffect, useState, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUp, ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const LINKEDIN = "https://www.linkedin.com/in/md-tauhidul-islam-910612331";

/** One menu for the whole website. Every item is a section of the homepage. */
export const NAV = [
  ["The person", "about"],
  ["Perspective", "perspective"],
  ["Beyond the page", "beyond"],
  ["Writing & work", "library"],
  ["Updates", "notices"],
  ["Activities", "activities"],
] as const;

interface HeaderProps {
  /** id of the highlighted menu item (a homepage section id) */
  active?: string;
  scrolled?: boolean;
  hidden?: boolean;
  progressRef?: RefObject<HTMLSpanElement | null>;
}

/** The same header on the homepage, the content pages and the article pages. */
export function SiteHeader({ active = "", scrolled = true, hidden = false, progressRef }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    // Capture phase: page-level handlers can stop key events from bubbling back to the document.
    document.addEventListener("keydown", onKey, true);
    document.documentElement.classList.add("menu-open");
    return () => { document.removeEventListener("keydown", onKey, true); document.documentElement.classList.remove("menu-open"); };
  }, [menuOpen]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${hidden && !menuOpen ? " is-hidden" : ""}`}>
      {progressRef && <span ref={progressRef} className="header-progress" aria-hidden="true" />}
      <Link to="/" hash="top" className="wordmark" aria-label="Tauhidul Islam, home">tauhidul<span className="text-muted-foreground">.</span></Link>
      <nav aria-label="Primary" className="hidden items-center gap-8 xl:flex">
        {NAV.map(([label, id]) => (
          <Link to="/" hash={id} key={id} className={`nav-link${active === id ? " is-active" : ""}`} aria-current={active === id ? "location" : undefined}>{label}</Link>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-4">
        <div className="header-theme"><ThemeSwitcher /></div>
        <Button asChild variant="ghost" className="header-contact rounded-none px-0"><Link to="/" hash="contact">Let's talk <ArrowUpRight /></Link></Button>
        <Button variant="ghost" size="icon" className="xl:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
      </div>
      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobile" className="mobile-menu">
          {[...NAV, ["Let’s talk", "contact"] as const].map(([label, id], i) => (
            <Link to="/" hash={id} key={id} style={{ animationDelay: `${60 + i * 60}ms` }} onClick={() => setMenuOpen(false)}><span>0{i + 1}</span>{label}<ArrowUpRight /></Link>
          ))}
          <div className="mobile-theme"><p className="micro-label">Theme</p><ThemeSwitcher labeled /></div>
          <p className="mobile-menu-note"><span>Dhaka, Bangladesh</span><a href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn ↗</a></p>
        </nav>
      )}
    </header>
  );
}

/** The same footer on every page. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-identity"><Link to="/" hash="top" className="footer-name" aria-label="Tauhidul Islam, back to home">tauhidul.</Link><p>Dhaka, Bangladesh.</p></div>
        <nav className="footer-nav" aria-label="Footer">
          <span className="micro-label">Explore</span>
          {NAV.map(([label, id]) => <Link to="/" hash={id} key={id}>{label}<ArrowUpRight aria-hidden="true" /></Link>)}
          <Link to="/" hash="questions">Visitor questions<ArrowUpRight aria-hidden="true" /></Link>
        </nav>
        <div className="footer-connect">
          <span className="micro-label">Keep in touch</span>
          <Button asChild variant="link" className="footer-link"><Link to="/" hash="contact">Start a conversation <ArrowUpRight aria-hidden="true" /></Link></Button>
          <Button asChild variant="link" className="footer-link"><Link to="/cv-request">Request my CV <ArrowUpRight aria-hidden="true" /></Link></Button>
          <Button asChild variant="link" className="footer-link"><a href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight aria-hidden="true" /></a></Button>
        </div>
      </div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} Md Tauhidul Islam</p><span>A life in progress.</span><Button asChild variant="ghost" className="rounded-none px-0"><Link to="/" hash="top">Back to top <ArrowUp aria-hidden="true" /></Link></Button></div>
    </footer>
  );
}
