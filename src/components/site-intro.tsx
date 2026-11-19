import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getQuotations } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { QUOTATION_COUNT } from "@/lib/site-loading";

const FALLBACK = [
  { text: "Nature never did betray the heart that loved her.", source: "William Wordsworth, Tintern Abbey" },
  { text: "Indeed, with hardship comes ease.", source: "The Qur’an, 94:6" },
  { text: "One must imagine Sisyphus happy.", source: "Albert Camus, The Myth of Sisyphus" },
];

/** The three quotations of the opening sequence come from content/quotations.json (those marked "intro"). */
function openingQuotations() {
  const all = getQuotations();
  const chosen = [...all.filter((q) => q.intro), ...all.filter((q) => !q.intro)].slice(0, QUOTATION_COUNT);
  const list = chosen.length === QUOTATION_COUNT ? chosen : FALLBACK;
  return list.map((q, i) => ({ key: `${i}-${q.source}`, text: `“${q.text.replace(/^[“"]|[”"]$/g, "")}”`, source: q.source ? `— ${q.source}` : "" }));
}

const QUOTATIONS = openingQuotations();

export function SiteIntro() {
  const { t, num } = useI18n();
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
    <div className="site-intro" aria-label={t("Website loading")}>
      <span className="intro-mark" aria-hidden="true">tauhidul<span>.</span></span>
      <div className="intro-stage">
        <div className="intro-quotes" aria-live="off">
        {QUOTATIONS.map((quotation, position) => (
          <figure key={quotation.key} className={`intro-quotation${position === index ? " is-current" : ""}`} aria-hidden={position !== index}>
            <blockquote className="intro-line font-editorial">{quotation.text}</blockquote>
            <figcaption className="intro-source">{quotation.source}</figcaption>
          </figure>
        ))}
        </div>
        <div className="intro-meter">
          <div className={`intro-meter-label${ready ? " is-ready" : ""}`}>
            <span className="intro-counter" aria-hidden="true">{ready ? t("Ready") : `${num(String(index + 1).padStart(2, "0"))} / ${num(String(QUOTATION_COUNT).padStart(2, "0"))}`}</span>
            <span className="intro-percent">{num(progress)}<span>%</span></span>
          </div>
          <div className="intro-progress" role="progressbar" aria-label={t("Opening sequence progress")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={t("{n}% of the opening quotations shown", { n: progress })} data-full={ready ? "" : undefined} style={{ "--intro-fill": `${progress}%` } as CSSProperties}>
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
        </div>
      </div>
      <div className="intro-bottom">
        <Button variant="ghost" className={`intro-skip-btn${ready ? " is-ready" : ""}`} onClick={() => window.dispatchEvent(new Event("intro-dismiss"))}>{t("Enter site")} <ArrowUpRight aria-hidden="true" /></Button>
        <span className="intro-hint" aria-hidden="true">{t("or press Esc")}</span>
      </div>
    </div>
  );
}
