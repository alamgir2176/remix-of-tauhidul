import { useEffect, useState, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUp, ArrowUpRight, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OPEN_SEARCH_EVENT } from "@/components/search-launcher";
import { LanguageChoice, LanguageToggle } from "@/components/language-switch";
import { useI18n } from "@/lib/i18n";
import { ThemeCycle, ThemeSwitcher } from "@/components/theme-switcher";

export const LINKEDIN = "https://www.linkedin.com/in/md-tauhidul-islam-910612331";

/** One menu for the whole website. Every item is a section of the homepage. */
export const NAV = [
  ["The person", "about"],
  ["Writing & work", "library"],
  ["Perspective", "perspective"],
  ["Beyond the page", "beyond"],
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
  const { t, num } = useI18n();
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
      <Link to="/" hash="top" className="wordmark" aria-label={t("Tauhidul Islam, home")}>tauhidul<span className="text-muted-foreground">.</span></Link>
      <nav aria-label={t("Primary")} className="hidden items-center gap-8 xl:flex">
        {NAV.map(([label, id]) => (
          <Link to="/" hash={id} key={id} className={`nav-link${active === id ? " is-active" : ""}`} aria-current={active === id ? "location" : undefined}>{t(label)}</Link>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-4">
        <button type="button" className="header-search" aria-label={t("Search this website")} title={t("Search this website (Ctrl K)")} onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}><Search aria-hidden="true" /></button>
        <LanguageToggle />
        <div className="header-theme-compact"><ThemeCycle /></div>
        <Button asChild variant="ghost" className="header-contact rounded-none px-0"><Link to="/" hash="contact">{t("Let's talk")} <ArrowUpRight /></Link></Button>
        <Button variant="ghost" size="icon" className="xl:hidden" aria-label={menuOpen ? t("Close menu") : t("Open menu")} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
      </div>
      {menuOpen && (
        <nav id="mobile-menu" aria-label={t("Mobile")} className="mobile-menu">
          {[...NAV, ["Let’s talk", "contact"] as const].map(([label, id], i) => (
            <Link to="/" hash={id} key={id} className={active === id ? "is-active" : undefined} aria-current={active === id ? "location" : undefined} style={{ animationDelay: `${60 + i * 60}ms` }} onClick={() => setMenuOpen(false)}><span>{num(0)}{num(i + 1)}</span>{t(label)}<ArrowUpRight /></Link>
          ))}
          <div className="mobile-menu-lang"><LanguageChoice /></div>
          <p className="mobile-menu-note"><span>{t("Dhaka, Bangladesh")}</span><a href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn ↗</a></p>
        </nav>
      )}
    </header>
  );
}

/** The same footer on every page. */
export function SiteFooter() {
  const { t, num } = useI18n();
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-identity"><Link to="/" hash="top" className="footer-name" aria-label={t("Tauhidul Islam, back to home")}>{t("tauhidul")}<span>.</span></Link><p>{t("Philosophy, theatre and everyday life.")}</p><p className="footer-place">{t("Dhaka, Bangladesh")}</p><div className="footer-theme"><span className="micro-label">{t("Theme")}</span><ThemeSwitcher labeled /></div><div className="footer-theme"><span className="micro-label">{t("Language")}</span><LanguageChoice /></div></div>
        <nav className="footer-nav" aria-label={t("Footer")}>
          <span className="micro-label">{t("The website")}</span>
          {NAV.map(([label, id]) => <Link to="/" hash={id} key={id}>{t(label)}<ArrowUpRight aria-hidden="true" /></Link>)}
        </nav>
        <nav className="footer-nav footer-more" aria-label={t("More to explore")}>
          <span className="micro-label">{t("More to explore")}</span>
          <Link to="/writings">{t("All writings")}<ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/quotations">{t("Quotations")}<ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/now">{t("Now")}<ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/media">{t("Media kit")}<ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/" hash="questions">{t("Visitor questions")}<ArrowUpRight aria-hidden="true" /></Link>
        </nav>
        <div className="footer-connect">
          <span className="micro-label">{t("Keep in touch")}</span>
          <Button asChild variant="link" className="footer-link"><Link to="/" hash="contact">{t("Start a conversation")} <ArrowUpRight aria-hidden="true" /></Link></Button>
          <Button asChild variant="link" className="footer-link"><Link to="/" hash="request-cv">{t("Request my CV")} <ArrowUpRight aria-hidden="true" /></Link></Button>
          <Button asChild variant="link" className="footer-link"><a href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight aria-hidden="true" /></a></Button>
        </div>
      </div>
      <div className="footer-bottom"><p>© {num(new Date().getFullYear())} {t("Md Tauhidul Islam")}</p><span>{t("A life in progress.")}</span><Button asChild variant="ghost" className="footer-top"><Link to="/" hash="top">{t("Back to top")} <ArrowUp aria-hidden="true" /></Link></Button></div>
    </footer>
  );
}
