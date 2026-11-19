import { useI18n } from "@/lib/i18n";

/** A small header button that offers the other language. */
export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const toBengali = lang === "en";
  return (
    <button
      type="button"
      className="header-lang"
      lang={toBengali ? "bn" : "en"}
      aria-label={toBengali ? "বাংলায় দেখুন (Switch to Bengali)" : t("Switch to English")}
      title={toBengali ? "বাংলায় দেখুন" : "Switch to English"}
      onClick={() => setLang(toBengali ? "bn" : "en")}
    >
      {toBengali ? "বাং" : "EN"}
    </button>
  );
}

/** Both languages side by side, for the footer and the phone menu. */
export function LanguageChoice() {
  const { lang, setLang } = useI18n();
  return (
    <div className="theme-switch is-labeled lang-choice" role="group" aria-label="Language / ভাষা">
      <button type="button" className="theme-option" lang="en" aria-pressed={lang === "en"} onClick={() => setLang("en")}>English</button>
      <button type="button" className="theme-option" lang="bn" aria-pressed={lang === "bn"} onClick={() => setLang("bn")}>বাংলা</button>
    </div>
  );
}

/** A small "In Bengali" / "In English" note, shown only when an item is not in the language the site is currently showing. */
export function LangTag({ text }: { text: string }) {
  const { foreign, lang, t } = useI18n();
  if (!foreign(text)) return null;
  return <span className="lang-tag">{lang === "bn" ? t("In English") : t("In Bengali")}</span>;
}
