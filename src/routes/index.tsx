import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Plus, Minus } from "lucide-react";
import navy2 from "@/assets/portrait-navy-2.jpg.asset.json";
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
    { title: "Md Tauhidul Islam — Ideas, People & Possibilities" },
    { name: "description", content: "The personal world of Md Tauhidul Islam. A philosophy graduate in Dhaka exploring ideas, connecting with people, and making meaningful contributions." },
    { name: "keywords", content: "Md Tauhidul Islam, Tauhidul Islam, philosophy, Jahangirnagar University, Dhaka, personal website, creative collaboration, professional networking" },
    { property: "og:title", content: "Md Tauhidul Islam — Ideas, People & Possibilities" },
    { property: "og:description", content: "An independent perspective on ideas, people and possibilities. Discover the story of Md Tauhidul Islam and start a conversation." },
    { property: "og:type", content: "profile" },
    { property: "og:site_name", content: "Md Tauhidul Islam" },
    ...(HOMEPAGE ? [{ property: "og:url", content: HOMEPAGE }] : []),
    { property: "og:locale", content: "en_US" },
    { name: "twitter:title", content: "Md Tauhidul Islam — Ideas, People & Possibilities" },
    { name: "twitter:description", content: "A philosophy graduate in Dhaka exploring ideas, people, and meaningful possibilities." },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: HOMEPAGE ? [{ rel: "canonical", href: HOMEPAGE }] : [],
  scripts: [{ type: "application/ld+json", children: JSON.stringify(profileJsonLd()) }] }),
  component: Index,
});

const SECTIONS = ["about", "perspective", "beyond", "library", "notices", "activities", "contact"];
const PERSPECTIVES = [
  { title: "Think deeply.", subtitle: "PHILOSOPHY & ANALYSIS", text: "Philosophy trained me to read slowly, question what seems obvious, and say complicated things plainly.", detail: "Critical thinking · Analysis · Problem-solving · Clear writing" },
  { title: "Connect honestly.", subtitle: "PEOPLE & COMMUNICATION", text: "Most misunderstandings begin with not listening. I try to hear people out fully, speak with care, and carry my share when working with others.", detail: "Active listening · Communication · Teamwork · Leadership" },
  { title: "Keep exploring.", subtitle: "CREATIVITY & DIGITAL", text: "Curiosity doesn't stay in one discipline. I make digital content and simple designs, build with WordPress, and keep an eye on where new technology is heading.", detail: "Canva · WordPress · Digital content · Microsoft Office" },
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
        if (!reduced && heroPhoto.current) heroPhoto.current.style.transform = `translateY(${Math.min(window.scrollY * 0.12, 100)}px)`;
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
          <div className="hero-image"><img ref={heroPhoto} src={portraitUrl(navy2)} alt="Black-and-white portrait of Md Tauhidul Islam wearing a navy suit and tie" fetchPriority="high" className="photo-mono" /></div>
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-topline"><span>A personal perspective</span><span>Dhaka, Bangladesh</span></div>
          <div className="hero-copy">
            <p className="hero-intro enter">Philosophy graduate · Jahangirnagar University</p>
            <h1 className="enter">Md Tauhidul<br /><span className="font-editorial italic">Islam.</span></h1>
            <div className="hero-bottom enter"><p>Philosophy, theatre, and everyday life.<br />A story rooted in Bangladesh.</p><Link to="/" hash="about" className="round-link" aria-label="Discover my story"><ArrowDown /></Link></div>
          </div>
          <span className="hero-index">01 / A life in progress</span>
        </section>

        <section id="about" className="about-section section-space"><span className="section-mark" aria-hidden="true">01</span><div className="section-label"><span>01 — The person</span><span>More than a title</span></div>
          <div className="about-layout">
            <div className="scroll-reveal"><h2 className="statement">Thoughtful by nature.<br />Curious by <span className="font-editorial italic">choice.</span></h2><p className="about-lead">I’m Tauhidul — a philosophy graduate drawn to the places where big ideas meet everyday life — and the people living it.</p><div className="about-body"><p>My roots are in Bangladesh. My outlook is shaped by philosophy, literature, community, and the simple belief that there is always more to understand.</p><p>Philosophy taught me to pause before deciding what something means. I try to carry that habit everywhere — into a difficult text, a new project, or a conversation with someone I’ve only just met.</p></div><Button asChild variant="link" className="text-link"><a href={LINKEDIN} target="_blank" rel="noreferrer">A conversation starts here <ArrowUpRight /></a></Button></div>
          </div>
        </section>

        <section id="perspective" className="perspective-section section-space"><span className="section-mark" aria-hidden="true">02</span><div className="section-label"><span>02 — Perspective</span><span>A way of approaching the world</span></div>
          <div className="perspective-layout"><div className="scroll-reveal"><h2 className="section-heading">Ideas matter.<br /><span className="font-editorial italic">People, more.</span></h2><p className="section-intro">Not a list of skills. A way of thinking,<br className="hidden sm:block" /> working, and moving forward.</p></div><div className="perspective-list scroll-reveal">{PERSPECTIVES.map((item, i) => <article key={item.title} className="perspective-item"><Button variant="ghost" className="perspective-trigger" aria-expanded={expanded === i} aria-controls={`perspective-${i}`} onClick={() => setExpanded(expanded === i ? null : i)}><span className="item-number">0{i + 1}</span><span>{item.title}</span>{expanded === i ? <Minus /> : <Plus />}</Button><div id={`perspective-${i}`} hidden={expanded !== i} className="perspective-detail"><p className="micro-label">{item.subtitle}</p><p>{item.text}</p><p className="detail-tools">{item.detail}</p></div></article>)}</div></div>
        </section>

        <section id="beyond" className="beyond-section section-space"><span className="section-mark" aria-hidden="true">03</span>
          <div className="section-label"><span>03 — Beyond the page</span><span>What makes me, me</span></div>
          <h2 className="section-heading scroll-reveal">A life isn't a résumé.<br />It's a collection of <span className="font-editorial italic">experiences.</span></h2>
          <div className="beyond-layout"><figure className="beyond-portrait scroll-reveal"><img src={portraitUrl(navy)} alt="Black-and-white portrait of Md Tauhidul Islam in a navy suit with a maroon tie" loading="lazy" className="photo-mono" /><figcaption>Still learning. Still listening.</figcaption></figure><div className="experience-stories"><article className="scroll-reveal"><span className="micro-label">On the stage</span><h3>A different kind of voice.</h3><p>As a member of Jahangirnagar Theatre, I helped bring theatre festivals to life and performed in “Nikhoj Songbad” at Selim Al Din Muktomoncho. A reminder that expression goes well beyond words on a page.</p></article><article className="scroll-reveal"><span className="micro-label">In the community</span><h3>Small actions. Real meaning.</h3><p>From winter-clothing drives and student welcome events to volunteering with Bandhan’s blood-donation initiatives — belonging, I’ve found, is something you take part in.</p></article><article className="scroll-reveal"><span className="micro-label">In the everyday</span><h3>Books, places, perspectives.</h3><p>A growing collection of Bengali novels. An interest in unfamiliar cultures and landscapes. The things I return to are the things that keep widening my world.</p></article></div></div>
          <div className="background-row"><div><span className="micro-label">The foundation</span><p>Rooted in philosophy.<br /><span className="text-muted-foreground">Jahangirnagar University.</span></p></div><Button variant="ghost" className="background-toggle" aria-expanded={backgroundOpen} aria-controls="background-details" onClick={() => setBackgroundOpen(!backgroundOpen)}>Education & continued learning {backgroundOpen ? <Minus /> : <Plus />}</Button></div>
          <div id="background-details" hidden={!backgroundOpen} className="background-details"><div><h3>Education</h3>{[["M.A. in Philosophy", "Jahangirnagar University, Dhaka"],["B.A. in Philosophy", "Jahangirnagar University, Dhaka"],["HSC, Humanities", "Govt. Syed Hatem Ali College, Barishal"],["SSC, Humanities", "Amua Bandar Amir Molla Secondary School, Jhalokati"]].map(([title, school]) => <div key={title}><p>{title}</p><span>{school}</span></div>)}</div><div><h3>Continued learning</h3>{[["Fundamentals of Digital Marketing", "Google Digital Garage · 2021"],["Elements of AI", "University of Helsinki & Reaktor · 2021"],["Learn Blockchain Features in a Simple Way", "upGrad · 2021"],["Covid-19 Awareness and Prevention", "Muktopaath"]].map(([title, school]) => <div key={title}><p>{title}</p><span>{school}</span></div>)}</div></div>
        </section>

        <WritingSection />
        <NoticesSection />
        <ActivitiesSection />

        <section className="interlude" aria-label="A continuing story"><div className="interlude-bg" aria-hidden="true"><img ref={interludeBg} src={portraitUrl(studioWide)} alt="" loading="lazy" className="photo-mono" /></div><div className="interlude-inner scroll-reveal"><span className="micro-label">A continuing story</span><p>Stay curious.<br />Stay <span className="font-editorial italic">human.</span></p><span>Ideas evolve. So do we.</span></div></section>

        <section id="contact" className="contact-section section-space"><span className="section-mark" aria-hidden="true">07</span><div className="section-label"><span>07 — The next conversation</span><span>Good things start with hello</span></div><div className="contact-layout"><div className="scroll-reveal"><h2 className="section-heading">Something<br />on your <span className="font-editorial italic">mind?</span></h2><p className="section-intro">An idea, an opportunity, a collaboration.<br />Or simply a different perspective.<br />I'd love to hear from you.</p><Button asChild variant="link" className="text-link"><a href={LINKEDIN} target="_blank" rel="noreferrer">Find me on LinkedIn <ArrowUpRight /></a></Button><Button asChild variant="link" className="text-link"><Link to="/cv-request">Request my CV <ArrowUpRight /></Link></Button><p className="contact-location">Based in Dhaka, Bangladesh.<br />Open to connections everywhere.</p></div><div className="contact-form-wrap scroll-reveal"><ContactForm /></div></div><VisitorFaq /></section>
      </main>
      <SiteFooter />
    </div>
  );
}
