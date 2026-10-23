export const INTRO_SEEN_KEY = "tauhidul-intro-seen-v4";
export const INTRO_RECOVERY_MS = 12000;
export const INTRO_QUOTE_MS = 2600;
export const QUOTATION_COUNT = 3;

// Standalone so the head bootstrap can run before React or application modules.
export function bootstrapIntro(seenKey: string, recoveryMs: number, quoteMs: number, quotationCount: number) {
  const root = document.documentElement;
  try {
    const navigation = window.performance?.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (sessionStorage.getItem(seenKey) || location.hash || navigation?.type === "back_forward") return;
  } catch { /* Storage or navigation timing may be unavailable. */ }

  root.classList.add("intro-active");
  root.dataset["introProgress"] = "0";
  root.dataset["introQuote"] = "0";
  let finished = false;
  let resourcesReady = false;
  let sequenceDone = false;
  let sequenceTimer = 0;
  const finish = () => {
    if (finished) return;
    finished = true;
    root.classList.add("intro-ready");
    try { sessionStorage.setItem(seenKey, "1"); } catch { /* Private browsing. */ }
    clearTimeout(timeout);
    clearTimeout(sequenceTimer);
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("click", onClick);
    document.removeEventListener("focusin", onFocus);
    window.removeEventListener("intro-dismiss", finish);
    window.removeEventListener("pagehide", finish);
    window.dispatchEvent(new Event("intro-finished"));
    root.classList.remove("intro-active");
  };
  // The site opens once the quotation sequence has played AND real loading has settled.
  const checkFinish = () => {
    if (resourcesReady && sequenceDone) finish();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape" || event.key === "Tab") finish();
  };
  const onClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest(".site-intro")) finish();
  };
  const onFocus = (event: FocusEvent) => {
    if (event.target instanceof Element && !event.target.closest(".site-intro")) finish();
  };
  const timeout = window.setTimeout(finish, recoveryMs);
  document.addEventListener("keydown", onKey);
  document.addEventListener("click", onClick);
  document.addEventListener("focusin", onFocus);
  window.addEventListener("intro-dismiss", finish);
  window.addEventListener("pagehide", finish);

  // The sequence runs on its own clock from first paint, so every fresh visit
  // sees all quotations; slow loading only holds the last one longer.
  let step = 0;
  const advance = () => {
    step += 1;
    if (step >= quotationCount) {
      sequenceDone = true;
      checkFinish();
      return;
    }
    root.dataset["introQuote"] = String(step);
    window.dispatchEvent(new CustomEvent("intro-quotation", { detail: step }));
    sequenceTimer = window.setTimeout(advance, quoteMs);
  };
  sequenceTimer = window.setTimeout(advance, quoteMs);

  const loaded = () => {
    if (finished) return;
    // Explicit browser ownership keeps serialized head code independent of SSR shims.
    const now = () => window.performance?.now?.() ?? Date.now();
    void now;
    root.classList.add("intro-loaded");
    window.dispatchEvent(new Event("intro-loaded"));
    resourcesReady = true;
    checkFinish();
  };
  const ready = () => {
    if (finished) return;
    try {
      const images = Array.from(document.images).filter((image) => image.loading !== "lazy");
      // Completed readiness tasks, not a guessed byte-download percentage.
      const total = 1 + images.length + (document.fonts ? 1 : 0);
      let completed = 0;
      const report = () => {
        if (finished) return;
        completed += 1;
        const percent = Math.floor(completed / total * 100);
        root.dataset["introProgress"] = String(percent);
        window.dispatchEvent(new CustomEvent("intro-progress", { detail: percent }));
      };
      report(); // The document is parsed.
      const pending = images.map((image) => new Promise<void>((resolve) => {
        let settling = false;
        const settled = () => {
          if (settling) return;
          settling = true;
          image.removeEventListener("load", settled);
          image.removeEventListener("error", settled);
          if (image.naturalWidth > 0 && typeof image.decode === "function") {
            image.decode().catch(() => undefined).then(() => resolve());
          } else resolve();
        };
        if (image.complete) settled();
        else {
          image.addEventListener("load", settled, { once: true });
          image.addEventListener("error", settled, { once: true });
        }
      }).then(report));
      // Force font selection now, then wait for actual font readiness, not a percentage.
      void document.body.offsetHeight;
      if (document.fonts) pending.push(document.fonts.ready.then(report, report));
      Promise.all(pending).then(loaded, loaded);
    } catch { loaded(); }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
}

export const INTRO_SKIP_SCRIPT = `(${bootstrapIntro.toString()})(${JSON.stringify(INTRO_SEEN_KEY)},${INTRO_RECOVERY_MS},${INTRO_QUOTE_MS},${QUOTATION_COUNT});`;
