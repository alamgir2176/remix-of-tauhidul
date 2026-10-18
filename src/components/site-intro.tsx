import { useEffect, useRef, useState } from "react";

const SEEN_KEY = "tauhidul-intro-seen";
// Original lines, drawn from the site's own voice: curiosity, conversation, people.
const MESSAGES = ["Some questions don’t want answers.", "They want company."];
const READ_FIRST = 1700; // minimum time the first line stays readable
const READ_SECOND = 1600; // time given to the closing line
const MAX_WAIT = 5000; // hard ceiling — the site always wins
const EXIT_MS = 1000;

/**
 * Brief, once-per-session intro. Failsafes, strongest first:
 * 1. CSS fades the overlay out on its own after ~5s, even if JS never runs.
 * 2. An inline head script hides it immediately for returning sessions.
 * 3. A hard JS timeout dismisses it whether or not loading finished.
 * 4. Any error, click, Escape or the "Enter site" button dismisses it at once.
 * It never traps focus and never blocks scrolling of the content beneath.
 */
export function SiteIntro() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* storage blocked */ }
    setLeaving(true);
    window.setTimeout(() => setGone(true), EXIT_MS);
  };

  useEffect(() => {
    const timers: number[] = [];
    let poll = 0;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") finish(); };
    let onLoad: (() => void) | null = null;
    try {
      if (document.documentElement.classList.contains("intro-skip")) {
        done.current = true;
        setGone(true);
        return undefined;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = performance.now();
      // Real progress: eager images that have finished, plus web fonts.
      const measure = () => {
        const imgs = Array.from(document.images).filter((i) => i.loading !== "lazy");
        const fontsReady = document.fonts?.status === "loaded" ? 1 : 0;
        const ready = imgs.filter((i) => i.complete).length + fontsReady;
        setProgress(Math.min(1, ready / (imgs.length + 1)));
      };
      const onReady = () => {
        measure();
        setProgress(1);
        const elapsed = performance.now() - start;
        if (reduced) {
          timers.push(window.setTimeout(finish, Math.max(0, 900 - elapsed)));
          return;
        }
        const firstLeft = Math.max(0, READ_FIRST - elapsed);
        timers.push(window.setTimeout(() => setIndex(1), firstLeft));
        timers.push(window.setTimeout(finish, firstLeft + READ_SECOND));
      };
      onLoad = onReady;
      poll = window.setInterval(measure, 150);
      measure();
      if (document.readyState === "complete") onReady();
      else window.addEventListener("load", onReady, { once: true });
      timers.push(window.setTimeout(finish, MAX_WAIT));
      document.addEventListener("keydown", onKey);
    } catch {
      finish();
    }
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(poll);
      if (onLoad) window.removeEventListener("load", onLoad);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;
  return (
    <div className={`site-intro${leaving ? " is-leaving" : ""}`} onClick={finish}>
      <span className="intro-mark" aria-hidden="true">tauhidul<span>.</span></span>
      <div className="intro-stage" role="status" aria-live="polite">
        {MESSAGES.map((m, i) => (
          <p key={m} className={`intro-line font-editorial${i === index ? " is-current" : ""}`} aria-hidden={i !== index}>{m}</p>
        ))}
      </div>
      <div className="intro-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
      <button type="button" className="intro-skip-btn" onClick={(e) => { e.stopPropagation(); finish(); }}>Enter site</button>
    </div>
  );
}

export const INTRO_SKIP_SCRIPT = `try{if(sessionStorage.getItem("${SEEN_KEY}"))document.documentElement.classList.add("intro-skip")}catch(e){}`;
