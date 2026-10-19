import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QUOTE_INTERVAL_MS } from "@/lib/site-loading";

const QUOTATIONS = [
  { text: "“Nature never did betray the heart that loved her.”", source: "— William Wordsworth, Tintern Abbey" },
  { text: "“Indeed, with hardship comes ease.”", source: "— The Qur’an, 94:6, Sahih International translation" },
  { text: "“One must imagine Sisyphus happy.”", source: "— Albert Camus, The Myth of Sisyphus" },
] as const;

export function SiteIntro() {
  const [index, setIndex] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("intro-active") || root.classList.contains("intro-ready")) {
      setGone(true);
      return;
    }
    let removal = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const advance = window.setInterval(() => {
      if (!root.classList.contains("intro-ready")) setIndex((current) => Math.min(current + 1, QUOTATIONS.length - 1));
    }, QUOTE_INTERVAL_MS);
    const onFinished = () => {
      clearInterval(advance);
      removal = window.setTimeout(() => setGone(true), reduced ? 0 : 450);
    };
    window.addEventListener("intro-finished", onFinished);
    return () => {
      clearInterval(advance);
      clearTimeout(removal);
      window.removeEventListener("intro-finished", onFinished);
    };
  }, []);

  if (gone) return null;
  return (
    <div className="site-intro" aria-label="Website loading">
      <span className="intro-mark" aria-hidden="true">tauhidul<span>.</span></span>
      <div className="intro-stage" aria-live="off">
        {QUOTATIONS.map((quotation, position) => (
          <figure key={quotation.source} className={`intro-quotation${position === index ? " is-current" : ""}`} aria-hidden={position !== index}>
            <blockquote className="intro-line font-editorial">{quotation.text}</blockquote>
            <figcaption className="intro-source">{quotation.source}</figcaption>
          </figure>
        ))}
      </div>
      <div className="intro-bottom">
        <div className="intro-progress" role="status" aria-label="Loading website"><span aria-hidden="true" /></div>
        <Button variant="ghost" className="intro-skip-btn" onClick={() => window.dispatchEvent(new Event("intro-dismiss"))}>Enter site</Button>
      </div>
    </div>
  );
}