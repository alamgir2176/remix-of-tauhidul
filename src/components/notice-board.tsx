import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Download } from "lucide-react";
import type { Announcement } from "@/lib/content";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Splits an ISO date (2026-11-13) into the parts shown in the date column. */
function dateParts(item: Announcement) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(item.date);
  if (!m) return { day: "", month: item.dateLabel, year: "" };
  const month = MONTHS[Number(m[2]) - 1] ?? "";
  return { day: String(Number(m[3])), month, year: m[1] ?? "" };
}

type Kind = "all" | Announcement["kind"];

/**
 * Notices and press releases as an official register: date, subject, document.
 * With `filters` it can be narrowed by kind and year (the page); without it it is a plain latest list (the homepage).
 */
export function NoticeBoard({ items, filters = false, more = 0 }: { items: Announcement[]; filters?: boolean; more?: number }) {
  const [kind, setKind] = useState<Kind>("all");
  const [year, setYear] = useState("all");
  const years = useMemo(() => [...new Set(items.map((i) => dateParts(i).year).filter(Boolean))], [items]);
  const kinds = useMemo(() => [...new Set(items.map((i) => i.kind))], [items]);
  const rows = items.filter((i) => (kind === "all" || i.kind === kind) && (year === "all" || dateParts(i).year === year));
  const showFilters = filters && (years.length > 1 || kinds.length > 1);

  return (
    <div className="notice-board">
      {showFilters && (
        <div className="notice-filters" role="group" aria-label="Filter updates">
          <div className="notice-filter-set">
            {(["all", ...kinds] as Kind[]).map((k) => (
              <button key={k} type="button" className="notice-chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
                {k === "all" ? "All" : k === "Notice" ? "Notices" : "Press releases"}
              </button>
            ))}
          </div>
          {years.length > 1 && (
            <div className="notice-filter-set">
              {["all", ...years].map((y) => (
                <button key={y} type="button" className="notice-chip" aria-pressed={year === y} onClick={() => setYear(y)}>
                  {y === "all" ? "Any year" : y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <p role="status" aria-live="polite" className="sr-only">{`Showing ${rows.length} of ${items.length} updates`}</p>
      <div className="notice-head" aria-hidden="true"><span>Date</span><span>Subject</span><span>Document</span></div>
      <ol className="notice-list">
        {rows.map((item, i) => {
          const { day, month, year: y } = dateParts(item);
          return (
            <li key={`${item.title}-${i}`} className="notice-row">
              <time className="notice-date" dateTime={item.date || undefined}>
                {day && <span className="notice-day">{day}</span>}
                <span className="notice-month">{[month, y].filter(Boolean).join(" ")}</span>
              </time>
              <div className="notice-main">
                <p className={`notice-kind${item.kind === "Press release" ? " is-press" : ""}`}>{item.kind}</p>
                <h3 className="notice-title">{item.title}</h3>
                {item.description && <p className="notice-text">{item.description}</p>}
              </div>
              <div className="notice-action">
                {item.pdf ? (
                  <a href={item.pdf} download={item.fileName || true} target="_blank" rel="noopener noreferrer" className="notice-pdf" aria-label={`Download PDF: ${item.title}`}>
                    <Download aria-hidden="true" /> <span>PDF</span>
                  </a>
                ) : (
                  <span className="notice-nofile">No file</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {rows.length === 0 && <p className="notice-empty">Nothing matches this filter.</p>}
      {more > 0 && (
        <Link to="/notices" className="notice-more">
          <span>{more} more {more === 1 ? "update" : "updates"}</span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
