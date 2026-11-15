import { useEffect } from "react";

/** Pictures inside these areas stay easy to save (articles and their covers). */
const OPEN = ".article-body, .reader-cover, .read-next";

/**
 * Makes saving the website's pictures a little less casual: no right-click menu or dragging on
 * photographs outside articles. Nothing can fully stop a determined person (screenshots and the
 * browser's developer tools still work), and text, links and keyboard use are never affected.
 * It also hides a picture that fails to load, so a broken-image icon never shows.
 */
export function ImageGuard() {
  useEffect(() => {
    const guarded = (target: EventTarget | null): boolean =>
      target instanceof HTMLImageElement && !target.closest(OPEN);
    const block = (event: Event) => {
      if (guarded(event.target)) event.preventDefault();
    };
    const broken = (event: Event) => {
      if (event.target instanceof HTMLImageElement) event.target.classList.add("img-broken");
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    // `error` does not bubble, so listen in the capture phase.
    document.addEventListener("error", broken, true);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("error", broken, true);
    };
  }, []);
  return null;
}
