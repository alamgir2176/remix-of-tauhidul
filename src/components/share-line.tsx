import { lazy, Suspense, useEffect, useState } from "react";
import { ImageDown } from "lucide-react";

const ShareLineCard = lazy(() => import("@/components/share-line-card"));

interface Picked {
  text: string;
  top: number;
  left: number;
}

/**
 * Select a sentence inside `scope` and a small "Share as image" button appears beside it.
 * The picture is drawn in the browser on a canvas (code loads only when it is used).
 */
export function ShareLine({ title, url, scope = ".article-body", byline = "Md Tauhidul Islam" }: { title: string; url: string; scope?: string; byline?: string }) {
  const [picked, setPicked] = useState<Picked | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let timer = 0;
    const read = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return setPicked(null);
      const text = sel.toString().replace(/\s+/g, " ").trim();
      const range = sel.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const el = node instanceof Element ? node : node.parentElement;
      if (!el || !el.closest(scope) || text.length < 12 || text.length > 420) return setPicked(null);
      const rect = range.getBoundingClientRect();
      setPicked({ text, top: Math.max(8, rect.top - 46), left: Math.min(Math.max(8, rect.left + rect.width / 2 - 70), window.innerWidth - 156) });
    };
    const onChange = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(read, 180);
    };
    const hide = () => setPicked(null);
    document.addEventListener("selectionchange", onChange);
    window.addEventListener("scroll", hide, { passive: true });
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("selectionchange", onChange);
      window.removeEventListener("scroll", hide);
    };
  }, [scope]);

  return (
    <>
      {picked && !open && (
        <button
          type="button"
          className="share-line-btn"
          style={{ top: picked.top, left: picked.left }}
          // Keep the selection alive while the button is pressed.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setOpen(picked.text);
            setPicked(null);
          }}
        >
          <ImageDown aria-hidden="true" /> Share as image
        </button>
      )}
      {open && (
        <Suspense fallback={null}>
          <ShareLineCard text={open} title={title} byline={byline} url={url} onClose={() => setOpen(null)} />
        </Suspense>
      )}
    </>
  );
}
