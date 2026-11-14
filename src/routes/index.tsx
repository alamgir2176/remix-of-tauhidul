import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Plus, Minus } from "lucide-react";
import navy from "@/assets/portrait-navy.jpg.asset.json";
import studioWide from "@/assets/portrait-studio-wide.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { ActivitiesSection, NoticesSection, WritingSection } from "@/components/home-sections";
import { SiteFooter, SiteHeader, LINKEDIN } from "@/components/site-chrome";
import { VisitorFaq } from "@/components/visitor-faq";
import { portraitUrl } from "@/lib/portrait-url";
import { profileJsonLd, publicHomepage } from "@/lib/site-metadata";

const HOMEPAGE = publicHomepage(import.meta.env['VITE_SITE_URL']);

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Md Tauhidul Islam — Philosophy graduate in Dhaka" },
    { name: "description", content: "Thoughts, writing, theatre and community work from Md Tauhidul Islam, a philosophy graduate in Dhaka. Say hello." },
    { name: "keywords", content: "Md Tauhidul Islam, Tauhidul Islam, philosophy, Jahangirnagar University, Dhaka, personal website, creative collaboration, professional networking" },
    { property: "og:title", content: "Md Tauhidul Islam — Philosophy graduate in Dhaka" },
    { property: "og:description", content: "Philosophy, theatre and everyday life, from Dhaka. Read what Md Tauhidul Islam thinks about, and get in touch." },
    { property: "og:type", content: "profile" },
    { property: "og:site_name", content: "Md Tauhidul Islam" },
    ...(HOMEPAGE ? [{ property: "og:url", content: HOMEPAGE }] : []),
    { property: "og:locale", content: "en_US" },
    { name: "twitter:title", content: "Md Tauhidul Islam — Philosophy graduate in Dhaka" },
    { name: "twitter:description", content: "Philosophy, theatre and everyday life, from Dhaka. Read what Md Tauhidul Islam thinks about, and get in touch." },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: HOMEPAGE ? [{ rel: "canonical", href: HOMEPAGE }] : [],
  scripts: [{ type: "application/ld+json", children: JSON.stringify(profileJsonLd()) }] }),
  component: Index,
});

/** Transparent cut-out of the hero portrait (public/portraits), so it sits directly on the themed hero artwork. */
const HERO_CUTOUT = { url: "", original_filename: "portrait-navy-2-cutout.webp" };

const SECTIONS = ["about", "perspective", "beyond", "library", "notices", "activities", "contact"];
const PERSPECTIVES = [
  { title: "Question it first.", subtitle: "PHILOSOPHY & ANALYSIS", text: "Logic, ethics and the philosophy of mind taught me to define my terms before arguing, and to explain a hard idea in plain words.", detail: "Logic · Ethics · Philosophy of mind · Clear writing" },
  { title: "Think about technology.", subtitle: "TECHNOLOGY & SOCIETY", text: "My MA covered cyber ethics and the philosophy of mind and language. I like asking what new tools, AI included, change about how people think and live.", detail: "Ethics of technology · AI · Language · The environment" },
  { title: "Work with people.", subtitle: "PEOPLE & COMMUNITY", text: "Student events, admission helpdesks and community drives taught me to listen first, stay organised and turn up when people need a hand.", detail: "Events · Teamwork · Community work · Communication" },
];

function Index() {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [backgroundOpen, setBackgroundOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState("");
  const progress = useRef<HTMLSpanElement>(null);
  const heroPhoto = useRef<HTMLImageElement>(null);
  const interludeBg = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
    }, { threshold: 0, rootMargin: "0px 0px 40px 0px" });
    document.querySelectorAll(".scroll-reveal").forEach((el) => { if (!reduced) el.classList.add("reveal-ready"); observer.observe(el); });
    setScrolled(window.scrollY > 24);
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) sectionObserver.observe(el); });
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        if (!reduced && heroPhoto.current) heroPhoto.current.style.transform = window.innerWidth >= 900 ? `translateY(${Math.min(window.scrollY * 0.12, 100)}px)` : "";
        if (!reduced && interludeBg.current) {
          const rect = interludeBg.current.getBoundingClientRect();
          const passed = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
          interludeBg.current.style.transform = `scale(1.12) translateY(${(0.5 - passed) * 48}px)`;
        }
        const y = window.scrollY;
        setScrolled(y > 24);
        setHidden(y > 400 && y > lastY + 4 ? true : y < lastY - 4 || y < 400 ? false : (h) => h);
        lastY = y;
        if (progress.current) { const max = document.documentElement.scrollHeight - window.innerHeight; progress.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`; }
        frame = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer.disconnect(); sectionObserver.disconnect(); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);

  return (
    <div id="top">
      <Link to="/" hash="main" className="skip-link" onClick={() => document.getElementById("main")?.focus()}>Skip to content</Link>
      <SiteHeader active={active} scrolled={scrolled} hidden={hidden} progressRef={progress} />
      <main id="main" tabIndex={-1}>
        <section className="identity-hero" aria-label="Introduction">
          <div className="hero-art" aria-hidden="true">
            <svg viewBox="0 0 800 800" preserveAspectRatio="xMaxYMid slice" focusable="false">
              <path className="art-blob" d="M330 80C470-10 700 30 790 190L800 800H240C200 640 130 520 170 360 200 230 230 150 330 80Z" />
              <path className="art-wave" d="M0 800C120 560 300 520 470 560 620 595 720 520 800 400V800Z" />
              <path className="art-corner" d="M600 0C660 110 740 190 800 230V0Z" />
              <path className="art-arc" pathLength="1" d="M120 720C70 430 190 170 430 80" />
              <path className="art-arc art-arc-2" pathLength="1" d="M190 740C150 480 250 250 470 150" />
            </svg>
          </div>
          <div className="hero-image"><img ref={heroPhoto} src={portraitUrl(HERO_CUTOUT)} alt="Portrait of Md Tauhidul Islam wearing a navy suit and tie" fetchPriority="high" className="photo-mono" /></div>
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-topline"><span>A personal perspective</span><span>Dhaka, Bangladesh</span></div>
          <div className="hero-copy">
            <p className="hero-intro enter">BA &amp; MA in Philosophy · Jahangirnagar University</p>
            <h1 className="enter">Md Tauhidul<br /><span className="font-editorial italic">Islam.</span></h1>
            <div className="hero-bottom enter"><p>Philosophy, theatre, and everyday life.<br />A story rooted in Bangladesh.</p><Link to="/" hash="about" className="hero-cta" aria-label="View my journey: discover my story">View My Journey <ArrowRight aria-hidden="true" /></Link></div>
          </div>
          <span className="hero-index">01 / A life in progress</span>
        </section>

        <section id="about" className="about-section section-space"><span className="section-mark" aria-hidden="true">01</span><div className="section-label"><span>01 — The person</span><span>More than a title</span></div>
          <div className="about-layout">
            <div className="scroll-reveal"><h2 className="statement">Philosophy, books<br />and <span className="font-editorial italic">people.</span></h2><p className="about-lead">I’m Tauhidul. I studied philosophy at Jahangirnagar University, both my BA and MA, and I’m still interested in the same few questions: how we think, how we live together, and what technology is doing to both.</p><div className="about-body"><p>Outside lectures I spent a few years with student groups, running admission helpdesks, organising welcome events and handing out winter clothes. I also spent some time on stage with Jahangirnagar Theatre.</p><p>I’m from Bangladesh. I read mostly Bengali novels, I like seeing how people live in places I haven’t been, and I’m happy to talk about any of it.</p></div><Button asChild variant="link" className="text-link"><a href={LINKEDIN} target="_blank" rel="noreferrer">Find me on LinkedIn <ArrowUpRight /></a></Button></div>
          </div>
        </section>

        <section id="perspective" className="perspective-section">
          <div className="perspective-banner section-space">
            <span className="section-mark" aria-hidden="true">02</span>
            <div className="section-label"><span>02 — Perspective</span><span>A way of approaching the world</span></div>
            <div className="perspective-banner-grid">
              <div className="perspective-banner-copy scroll-reveal"><h2 className="section-heading">How I see<br /><span className="font-editorial italic">things.</span></h2><p className="section-intro">Not a list of skills. Three habits that<br className="hidden sm:block" /> shape how I think and work.</p></div>
              <figure className="perspective-figure scroll-reveal"><img src="/images/site/perspective-banner.jpg" alt="Two paperback classics, Kafka’s The Trial and Orwell’s 1984, with a small plant on a white table" width={1376} height={768} loading="lazy" decoding="async" onError={(e) => { const f = e.currentTarget.closest("figure"); if (f) (f as HTMLElement).style.display = "none"; }} /></figure>
            </div>
          </div>
          <div className="perspective-body section-space">
            <div className="perspective-list scroll-reveal">{PERSPECTIVES.map((item, i) => <article key={item.title} className="perspective-item"><Button variant="ghost" className="perspective-trigger" aria-expanded={expanded === i} aria-controls={`perspective-${i}`} onClick={() => setExpanded(expanded === i ? null : i)}><span className="item-number">0{i + 1}</span><span>{item.title}</span>{expanded === i ? <Minus /> : <Plus />}</Button><div id={`perspective-${i}`} hidden={expanded !== i} className="perspective-detail"><p className="micro-label">{item.subtitle}</p><p>{item.text}</p><p className="detail-tools">{item.detail}</p></div></article>)}</div>
          </div>
        </section>

        <section id="beyond" className="beyond-section section-space"><span className="section-mark" aria-hidden="true">03</span>
          <div className="section-label"><span>03 — Beyond the page</span><span>Stage, community and books</span></div>
          <h2 className="section-heading scroll-reveal">Beyond<br />the <span className="font-editorial italic">classroom.</span></h2>
          <div className="beyond-layout"><figure className="beyond-portrait scroll-reveal"><img src={portraitUrl(navy)} alt="Portrait of Md Tauhidul Islam in a navy suit with a maroon tie" loading="lazy" className="photo-mono" /><figcaption>Still learning. Still listening.</figcaption></figure><div className="experience-stories"><article className="scroll-reveal"><span className="micro-label">On the stage</span><h3>Jahangirnagar Theatre.</h3><p>In 2018 I helped organise a theatre festival that brought university and other groups from across Bangladesh to Jahangirnagar, and I acted in “Nikhoj Songbad” at Selim Al Din Muktomoncho.</p></article><article className="scroll-reveal"><span className="micro-label">In the community</span><h3>Student and community work.</h3><p>With the Barishal Divisional Students Welfare Association I helped give winter clothes to 300 people and ran admission-test helpdesks. With Bandhan I donated blood and helped connect people who needed it with donors.</p></article><article className="scroll-reveal"><span className="micro-label">In the everyday</span><h3>Books and places.</h3><p>I collect Bengali novels, mostly, and I like travelling to see how people live somewhere new.</p></article></div></div>
          <div className="background-row"><div><span className="micro-label">The foundation</span><p>BA and MA in Philosophy.<br /><span className="text-muted-foreground">Jahangirnagar University.</span></p></div><Button variant="ghost" className="background-toggle" aria-expanded={backgroundOpen} aria-controls="background-details" onClick={() => setBackgroundOpen(!backgroundOpen)}>Education & continued learning {backgroundOpen ? <Minus /> : <Plus />}</Button></div>
          <div id="background-details" hidden={!backgroundOpen} className="background-details"><div><h3>Education</h3>{[["M.A. in Philosophy", "Jahangirnagar University, Dhaka"],["B.A. in Philosophy", "Jahangirnagar University, Dhaka"],["HSC, Humanities", "Govt. Syed Hatem Ali College, Barishal"],["SSC, Humanities", "Amua Bandar Amir Molla Secondary School, Jhalokati"]].map(([title, school]) => <div key={title}><p>{title}</p><span>{school}</span></div>)}</div><div><h3>Continued learning</h3>{[["Generative AI Mastermind", "Outskill · 2025"],["Fundamentals of Digital Marketing", "Google Digital Garage · 2021"],["Elements of AI", "University of Helsinki & Reaktor · 2021"],["Learn Blockchain Features in a Simple Way", "upGrad · 2021"],["Covid-19 Awareness and Prevention", "Muktopaath"]].map(([title, school]) => <div key={title}><p>{title}</p><span>{school}</span></div>)}</div></div>
        </section>

        <WritingSection />
        <NoticesSection />
        <ActivitiesSection />

        <section className="interlude" aria-label="A continuing story"><div className="interlude-bg" aria-hidden="true"><img ref={interludeBg} src={portraitUrl(studioWide)} alt="" loading="lazy" className="photo-mono" /></div><div className="interlude-inner scroll-reveal"><span className="micro-label">A continuing story</span><p>Still reading.<br />Still <span className="font-editorial italic">asking.</span></p><span>Questions are always welcome.</span></div></section>

        <section id="contact" className="contact-section section-space"><span className="section-mark" aria-hidden="true">07</span><div className="section-label"><span>07 — Get in touch</span><span>Work, ideas, or just hello</span></div><div className="contact-layout"><div className="scroll-reveal"><h2 className="section-heading">Say<br /><span className="font-editorial italic">hello.</span></h2><p className="section-intro">A question, a project, a collaboration,<br />or a different way of seeing something.<br />Write to me.</p><Button asChild variant="link" className="text-link"><a href={LINKEDIN} target="_blank" rel="noreferrer">Find me on LinkedIn <ArrowUpRight /></a></Button><Button asChild variant="link" className="text-link"><Link to="/cv-request">Request my CV <ArrowUpRight /></Link></Button><p className="contact-location">Based in Dhaka, Bangladesh.<br />Open to connections everywhere.</p></div><div className="contact-form-wrap scroll-reveal"><ContactForm /></div></div><VisitorFaq /></section>
      </main>
      <SiteFooter />
    </div>
  );
}
