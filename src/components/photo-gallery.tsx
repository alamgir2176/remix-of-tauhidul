import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PhotoFigure } from "@/components/content-cards";
import type { Photo } from "@/lib/content-utils";

/**
 * Photographs at their own proportions (wide, tall, square side by side), with a full-screen viewer.
 * It only changes how the photos are shown; the photo list itself comes from the content files as before.
 */
export function PhotoGallery({ photos, className = "gallery-mosaic" }: { photos: Photo[]; className?: string }) {
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
      </div>
      {open !== null && <Viewer photos={photos} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}

function Viewer({ photos, index, onIndex, onClose }: { photos: Photo[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const photo = photos[index];
  const dialog = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const count = photos.length;
  const go = useCallback((step: number) => onIndex((index + step + count) % count), [index, count, onIndex]);

  useEffect(() => {
    // Capture phase, like the other global key handlers on this site.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey, true);
    document.documentElement.classList.add("viewer-open");
    return () => { document.removeEventListener("keydown", onKey, true); document.documentElement.classList.remove("viewer-open"); };
  }, [go, onClose]);
  useEffect(() => { dialog.current?.querySelector<HTMLElement>("[data-viewer-close]")?.focus(); }, []);

  // Keep Tab inside the viewer while it is open.
  const trap = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>("button") ?? []);
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  if (!photo) return null;
  return (
    <div
      ref={dialog}
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${count}`}
      onKeyDown={trap}
      onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start === null || end === undefined || count < 2) return;
        if (Math.abs(end - start) > 50) go(end < start ? 1 : -1);
      }}
    >
      <div className="viewer-backdrop" onClick={onClose} aria-hidden="true" />
      <figure className="viewer-figure">
        <img src={photo.image} alt={photo.alt} />
        {(photo.caption || photo.location) && (
          <figcaption>
            {photo.caption}
            {photo.location && <span>{photo.location}</span>}
          </figcaption>
        )}
      </figure>
      <button type="button" className="viewer-btn viewer-close" data-viewer-close aria-label="Close photo viewer" onClick={onClose}><X aria-hidden="true" /></button>
      {count > 1 && (
        <>
          <button type="button" className="viewer-btn viewer-prev" aria-label="Previous photo" onClick={() => go(-1)}><ChevronLeft aria-hidden="true" /></button>
          <button type="button" className="viewer-btn viewer-next" aria-label="Next photo" onClick={() => go(1)}><ChevronRight aria-hidden="true" /></button>
          <p className="viewer-count" aria-hidden="true">{index + 1} / {count}</p>
        </>
      )}
    </div>
  );
}
