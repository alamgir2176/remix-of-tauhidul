import { useEffect, useState } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import { THEMES, applyTheme, readTheme, type ThemeId } from "@/lib/theme";

const META: Record<ThemeId, { label: string; Icon: typeof Sun }> = {
  minimal: { label: "Natural", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
  colorful: { label: "Colorful", Icon: Palette },
};

/** Three-way switch: Natural, Dark, Colorful. The choice is remembered in the browser. */
export function ThemeSwitcher({ labeled = false }: { labeled?: boolean }) {
  // Unknown until mounted, so server and browser render the same markup.
  const [theme, setTheme] = useState<ThemeId | null>(null);
  useEffect(() => {
    const sync = () => setTheme(readTheme());
    sync();
    window.addEventListener("theme-change", sync);
    return () => window.removeEventListener("theme-change", sync);
  }, []);
  return (
    <div className={`theme-switch${labeled ? " is-labeled" : ""}`} role="group" aria-label="Website theme">
      {THEMES.map((id) => {
        const { label, Icon } = META[id];
        return (
          <button key={id} type="button" className="theme-option" aria-pressed={theme === id} title={`${label} theme`} onClick={() => applyTheme(id)}>
            <Icon aria-hidden="true" />
            {labeled ? label : <span className="sr-only">{label} theme</span>}
          </button>
        );
      })}
    </div>
  );
}

/** One round button for small screens: shows the current theme and moves to the next one on each tap. */
export function ThemeCycle() {
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
    <button type="button" className="theme-cycle" aria-label={`Theme: ${label}. Switch to the next theme`} title={`${label} theme. Tap to change`} onClick={next}>
      <Icon aria-hidden="true" />
    </button>
  );
}
