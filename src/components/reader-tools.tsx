import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, Minus, Plus, Square } from "lucide-react";

const SCALE_KEY = "tauhidul-reader-scale";
const SCALES = [0.9, 1, 1.12, 1.25, 1.4];

function readScale(): number {
  try {
    const v = Number(window.localStorage.getItem(SCALE_KEY));
    return SCALES.includes(v) ? v : 1;
  } catch {
    return 1;
  }
}

/** Splits text into pieces short enough for every browser's speech engine. */
function pieces(text: string): string[] {
  return (text.match(/[^.!?।\n]+[.!?।]?/g) ?? []).map((t) => t.trim()).filter(Boolean).flatMap((t) => (t.length > 220 ? t.match(/.{1,200}(\s|$)/g) ?? [t] : [t]));
}

/** Reading comfort: a thin progress line, text size, and the browser's own read-aloud. Nothing is downloaded. */
export function ReaderTools() {
  const [scale, setScale] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);
  const run = useRef(0);

  useEffect(() => {
    setScale(readScale());
    setCanSpeak("speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined");
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--reader-scale", String(scale));
    return () => document.documentElement.style.removeProperty("--reader-scale");
  }, [scale]);

  // Progress through the article body.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const body = document.querySelector<HTMLElement>(".article-body");
      if (!body || !bar.current) return;
      const rect = body.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = total > 0 ? Math.min(1, Math.max(0, (window.innerHeight * 0.2 - rect.top) / total)) : 0;
      bar.current.style.transform = `scaleX(${done})`;
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, []);

  const stop = useCallback(() => {
    run.current += 1;
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    setSpeaking(false);
  }, []);
  useEffect(() => stop, [stop]);

  function listen() {
    if (speaking) { stop(); return; }
    const body = document.querySelector<HTMLElement>(".article-body");
    const text = body?.innerText ?? "";
    if (!text.trim()) return;
    const lang = /[ঀ-৿]/.test(text) ? "bn-BD" : "en";
    const queue = pieces(text);
    const id = ++run.current;
    setSpeaking(true);
    const next = (i: number) => {
      const piece = queue[i];
      if (id !== run.current || !piece) { if (id === run.current) setSpeaking(false); return; }
      const u = new SpeechSynthesisUtterance(piece);
      u.lang = lang;
      u.onend = () => next(i + 1);
      u.onerror = () => { if (id === run.current) setSpeaking(false); };
      window.speechSynthesis.speak(u);
    };
    next(0);
  }

  function change(step: number) {
    const at = SCALES.indexOf(scale);
    const to = SCALES[Math.min(SCALES.length - 1, Math.max(0, at + step))] ?? 1;
    setScale(to);
    try { window.localStorage.setItem(SCALE_KEY, String(to)); } catch { /* ignore */ }
  }

  return (
    <>
      <div className="reader-progress" aria-hidden="true"><span ref={bar} /></div>
      <div className="reader-tools" role="group" aria-label="Reading options">
        <button type="button" onClick={() => change(-1)} disabled={scale <= SCALES[0]!} aria-label="Smaller text"><Minus aria-hidden="true" /></button>
        <span aria-hidden="true">Aa</span>
        <button type="button" onClick={() => change(1)} disabled={scale >= SCALES[SCALES.length - 1]!} aria-label="Larger text"><Plus aria-hidden="true" /></button>
        {canSpeak && (
          <button type="button" className="reader-listen" onClick={listen} aria-pressed={speaking}>
            {speaking ? <Square aria-hidden="true" /> : <Headphones aria-hidden="true" />}
            <span>{speaking ? "Stop" : "Listen"}</span>
          </button>
        )}
      </div>
    </>
  );
}
