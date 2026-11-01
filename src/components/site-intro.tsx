import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUOTATION_COUNT } from "@/lib/site-loading";

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
    setProgress(Number(root.dataset["introProgress"] ?? 0));
    let removal = 0;
    // The head bootstrap owns the sequence; this overlay only mirrors it.
    const onProgress = (event: Event) => setProgress((event as CustomEvent<number>).detail);
    const onQuotation = (event: Event) => setIndex((event as CustomEvent<number>).detail);
    const onFinished = () => {
      removal = window.setTimeout(() => setGone(true), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450);
    };
    window.addEventListener("intro-progress", onProgress);
    window.addEventListener("intro-quotation", onQuotation);
    window.addEventListener("intro-finished", onFinished);
    return () => {
      clearTimeout(removal);
      window.removeEventListener("intro-progress", onProgress);
      window.removeEventListener("intro-quotation", onQuotation);
      window.removeEventListener("intro-finished", onFinished);
    };
  }, []);

  if (gone) return null;
  const ready = progress === 100;
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
          <div className={`intro-meter-label${ready ? " is-ready" : ""}`}>
            <span className="intro-counter" aria-hidden="true">{ready ? "Ready" : `${String(index + 1).padStart(2, "0")} / ${String(QUOTATION_COUNT).padStart(2, "0")}`}</span>
            <span className="intro-percent">{progress}<span>%</span></span>
          </div>
          <div className="intro-progress" role="progressbar" aria-label="Opening sequence progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={`${progress}% of the opening quotations shown`} data-full={ready ? "" : undefined} style={{ "--intro-fill": `${progress}%` } as CSSProperties}>
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
        </div>
      </div>
      <div className="intro-bottom">
        <Button variant="ghost" className="intro-skip-btn" onClick={() => window.dispatchEvent(new Event("intro-dismiss"))}>Enter site <ArrowUpRight aria-hidden="true" /></Button>
        <span className="intro-hint" aria-hidden="true">or press Esc</span>
      </div>
    </div>
  );
}
