import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { CvRequestForm } from "@/components/cv-request-form";
import { Rich, useI18n } from "@/lib/i18n";
import { LINKEDIN } from "@/components/site-chrome";

/**
 * The contact area of the homepage. It shows either the contact form or, when the address ends in #request-cv,
 * the CV request form in the same place. Both forms stay mounted (one is hidden), so nothing a visitor typed is lost
 * when they switch, and the existing contact form is used exactly as it was.
 */
export function ContactPanel() {
  const { t } = useI18n();
  const hash = useLocation({ select: (l) => l.hash });
  // The server cannot see the #fragment, so the CV view only opens once the page is running in the browser.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const cv = ready && hash === "request-cv";

  const firstRun = useRef(true);
  const cvHeading = useRef<HTMLHeadingElement>(null);
  const cvLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!ready) return;
    if (firstRun.current) {
      firstRun.current = false;
      if (!cv) return;
    }
    // Move focus with the view: into the CV form when it opens, back to the "Request my CV" link when it closes.
    if (cv) cvHeading.current?.focus({ preventScroll: true });
    else cvLink.current?.focus({ preventScroll: true });
  }, [cv, ready]);

  return (
    <div id="request-cv" className="contact-layout">
      <div className="scroll-reveal">
        <div hidden={cv}>
          <h2 className="section-heading"><Rich text={t("Say\n*hello.*")} /></h2>
          <p className="section-intro"><Rich text={t("A question, a project, a collaboration,\nor a different way of seeing something.\nWrite to me.")} /></p>
          <Button asChild variant="link" className="text-link"><a href={LINKEDIN} target="_blank" rel="noreferrer">{t("Find me on LinkedIn")} <ArrowUpRight /></a></Button>
          <Button asChild variant="link" className="text-link"><Link ref={cvLink} to="/" hash="request-cv">{t("Request my CV")} <ArrowUpRight /></Link></Button>
        </div>
        <div hidden={!cv}>
          <h2 ref={cvHeading} tabIndex={-1} className="section-heading"><Rich text={t("Request my\n*CV.*")} /></h2>
          <p className="section-intro">{t("My CV is not published online. Tell me a little about yourself and why you would like it. I review every request personally and reply by email if I am able to share it.")}</p>
          <Button asChild variant="link" className="text-link"><Link to="/" hash="contact"><ArrowLeft /> {t("Back to contact")}</Link></Button>
        </div>
        <p className="contact-location"><Rich text={t("Based in Dhaka, Bangladesh.\nOpen to connections everywhere.")} /></p>
      </div>
      <div className="contact-form-wrap scroll-reveal">
        <div hidden={cv}><ContactForm /></div>
        <div hidden={!cv}><CvRequestForm /></div>
      </div>
    </div>
  );
}
