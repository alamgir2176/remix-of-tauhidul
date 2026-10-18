import { useEffect, useRef, useState } from "react";

const SEEN_KEY = "tauhidul-intro-seen";
const MESSAGES = ["Every question opens a door.", "Ideas, people, possibilities."];
const MIN_FIRST = 1100; // keep the first line readable
const MAX_WAIT = 3800; // never hold the site longer than this

/**
 * Brief session intro. Failsafes, from strongest to weakest:
 * 1. CSS removes the overlay on its own after ~5s, even if JS never runs.
 * 2. An inline head script hides it immediately for returning sessions.
 * 3. A hard JS timeout dismisses it, whether or not loading finished.
 * Any error inside this component dismisses it straight away.
 */
export function SiteIntro() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (done.current) return;
      done.current = true;
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* storage blocked */ }
      setLeaving(true);
      window.setTimeout(() => setGone(true), 700);
    };
    try {
      if (document.documentElement.classList.contains("intro-skip")) { done.current = true; setGone(true); return undefined; }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = performance.now();
      const timers: number[] = [];
      const measure = () => {
        const imgs = Array.from(document.images).filter((i) => i.loading !== "lazy");
        const fonts = document.fonts?.status === "loaded" ? 1 : 0;
        const ready = imgs.filter((i) => i.complete).length + fonts;
        setProgress(Math.min(1, ready / (imgs.length + 1)));
      };
      const onReady = () => {
        measure();
        const wait = Math.max(0, (reduced ? 400 : MIN_FIRST) - (performance.now() - start));
        timers.push(window.setTimeout(finish, wait + (reduced ? 0 : 900)));
        if (!reduced) timers.push(window.setTimeout(() => setIndex(1), wait));
      };
      const poll = window.setInterval(measure, 150);
      measure();
      if (document.readyState === "complete") onReady();
      else window.addEventListener("load", onReady, { once: true });
      timers.push(window.setTimeout(finish, MAX_WAIT));
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") finish(); };
      document.addEventListener("keydown", onKey);
      return () => { timers.forEach(clearTimeout); clearInterval(poll); window.removeEventListener("load", onReady); document.removeEventListener("keydown", onKey); };
    } catch {
      finish();
      return undefined;
    }
  }, []);

  if (gone) return null;
  return (
    <div className={`site-intro${leaving ? " is-leaving" : ""}`} role="status" aria-live="polite" onClick={() => { done.current = false; setLeaving(true); setTimeout(() => setGone(true), 700); try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ } }}>
      <span className="intro-mark">tauhidul<span>.</span></span>
      <p key={index} className="intro-line font-editorial">{MESSAGES[index]}</p>
      <div className="intro-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
      <button type="button" className="intro-skip-btn">Enter site</button>
    </div>
  );
}

export const INTRO_SKIP_SCRIPT = `try{if(sessionStorage.getItem("${SEEN_KEY}"))document.documentElement.classList.add("intro-skip")}catch(e){}`;
