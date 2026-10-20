export const INTRO_SEEN_KEY = "tauhidul-intro-seen-v2";
export const INTRO_RECOVERY_MS = 12000;
export const INTRO_READING_MS = 4200;
export const QUOTE_INTERVAL_MS = 4200;

// Standalone so the head bootstrap can run before React or application modules.
export function bootstrapIntro(seenKey: string, recoveryMs: number, readingMs: number) {
  const root = document.documentElement;
  try {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (sessionStorage.getItem(seenKey) || location.hash || navigation?.type === "back_forward") return;
  } catch { /* Storage or navigation timing may be unavailable. */ }

  root.classList.add("intro-active");
  let finished = false;
  let readingTimer = 0;
  const finish = () => {
    if (finished) return;
    finished = true;
    root.classList.add("intro-ready");
    try { sessionStorage.setItem(seenKey, "1"); } catch { /* Private browsing. */ }
    clearTimeout(timeout);
    clearTimeout(readingTimer);
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("click", onClick);
    document.removeEventListener("focusin", onFocus);
    window.removeEventListener("intro-dismiss", finish);
    window.removeEventListener("pagehide", finish);
    window.dispatchEvent(new Event("intro-finished"));
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

  const ready = () => {
    if (finished) return;
    const visibleAt = performance.now();
    const loaded = () => {
      if (finished) return;
      root.classList.add("intro-loaded");
      window.dispatchEvent(new Event("intro-loaded"));
      const remaining = Math.max(0, readingMs - (performance.now() - visibleAt));
      if (remaining === 0) finish();
      else readingTimer = window.setTimeout(finish, remaining);
    };
    try {
      const images = Array.from(document.images).filter((image) => image.loading !== "lazy");
      const pending = images.map((image) => new Promise<void>((resolve) => {
        const settled = () => {
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
      }));
      // Force font selection now, then wait for actual font readiness, not a percentage.
      void document.body.offsetHeight;
      if (document.fonts) pending.push(document.fonts.ready.then(() => undefined));
      Promise.all(pending).then(loaded, loaded);
    } catch { finish(); }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
}

export const INTRO_SKIP_SCRIPT = `(${bootstrapIntro.toString()})(${JSON.stringify(INTRO_SEEN_KEY)},${INTRO_RECOVERY_MS},${INTRO_READING_MS});`;