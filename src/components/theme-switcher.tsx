import { useEffect, useState } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { THEMES, applyTheme, readTheme, type ThemeId } from "@/lib/theme";

const META: Record<ThemeId, { label: string; Icon: typeof Sun }> = {
  minimal: { label: "Natural", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
  colorful: { label: "Colorful", Icon: Palette },
};

/** Three-way switch: Natural, Dark, Colorful. The choice is remembered in the browser. */
export function ThemeSwitcher({ labeled = false }: { labeled?: boolean }) {
  const { t } = useI18n();
  // Unknown until mounted, so server and browser render the same markup.
  const [theme, setTheme] = useState<ThemeId | null>(null);
  useEffect(() => {
    const sync = () => setTheme(readTheme());
    sync();
    window.addEventListener("theme-change", sync);
    return () => window.removeEventListener("theme-change", sync);
  }, []);
  return (
    <div className={`theme-switch${labeled ? " is-labeled" : ""}`} role="group" aria-label={t("Website theme")}>
      {THEMES.map((id) => {
        const { label, Icon } = META[id];
        return (
          <button key={id} type="button" className="theme-option" aria-pressed={theme === id} title={t("{label} theme", { label: t(label) })} onClick={() => applyTheme(id)}>
            <Icon aria-hidden="true" />
            {labeled ? t(label) : <span className="sr-only">{t("{label} theme", { label: t(label) })}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** One round button for small screens: shows the current theme and moves to the next one on each tap. */
export function ThemeCycle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<ThemeId | null>(null);
  useEffect(() => {
    const sync = () => setTheme(readTheme());
    sync();
    window.addEventListener("theme-change", sync);
    return () => window.removeEventListener("theme-change", sync);
  }, []);
  const current: ThemeId = theme ?? "minimal";
  const { label, Icon } = META[current];
  const next = () => applyTheme(THEMES[(THEMES.indexOf(current) + 1) % THEMES.length] ?? "minimal");
  return (
    <button type="button" className="theme-cycle" aria-label={t("Theme: {label}. Switch to the next theme", { label: t(label) })} title={t("{label} theme. Tap to change", { label: t(label) })} onClick={next}>
      <Icon aria-hidden="true" />
    </button>
  );
}
