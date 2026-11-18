import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";

// The search itself is a separate piece of code, fetched only the first time someone opens it.
const SearchPalette = lazy(() => import("./search-palette"));

export const OPEN_SEARCH_EVENT = "open-search";

/** Opens the site search with Ctrl/⌘ + K, "/" or the search buttons; renders nothing until then. */
export function SearchLauncher() {
  const [open, setOpen] = useState(false);
  const returnTo = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
  }, []);
  const hide = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => returnTo.current?.focus?.({ preventScroll: true }), 0);
  }, []);

  useEffect(() => {
    // Capture phase, like the other global key handlers on this site.
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); show(); }
      else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); show(); }
    };
    document.addEventListener("keydown", onKey, true);
    window.addEventListener(OPEN_SEARCH_EVENT, show);
    return () => { document.removeEventListener("keydown", onKey, true); window.removeEventListener(OPEN_SEARCH_EVENT, show); };
  }, [show]);

  if (!open) return null;
  return <Suspense fallback={null}><SearchPalette onClose={hide} /></Suspense>;
}
