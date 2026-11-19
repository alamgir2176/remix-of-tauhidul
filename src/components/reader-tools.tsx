import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Headphones, Minus, Pause, Play, Plus, Square } from "lucide-react";

const SCALE_KEY = "tauhidul-reader-scale";
const SCALES = [0.9, 1, 1.12, 1.25, 1.4];
const RATE_KEY = "tauhidul-reader-rate";
const VOICE_KEY = "tauhidul-reader-voice";
const RATES = [0.8, 0.92, 1.05, 1.2];

function readScale(): number {
  try {
    const v = Number(window.localStorage.getItem(SCALE_KEY));
    return SCALES.includes(v) ? v : 1;
  } catch {
    return 1;
  }
}

/** Splits text into pieces short enough for every browser's speech engine. */
function pieces(text: string): string[] {
  return (text.match(/[^.!?।\n]+[.!?।]?/g) ?? []).map((t) => t.trim()).filter(Boolean).flatMap((t) => (t.length > 220 ? t.match(/.{1,200}(\s|$)/g) ?? [t] : [t]));
}

/** Voices that sound human tend to be the "natural", "neural", "online" or "enhanced" ones; plain local ones sound robotic. */
function score(v: SpeechSynthesisVoice, lang: string): number {
  const n = v.name.toLowerCase();
  let s = 0;
  if (v.lang.toLowerCase().replace("_", "-").startsWith(lang.slice(0, 2))) s += 40;
  if (v.lang.toLowerCase().replace("_", "-") === lang.toLowerCase()) s += 6;
  if (/natural|neural|online|premium|enhanced|wavenet/.test(n)) s += 30;
  if (/google/.test(n)) s += 14;
  if (/aria|jenny|sonia|libby|samantha|ava|serena|nabanita|tanishaa|bashkar|pradeep/.test(n)) s += 8;
  if (/compact|espeak|robot/.test(n)) s -= 20;
  return s;
}

function useVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener?.("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", load);
  }, []);
  return voices;
}

interface Unit {
  el: HTMLElement;
  text: string;
}

/** Reading comfort: a thin progress line, text size, and the browser's own read-aloud. Nothing is downloaded. */
export function ReaderTools() {
  const { t, num } = useI18n();
  const [scale, setScale] = useState(1);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [canSpeak, setCanSpeak] = useState(false);
  const [rate, setRate] = useState(0.92);
  const [voiceName, setVoiceName] = useState("");
  const [position, setPosition] = useState({ at: 0, of: 0 });
  const bar = useRef<HTMLSpanElement>(null);
  const run = useRef(0);
  const units = useRef<Unit[]>([]);
  const index = useRef(0);
  const marked = useRef<HTMLElement | null>(null);
  const voices = useVoices();

  const [lang, setLang] = useState("en");
  const choices = voices.filter((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2))).sort((a, b) => score(b, lang) - score(a, lang));
  const voice = choices.find((v) => v.name === voiceName) ?? choices[0];

  useEffect(() => {
    setScale(readScale());
    setCanSpeak("speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined");
    try {
      const r = Number(window.localStorage.getItem(RATE_KEY));
      if (RATES.includes(r)) setRate(r);
      setVoiceName(window.localStorage.getItem(VOICE_KEY) ?? "");
    } catch { /* ignore */ }
    const text = document.querySelector<HTMLElement>(".article-body")?.innerText ?? "";
    setLang(/[ঀ-৿]/.test(text) ? "bn-BD" : "en-US");
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--reader-scale", String(scale));
    return () => document.documentElement.style.removeProperty("--reader-scale");
  }, [scale]);

  // Progress through the article body.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const body = document.querySelector<HTMLElement>(".article-body");
      if (!body || !bar.current) return;
      const rect = body.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = total > 0 ? Math.min(1, Math.max(0, (window.innerHeight * 0.2 - rect.top) / total)) : 0;
      bar.current.style.transform = `scaleX(${done})`;
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, []);

  const mark = useCallback((el: HTMLElement | null) => {
    marked.current?.classList.remove("is-speaking");
    marked.current = el;
    el?.classList.add("is-speaking");
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < 90 || r.bottom > window.innerHeight - 90) {
        el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    }
  }, []);

  const halt = useCallback(() => {
    run.current += 1;
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  }, []);
  const stop = useCallback(() => {
    halt();
    mark(null);
    index.current = 0;
    setState("idle");
  }, [halt, mark]);
  useEffect(() => stop, [stop]);

  const play = useCallback((from: number) => {
    halt();
    const id = ++run.current;
    setState("playing");
    const go = (i: number) => {
      const unit = units.current[i];
      if (id !== run.current) return;
      if (!unit) { mark(null); index.current = 0; setState("idle"); return; }
      index.current = i;
      setPosition({ at: i + 1, of: units.current.length });
      mark(unit.el);
      const parts = pieces(unit.text);
      const say = (k: number) => {
        const part = parts[k];
        if (id !== run.current) return;
        if (!part) { go(i + 1); return; }
        const u = new SpeechSynthesisUtterance(part);
        u.lang = voice?.lang ?? lang;
        if (voice) u.voice = voice;
        u.rate = rate;
        u.pitch = 1;
        u.onend = () => say(k + 1);
        u.onerror = (e) => { if (e.error !== "interrupted" && e.error !== "canceled" && id === run.current) stop(); };
        window.speechSynthesis.speak(u);
      };
      say(0);
    };
    go(from);
  }, [halt, mark, stop, voice, lang, rate]);

  function listen() {
    if (state !== "idle") { stop(); return; }
    const body = document.querySelector<HTMLElement>(".article-body");
    if (!body) return;
    const els = Array.from(body.querySelectorAll<HTMLElement>(":scope > p, :scope > h2, :scope > h3, :scope > h4, :scope > blockquote, :scope > ul > li, :scope > ol > li"));
    units.current = els.map((el) => ({ el, text: el.innerText.replace(/\s+/g, " ").trim() })).filter((u) => u.text);
    if (units.current.length === 0) return;
    // Start from the paragraph nearest the top of the screen, so "Listen" continues where you are reading.
    const start = units.current.findIndex((u) => u.el.getBoundingClientRect().bottom > 120);
    play(start < 0 ? 0 : start);
  }
  function togglePause() {
    if (state === "playing") { halt(); setState("paused"); }
    else if (state === "paused") play(index.current);
  }
  function chooseRate() {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length] ?? 0.92;
    setRate(next);
    try { window.localStorage.setItem(RATE_KEY, String(next)); } catch { /* ignore */ }
  }
  function chooseVoice(name: string) {
    setVoiceName(name);
    try { window.localStorage.setItem(VOICE_KEY, name); } catch { /* ignore */ }
  }
  // A change of speed or voice while reading takes effect from the current paragraph.
  const live = useRef({ rate, voiceName });
  useEffect(() => {
    if (live.current.rate !== rate || live.current.voiceName !== voiceName) {
      live.current = { rate, voiceName };
      if (state === "playing") play(index.current);
    }
  }, [rate, voiceName, state, play]);

  function change(step: number) {
    const at = SCALES.indexOf(scale);
    const to = SCALES[Math.min(SCALES.length - 1, Math.max(0, at + step))] ?? 1;
    setScale(to);
    try { window.localStorage.setItem(SCALE_KEY, String(to)); } catch { /* ignore */ }
  }

  const active = state !== "idle";
  return (
    <>
      <div className="reader-progress" aria-hidden="true"><span ref={bar} /></div>
      <div className="reader-tools" role="group" aria-label={t("Reading options")}>
        <button type="button" onClick={() => change(-1)} disabled={scale <= SCALES[0]!} aria-label={t("Smaller text")}><Minus aria-hidden="true" /></button>
        <span aria-hidden="true">Aa</span>
        <button type="button" onClick={() => change(1)} disabled={scale >= SCALES[SCALES.length - 1]!} aria-label={t("Larger text")}><Plus aria-hidden="true" /></button>
        {canSpeak && (
          <button type="button" className="reader-listen" onClick={listen} aria-pressed={active}>
            {active ? <Square aria-hidden="true" /> : <Headphones aria-hidden="true" />}
            <span>{active ? t("Stop") : t("Listen")}</span>
          </button>
        )}
      </div>
      {active && (
        <div className="listen-bar" role="group" aria-label={t("Read-aloud controls")}>
          <button type="button" className="listen-main" onClick={togglePause} aria-label={state === "playing" ? t("Pause") : t("Resume")}>
            {state === "playing" ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <span className="listen-status" role="status">{state === "playing" ? t("Reading aloud") : t("Paused")} <small>{num(position.at)} / {num(position.of)}</small></span>
          <button type="button" className="listen-rate" onClick={chooseRate} aria-label={t("Change speed")}>{rate === 0.92 ? t("Calm") : rate < 0.92 ? t("Slow") : rate < 1.1 ? t("Normal") : t("Quick")}</button>
          {choices.length > 1 && (
            <select className="listen-voice" aria-label={t("Voice")} value={voice?.name ?? ""} onChange={(e) => chooseVoice(e.target.value)}>
              {choices.slice(0, 8).map((v) => <option key={v.name} value={v.name}>{v.name.replace(/^(Microsoft|Google)\s+/, "")}</option>)}
            </select>
          )}
          <button type="button" className="listen-stop" onClick={stop} aria-label={t("Stop reading")}><Square aria-hidden="true" /></button>
        </div>
      )}
    </>
  );
}
