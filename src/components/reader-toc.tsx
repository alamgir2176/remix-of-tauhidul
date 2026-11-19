import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Block } from "@/lib/markdown";
import { inlineText } from "@/lib/markdown";

/**
 * Contents built from the article's own headings. Phones and tablets get a collapsible box under the title;
 * wide screens get a quiet sticky list beside the text that follows the section being read.
 */
export function ReaderToc({ blocks, rail = false }: { blocks: Block[]; rail?: boolean }) {
  const { t, num } = useI18n();
  const heads = blocks.flatMap((b) => (b.t === "heading" && b.level <= 3 && b.id ? [{ id: b.id, level: b.level, text: inlineText(b.c) }] : []));
  const [current, setCurrent] = useState("");
  useEffect(() => {
    if (!rail || heads.length < 3 || !("IntersectionObserver" in window)) return;
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting || e.boundingClientRect.top < 0);
        const passed = heads.filter((h) => seen.get(h.id));
        setCurrent(passed.length ? passed[passed.length - 1]!.id : "");
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    for (const h of heads) {
      const el = document.getElementById(h.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rail, blocks]);
  if (heads.length < 3) return null;
  const base = Math.min(...heads.map((h) => h.level));
  const list = (
    <ol>
      {heads.map((h) => (
        <li key={h.id} className={h.level > base ? "is-sub" : undefined}>
          <a href={`#${h.id}`} aria-current={current === h.id ? "location" : undefined}>{h.text}</a>
        </li>
      ))}
    </ol>
  );
  if (rail) {
    return (
      <nav className="toc-rail" aria-label={t("Contents")}>
        <span className="micro-label">{t("Contents")}</span>
        {list}
      </nav>
    );
  }
  return (
    <details className="reader-toc">
      <summary>{t("Contents")} <span>{t("{n} sections", { n: heads.length })}</span></summary>
      {list}
    </details>
  );
}
