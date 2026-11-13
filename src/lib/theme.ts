export const THEME_KEY = "tauhidul-theme";
export const THEMES = ["minimal", "dark", "colorful"] as const;
export type ThemeId = (typeof THEMES)[number];

export function isTheme(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

/**
 * Runs in <head> before first paint so the saved theme never flashes.
 * Uses explicit window-owned APIs because this string is injected as-is.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=window.localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="dark"||t==="colorful"||t==="minimal"){window.document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export function readTheme(): ThemeId {
  const current =
    typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") : null;
  return isTheme(current) ? current : "minimal";
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.add("theme-is-changing");
  window.setTimeout(() => document.documentElement.classList.remove("theme-is-changing"), 420);
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* Storage may be unavailable. */
  }
  window.dispatchEvent(new Event("theme-change"));
}
