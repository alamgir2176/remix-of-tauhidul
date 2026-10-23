import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUOTATIONS = [
  { text: "“Nature never did betray the heart that loved her.”", source: "— William Wordsworth, Tintern Abbey" },
  { text: "“Indeed, with hardship comes ease.”", source: "— The Qur’an, 94:6, Sahih International translation" },
  { text: "“One must imagine Sisyphus happy.”", source: "— Albert Camus, The Myth of Sisyphus" },
] as const;

export function SiteIntro() {
  const [index, setIndex] = useState(0);
  const [gone, setGone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("intro-active") || root.classList.contains("intro-ready")) {
      setGone(true);
      return;
    }
    setIndex(Number(root.dataset["introQuote"] ?? 0) || 0);
    let removal = 0;
    const onProgress = () => setProgress(Number(root.dataset["introProgress"] ?? 0));
    // The head bootstrap owns the sequence; this overlay only mirrors it.
    const onQuotation = (event: Event) => setIndex((event as CustomEvent<number>).detail);
    onProgress();
    window.addEventListener("intro-progress", onProgress);
    window.addEventListener("intro-quotation", onQuotation);
    const onFinished = () => {
      removal = window.setTimeout(() => setGone(true), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450);
    };
    window.addEventListener("intro-finished", onFinished);
    return () => {
      clearTimeout(removal);
      window.removeEventListener("intro-finished", onFinished);
      window.removeEventListener("intro-progress", onProgress);
      window.removeEventListener("intro-quotation", onQuotation);
    };
  }, []);

  if (gone) return null;
  return (
    <div className="site-intro" aria-label="Website loading">
      <span className="intro-mark" aria-hidden="true">tauhidul<span>.</span></span>
      <div className="intro-stage">
        <div className="intro-quotes" aria-live="off">
        {QUOTATIONS.map((quotation, position) => (
          <figure key={quotation.source} className={`intro-quotation${position === index ? " is-current" : ""}`} aria-hidden={position !== index}>
            <blockquote className="intro-line font-editorial">{quotation.text}</blockquote>
            <figcaption className="intro-source">{quotation.source}</figcaption>
          </figure>
        ))}
        </div>
        <div className="intro-meter">
          <div className="intro-meter-label"><span>{progress === 100 ? "Ready" : "Loading"}</span><span className="intro-percent">{progress}<span>%</span></span></div>
          <div className="intro-progress" role="progressbar" aria-label="Website resources loaded" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={`${progress}% of readiness tasks complete`}>
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
        </div>
      </div>
      <div className="intro-bottom">
        <Button variant="ghost" className="intro-skip-btn" onClick={() => window.dispatchEvent(new Event("intro-dismiss"))}>Enter site <ArrowUpRight aria-hidden="true" /></Button>
      </div>
    </div>
  );
}
