import { createContext, Fragment, useContext, useMemo, type ReactNode } from "react";

export type Lang = "en" | "bn";
export type Dict = Record<string, string>;
export const LANG_COOKIE = "tauhidul-lang";

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "bn";
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const toBnDigits = (s: string) => s.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d);

/* ------------------------------------------------------------------ */
/* Script detection: any language the author writes in just works.     */
/* ------------------------------------------------------------------ */

interface ScriptInfo {
  lang: string;
  dir?: "rtl";
  test: RegExp;
}

const SCRIPTS: ScriptInfo[] = [
  { lang: "bn", test: /[ঀ-৿]/g },
  { lang: "hi", test: /[ऀ-ॿ]/g },
  { lang: "ar", dir: "rtl", test: /[؀-ۿݐ-ݿ]/g },
  { lang: "he", dir: "rtl", test: /[֐-׿]/g },
  { lang: "ta", test: /[஀-௿]/g },
  { lang: "ja", test: /[぀-ヿ]/g },
  { lang: "zh", test: /[一-鿿]/g },
  { lang: "ko", test: /[가-힣]/g },
  { lang: "ru", test: /[Ѐ-ӿ]/g },
  { lang: "en", test: /[A-Za-z]/g },
];

/** The dominant script of a piece of text, as a language tag (and direction, for right-to-left scripts). */
export function detectLang(text: string): { lang: string; dir?: "rtl" } | null {
  let best: ScriptInfo | null = null;
  let bestCount = 0;
  for (const s of SCRIPTS) {
    const n = text.match(s.test)?.length ?? 0;
    if (n > bestCount) {
      best = s;
      bestCount = n;
    }
  }
  return best ? (best.dir ? { lang: best.lang, dir: best.dir } : { lang: best.lang }) : null;
}

/** `lang`/`dir` attributes for text whose language differs from the page's, so readers and screen readers get it right. */
export function langAttrs(text: string, pageLang: string): { lang?: string; dir?: "rtl" } {
  const found = detectLang(text);
  if (!found || (found.lang === pageLang && !found.dir)) return {};
  return found.dir ? { lang: found.lang, dir: found.dir } : { lang: found.lang };
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

type Vars = Record<string, string | number>;

export interface I18n {
  lang: Lang;
  /** Translate an English (or Bengali) source string; unknown strings come back unchanged. `{name}` placeholders are filled from `vars`. */
  t: (source: string, vars?: Vars) => string;
  /** A number written in the active language's digits. */
  num: (value: number | string) => string;
  /** A date in the active language; falls back to the pre-formatted label. */
  date: (iso: string, fallback?: string) => string;
  /** Does this text belong to the other language (so a small "only in …" tag makes sense)? */
  foreign: (text: string) => boolean;
  /** `lang`/`dir` attributes for text written in a different language from the page. */
  la: (text: string) => { lang?: string; dir?: "rtl" };
  setLang: (lang: Lang) => void;
}

const fallback: I18n = {
  lang: "en",
  t: (source, vars) => fill(source, vars, (v) => String(v)),
  num: (v) => String(v),
  date: (_iso, label = "") => label,
  foreign: () => false,
  la: () => ({}),
  setLang: () => undefined,
};

function fill(text: string, vars: Vars | undefined, show: (v: string | number) => string): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? show(vars[k] as string | number) : m));
}

const Ctx = createContext<I18n>(fallback);

export function useI18n(): I18n {
  return useContext(Ctx);
}

export function writeLangCookie(lang: Lang): void {
  try {
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* Cookies may be blocked; the choice then lasts for this visit only. */
  }
}

export function readLangCookie(): Lang | null {
  if (typeof document === "undefined") return null;
  const m = new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=(bn|en)`).exec(document.cookie);
  return m ? (m[1] as Lang) : null;
}

const formatters: Partial<Record<Lang, Intl.DateTimeFormat>> = {};
function formatDay(lang: Lang, time: number): string | null {
  try {
    formatters[lang] ??= new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    return formatters[lang]!.format(new Date(time));
  } catch {
    return null;
  }
}

export function I18nProvider({ lang, dict, onChange, children }: { lang: Lang; dict: Dict; onChange: (lang: Lang) => void; children: ReactNode }) {
  const value = useMemo<I18n>(() => {
    const num = (v: number | string) => (lang === "bn" ? toBnDigits(String(v)) : String(v));
    return {
      lang,
      num,
      t: (source, vars) => fill(dict[source] ?? dict[source.replace(/’/g, "'")] ?? source, vars, num),
      date: (iso, label = "") => {
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
        if (!m) return label;
        const time = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        return (Number.isFinite(time) && formatDay(lang, time)) || label;
      },
      foreign: (text) => {
        const d = detectLang(text);
        return !!d && (lang === "bn" ? d.lang === "en" : d.lang === "bn");
      },
      la: (text) => langAttrs(text, lang),
      setLang: onChange,
    };
  }, [lang, dict, onChange]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Renders a translated heading that keeps its line breaks ("\n") and its accent word ("*word*"). */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*[^*]+\*)/).map((part, j) =>
            part.length > 2 && part.startsWith("*") && part.endsWith("*") ? (
              <span key={j} className="font-editorial italic">{part.slice(1, -1)}</span>
            ) : (
              part
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}
