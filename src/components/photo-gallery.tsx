import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
      {open !== null && <Viewer photos={photos} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}

function Viewer({ photos, index, onIndex, onClose }: { photos: Photo[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const photo = photos[index];
  const dialog = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const direction = useRef(1);
  const count = photos.length;
  const go = useCallback((step: number) => { direction.current = step; onIndex((index + step + count) % count); }, [index, count, onIndex]);
  const jump = (to: number) => { direction.current = to > index ? 1 : -1; onIndex(to); };

  useEffect(() => {
    // Capture phase, like the other global key handlers on this site.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Home") { e.preventDefault(); jump(0); }
      else if (e.key === "End") { e.preventDefault(); jump(count - 1); }
    };
    document.addEventListener("keydown", onKey, true);
    document.documentElement.classList.add("viewer-open");
    return () => { document.removeEventListener("keydown", onKey, true); document.documentElement.classList.remove("viewer-open"); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, onClose, count]);
  useEffect(() => { dialog.current?.querySelector<HTMLElement>("[data-viewer-close]")?.focus(); }, []);
  // Load the neighbours ahead of time so moving on feels instant.
  useEffect(() => {
    for (const step of [1, -1]) {
      const next = photos[(index + step + count) % count];
      if (next) new Image().src = next.image;
    }
    strip.current?.querySelector<HTMLElement>("[aria-current='true']")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [index, photos, count]);

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
  const meta = [photo.activity, photo.dateLabel, photo.location].filter(Boolean).join(" · ");
  return (
    <div
      ref={dialog}
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${count}`}
      onKeyDown={trap}
      onTouchStart={(e) => { const t = e.touches[0]; touch.current = t ? { x: t.clientX, y: t.clientY } : null; }}
      onTouchEnd={(e) => {
        const start = touch.current;
        const end = e.changedTouches[0];
        touch.current = null;
        if (!start || !end) return;
        const dx = end.clientX - start.x;
        const dy = end.clientY - start.y;
        if (Math.abs(dy) > 90 && Math.abs(dx) < 60) onClose();
        else if (count > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="viewer-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="viewer-top">
        <p className="viewer-count" aria-hidden="true">{String(index + 1).padStart(2, "0")}<span> / {String(count).padStart(2, "0")}</span></p>
        <button type="button" className="viewer-btn viewer-close" data-viewer-close aria-label="Close photo viewer" onClick={onClose}><X aria-hidden="true" /></button>
      </div>
      <div className="viewer-stage" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <img key={photo.image} className="viewer-img" style={{ "--dir": direction.current } as CSSProperties} src={photo.image} alt={photo.alt} />
      </div>
      {count > 1 && (
        <>
          <button type="button" className="viewer-btn viewer-prev" aria-label="Previous photo" onClick={() => go(-1)}><ChevronLeft aria-hidden="true" /></button>
          <button type="button" className="viewer-btn viewer-next" aria-label="Next photo" onClick={() => go(1)}><ChevronRight aria-hidden="true" /></button>
        </>
      )}
      <div className="viewer-info">
        {meta && <p className="viewer-meta">{meta}</p>}
        {photo.caption && <p className="viewer-caption">{photo.caption}</p>}
      </div>
      {count > 1 && (
        <div className="viewer-strip" ref={strip}>
          {photos.map((p, i) => (
            <button key={`${p.image}-${i}`} type="button" aria-label={`Show photo ${i + 1}`} aria-current={i === index} onClick={() => jump(i)}>
              <img src={p.image} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
