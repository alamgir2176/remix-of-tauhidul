import { useState } from "react";
import { Check, Copy, Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MLA_MONTHS = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
const AUTHOR = "Md Tauhidul Islam";

interface Props { title: string; date: string; url: string }

function formats({ title, date, url }: Props): { name: string; text: string }[] {
  const d = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  const ok = !Number.isNaN(d.getTime());
  const y = ok ? d.getUTCFullYear() : "n.d.";
  const m = ok ? d.getUTCMonth() : 0;
  const day = ok ? d.getUTCDate() : 0;
  return [
    { name: "APA", text: `Islam, M. T. (${ok ? `${y}, ${MONTHS[m]} ${day}` : "n.d."}). ${title}. ${AUTHOR}. ${url}` },
    { name: "MLA", text: `Islam, Md Tauhidul. “${title}.” ${AUTHOR}, ${ok ? `${day} ${MLA_MONTHS[m]} ${y}` : "n.d."}, ${url}.` },
    { name: "Chicago", text: `Islam, Md Tauhidul. “${title}.” ${AUTHOR}, ${ok ? `${MONTHS[m]} ${day}, ${y}` : "n.d."}. ${url}.` },
  ];
}

/** "Cite this article" in the three common styles, built in the browser. */
export function CiteBox(props: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  async function copy(name: string, text: string) {
    try { await navigator.clipboard.writeText(text); setDone(name); window.setTimeout(() => setDone(null), 2000); } catch { /* the text stays selectable */ }
  }
  return (
    <div className="cite-box">
      <button type="button" className="reader-share" aria-expanded={open} onClick={() => setOpen(!open)}><Quote aria-hidden="true" /><span>{t("Cite this article")}</span></button>
      {open && (
        <ul className="cite-list">
          {formats(props).map((f) => (
            <li key={f.name}>
              <span className="micro-label">{f.name}</span>
              <p>{f.text}</p>
              <button type="button" onClick={() => copy(f.name, f.text)} aria-label={t("Copy {name} citation", { name: f.name })}>{done === f.name ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}<span role="status">{done === f.name ? t("Copied") : t("Copy")}</span></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
