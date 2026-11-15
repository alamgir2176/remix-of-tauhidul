import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { PhotoFigure } from "@/components/content-cards";
import type { Photo } from "@/lib/content-utils";

/**
 * Photographs at their own proportions (wide, tall, square side by side), with a full-screen viewer.
 * It only changes how the photos are shown; the photo list itself comes from the content files as before.
 */
export function PhotoGallery({ photos, className = "gallery-wall", tail }: { photos: Photo[]; className?: string; tail?: ReactNode | undefined }) {
  const [open, setOpen] = useState<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const close = useCallback(() => {
    setOpen(null);
    trigger.current?.focus();
  }, []);
  return (
    <>
      <div className={className}>
        {photos.map((photo, i) => (
          <div key={`${photo.image}-${i}`}>
            <PhotoFigure photo={photo} onOpen={(el) => { trigger.current = el; setOpen(i); }} />
          </div>
        ))}
        {tail && <div>{tail}</div>}
      </div>
      {open !== null && <Viewer photos={photos} index={open} trigger={trigger.current} onClose={close} />}
    </>
  );
}

/**
 * The chosen photograph grows out of its place in the gallery into an editorial page: the photo at its
 * own proportions, its details beside or below it, and the rest of the album following as you scroll.
 */
function Viewer({ photos, index, trigger, onClose }: { photos: Photo[]; index: number; trigger: HTMLElement | null; onClose: () => void }) {
  const sheet = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLImageElement>(null);
  const closing = useRef(false);
  // The chosen photo first, then the rest of the album in order.
  const story = [...photos.slice(index), ...photos.slice(0, index)];
  const first = story[0];

  const rectOfTile = () => trigger?.querySelector("img")?.getBoundingClientRect() ?? null;
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Grow from the tile to the page.
  useLayoutEffect(() => {
    const img = hero.current;
    const from = rectOfTile();
    if (!img || !from || reduced()) return;
    const to = img.getBoundingClientRect();
    if (!to.width || !to.height) return;
    img.animate(
      [
        { transformOrigin: "top left", transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})` },
        { transformOrigin: "top left", transform: "none" },
      ],
      { duration: 560, easing: "cubic-bezier(.2,.75,.15,1)" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => {
    const img = hero.current;
    const el = sheet.current;
    const tile = rectOfTile();
    const inView = tile && tile.bottom > 0 && tile.top < window.innerHeight;
    if (closing.current || !img || !el || !inView || reduced() || (el.scrollTop > 80)) { onClose(); return; }
    closing.current = true;
    const to = img.getBoundingClientRect();
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: "ease", fill: "forwards" });
    img
      .animate(
        [
          { transformOrigin: "top left", transform: "none" },
          { transformOrigin: "top left", transform: `translate(${tile.left - to.left}px, ${tile.top - to.top}px) scale(${tile.width / to.width}, ${tile.height / to.height})` },
        ],
        { duration: 420, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" },
      )
      .finished.then(onClose, onClose);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  useEffect(() => {
    // Capture phase, like the other global key handlers on this site.
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    document.addEventListener("keydown", onKey, true);
    document.documentElement.classList.add("viewer-open");
    return () => { document.removeEventListener("keydown", onKey, true); document.documentElement.classList.remove("viewer-open"); };
  }, [close]);
  useEffect(() => { sheet.current?.querySelector<HTMLElement>("[data-viewer-close]")?.focus({ preventScroll: true }); }, []);

  // Keep Tab inside the page while it is open.
  const trap = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const items = Array.from(sheet.current?.querySelectorAll<HTMLElement>("button, a[href]") ?? []);
    const a = items[0];
    const b = items[items.length - 1];
    if (!a || !b) return;
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
    else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
  };

  if (!first) return null;
  return (
    <div ref={sheet} className="viewer" role="dialog" aria-modal="true" aria-label={first.activity || "Photo"} onKeyDown={trap}>
      <header className="viewer-bar">
        <button type="button" className="viewer-back" data-viewer-close onClick={close}><ArrowLeft aria-hidden="true" /> Gallery</button>
        <p>{first.activity}</p>
      </header>
      <div className="viewer-story">
        {story.map((photo, i) => {
          const meta = [photo.dateLabel, photo.location].filter(Boolean).join(" · ");
          return (
            <figure key={`${photo.image}-${i}`} className="viewer-item">
              <img ref={i === 0 ? hero : undefined} src={photo.image} alt={photo.alt} decoding="async" loading={i < 2 ? "eager" : "lazy"} />
              <figcaption>
                {meta && <span className="viewer-meta">{meta}</span>}
                {photo.caption && <span className="viewer-caption">{photo.caption}</span>}
                <span className="viewer-index" aria-hidden="true">{String(((photos.indexOf(photo) + 1) || i + 1)).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
              </figcaption>
            </figure>
          );
        })}
        <button type="button" className="viewer-end" onClick={close}><ArrowLeft aria-hidden="true" /> Back to the gallery</button>
      </div>
    </div>
  );
}
