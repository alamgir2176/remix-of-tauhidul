import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";

const SIZE = 1080;

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function draw(canvas: HTMLCanvasElement, text: string, title: string, byline: string) {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const bg = get("--background", "#F5F0E8");
  const fg = get("--foreground", "#25231F");
  const brand = get("--brand", "#B88945");
  const muted = get("--muted-foreground", "#6b665c");
  const serif = `"Instrument Serif", Georgia, "Noto Serif Bengali", "Hind Siliguri", serif`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = SIZE;
  canvas.height = SIZE;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // Thin frame and a short brand rule.
  ctx.strokeStyle = brand;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, SIZE - 96, SIZE - 96);
  ctx.globalAlpha = 1;
  ctx.fillStyle = brand;
  ctx.fillRect(120, 150, 72, 4);

  const quote = text.replace(/^[“"']|[”"']$/g, "");
  const pad = 120;
  const maxW = SIZE - pad * 2;
  const maxH = 600;
  let size = 76;
  let lines: string[] = [];
  for (; size >= 34; size -= 4) {
    ctx.font = `${size}px ${serif}`;
    lines = wrap(ctx, quote, maxW);
    if (lines.length * size * 1.35 <= maxH) break;
  }
  ctx.fillStyle = fg;
  ctx.textBaseline = "top";
  const block = lines.length * size * 1.35;
  const startY = 210 + Math.max(0, (maxH - block) / 2);
  lines.forEach((l, i) => ctx.fillText(l, pad, startY + i * size * 1.35));

  ctx.fillStyle = fg;
  ctx.font = `600 30px Manrope, system-ui, sans-serif`;
  ctx.fillText(byline, pad, SIZE - 190);
  ctx.fillStyle = muted;
  ctx.font = `26px Manrope, system-ui, sans-serif`;
  const label = title.length > 52 ? `${title.slice(0, 51)}…` : title;
  ctx.fillText(label, pad, SIZE - 146);
  ctx.fillText(location.host, pad, SIZE - 108);
}

/** The picture itself: drawn on a canvas in the visitor's current theme colours. */
export default function ShareLineCard({ text, title, byline, url, onClose }: { text: string; title: string; byline: string; url: string; onClose: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    let alive = true;
    const go = () => alive && canvas.current && draw(canvas.current, text, title, byline);
    go();
    void document.fonts?.ready.then(go);
    setCanShare(typeof navigator.canShare === "function");
    closeBtn.current?.focus();
    const keys = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", keys, true);
    return () => {
      alive = false;
      window.removeEventListener("keydown", keys, true);
    };
  }, [text, title, byline, onClose]);

  const blob = () => new Promise<Blob | null>((res) => canvas.current?.toBlob(res, "image/png"));
  async function save() {
    const b = await blob();
    if (!b) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "quote-md-tauhidul-islam.png";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function share() {
    const b = await blob();
    if (!b) return;
    const file = new File([b], "quote.png", { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title, url: url || location.href });
      else await save();
    } catch {
      /* the visitor closed the share sheet */
    }
  }

  return (
    <div className="slc" role="dialog" aria-modal="true" aria-label="Share this line as an image">
      <div className="slc-backdrop" onClick={onClose} />
      <div className="slc-panel">
        <button ref={closeBtn} type="button" className="slc-close" onClick={onClose} aria-label="Close">
          <X aria-hidden="true" />
        </button>
        <canvas ref={canvas} role="img" aria-label={`Quote card: ${text}`} />
        <div className="slc-actions">
          <button type="button" onClick={save}><Download aria-hidden="true" /> Save image</button>
          {canShare && <button type="button" onClick={share}>Share…</button>}
        </div>
      </div>
    </div>
  );
}
