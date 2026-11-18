import type { Block } from "@/lib/markdown";
import { inlineText } from "@/lib/markdown";

/** A collapsible contents list built from the article's own headings. Hidden for short pieces. */
export function ReaderToc({ blocks }: { blocks: Block[] }) {
  const heads = blocks.flatMap((b) => (b.t === "heading" && b.level <= 3 && b.id ? [{ id: b.id, level: b.level, text: inlineText(b.c) }] : []));
  if (heads.length < 3) return null;
  const base = Math.min(...heads.map((h) => h.level));
  return (
    <details className="reader-toc">
      <summary>Contents <span>{heads.length} sections</span></summary>
      <ol>
        {heads.map((h) => (
          <li key={h.id} className={h.level > base ? "is-sub" : undefined}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </details>
  );
}
