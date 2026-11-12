import type { ReactNode } from "react";
import { safeUrl, type Block, type Inline } from "@/lib/markdown";

function renderInline(nodes: Inline[]): ReactNode[] {
  return nodes.map((node, i) => {
    switch (node.t) {
      case "text":
        return node.v;
      case "code":
        return <code key={i}>{node.v}</code>;
      case "strong":
        return <strong key={i}>{renderInline(node.c)}</strong>;
      case "em":
        return <em key={i}>{renderInline(node.c)}</em>;
      case "del":
        return <del key={i}>{renderInline(node.c)}</del>;
      case "br":
        return <br key={i} />;
      case "img":
        return <img key={i} src={safeUrl(node.src)} alt={node.alt} loading="lazy" />;
      case "link": {
        const href = safeUrl(node.href);
        const external = /^https?:\/\//i.test(href);
        return (
          <a key={i} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {renderInline(node.c)}
          </a>
        );
      }
    }
  });
}

function Caption({ text }: { text: string }) {
  return text ? <figcaption>{text}</figcaption> : null;
}

function renderBlocks(blocks: Block[], shift: number): ReactNode[] {
  return blocks.map((block, i) => {
    switch (block.t) {
      case "heading": {
        const level = Math.min(6, block.level + shift);
        const Tag = `h${level}` as "h2";
        return (
          <Tag key={i} id={block.id}>
            {renderInline(block.c)}
          </Tag>
        );
      }
      case "p":
        return <p key={i}>{renderInline(block.c)}</p>;
      case "quote":
        return <blockquote key={i}>{renderBlocks(block.c, shift)}</blockquote>;
      case "hr":
        return <hr key={i} />;
      case "code":
        return (
          <pre key={i}>
            <code>{block.v}</code>
          </pre>
        );
      case "list": {
        const items = block.items.map((item, k) => (
          <li key={k}>
            {renderInline(item.c)}
            {item.children.length > 0 && renderBlocks(item.children, shift)}
          </li>
        ));
        return block.ordered ? (
          <ol key={i} start={block.start}>{items}</ol>
        ) : (
          <ul key={i}>{items}</ul>
        );
      }
      case "figure":
        return (
          <figure key={i} className="md-figure">
            <img src={block.src} alt={block.alt} loading="lazy" decoding="async" />
            <Caption text={block.caption} />
          </figure>
        );
      case "youtube": {
        const src = `https://www.youtube-nocookie.com/embed/${block.id}${block.start ? `?start=${block.start}` : ""}`;
        return (
          <figure key={i} className="md-embed">
            <div className="md-embed-frame">
              <iframe
                src={src}
                title={block.title}
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <Caption text={block.caption} />
          </figure>
        );
      }
      case "audio":
        return (
          <figure key={i} className="md-audio">
            {block.title && <p className="md-audio-title">{block.title}</p>}
            <audio controls preload="none" src={block.src}>
              <a href={block.src}>Download the audio file</a>
            </audio>
            <Caption text={block.caption} />
          </figure>
        );
      case "pdf":
        return (
          <figure key={i} className="md-pdf">
            {block.embed && <iframe src={block.src} title={block.title} loading="lazy" />}
            <a href={block.src} target="_blank" rel="noopener noreferrer" className="md-pdf-link">
              <span>
                <small>PDF document</small>
                {block.title}
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          </figure>
        );
      case "table":
        return (
          <div key={i} className="md-table-wrap">
            <table>
              <thead>
                <tr>
                  {block.head.map((cell, c) => (
                    <th key={c} style={{ textAlign: block.align[c] ?? undefined }}>{renderInline(cell)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} style={{ textAlign: block.align[c] ?? undefined }}>{renderInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  });
}

/** Renders parsed Markdown blocks. If the article uses `#` headings they are demoted below the page title. */
export function MarkdownView({ blocks }: { blocks: Block[] }) {
  const levels = blocks.flatMap((b) => (b.t === "heading" ? [b.level] : []));
  const shift = levels.length > 0 && Math.min(...levels) === 1 ? 1 : 0;
  return <div className="article-body">{renderBlocks(blocks, shift)}</div>;
}
