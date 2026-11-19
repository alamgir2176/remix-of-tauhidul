import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useCallback, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteIntro } from "../components/site-intro";
import { ImageGuard } from "../components/image-guard";
import { ScrollReveal } from "../components/scroll-reveal";
import { SearchLauncher } from "../components/search-launcher";
import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { I18nProvider, Rich, isLang, useI18n, readLangCookie, writeLangCookie, type Dict, type Lang } from "../lib/i18n";
import { bengaliFontLink } from "../lib/seo";
import { LANG_BOOT_SCRIPT } from "../lib/lang-boot";
import { readRequestLang } from "../lib/lang.functions";
import { INTRO_SKIP_SCRIPT } from "../lib/site-loading";
import { THEME_BOOT_SCRIPT } from "../lib/theme";

function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <div className="reader">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="notfound">
        <p className="micro-label">{t("Error 404")}</p>
        <h1><Rich text={t("This page *isn’t here.*")} /></h1>
        <p>{t("The address may have changed, or the page may never have existed. These places are a good way back in.")}</p>
        <ul>
          <li><Link to="/">{t("Home")}</Link></li>
          <li><Link to="/library">{t("Writing & work")}</Link></li>
          <li><Link to="/notices">{t("Updates")}</Link></li>
          <li><Link to="/activities">{t("Activities")}</Link></li>
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const { t } = useI18n();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("This page didn't load")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Something went wrong on our end. You can try refreshing or head back home.")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("Try again")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("Go home")}
          </a>
        </div>
      </div>
    </div>
  );
}

/** The visitor's language: an explicit ?lang=, else their saved choice (cookie), else English. Never throws. */
async function resolveLang(searchStr: string): Promise<{ lang: Lang; dict: Dict }> {
  let lang: Lang = "en";
  try {
    const q = /[?&]lang=(bn|en)\b/.exec(searchStr)?.[1];
    if (isLang(q)) lang = q;
    else lang = typeof window === "undefined" ? await readRequestLang() : (readLangCookie() ?? "en");
  } catch {
    lang = "en";
  }
  try {
    const mod = lang === "bn" ? await import("../../content/i18n/bn.json") : await import("../../content/i18n/en.json");
    return { lang, dict: (mod.default ?? {}) as Dict };
  } catch {
    return { lang, dict: {} };
  }
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ location }) => resolveLang(location.searchStr ?? ""),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Md Tauhidul Islam" },
      { name: "theme-color", content: "#F5F0E8" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "alternate", type: "application/rss+xml", title: "Writings: Md Tauhidul Islam", href: "/rss.xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Bengali letter shapes. Google serves these by unicode-range, so English-only pages never download them.
      bengaliFontLink,
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} suppressHydrationWarning />
        <script dangerouslySetInnerHTML={{ __html: LANG_BOOT_SCRIPT }} suppressHydrationWarning />
        <script dangerouslySetInnerHTML={{ __html: INTRO_SKIP_SCRIPT }} suppressHydrationWarning />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient, lang, dict } = Route.useRouteContext();
  const router = useRouter();

  const changeLang = useCallback(
    (next: Lang) => {
      writeLangCookie(next);
      document.documentElement.setAttribute("lang", next);
      void router.invalidate();
    },
    [router],
  );

  // Keep <html lang> right, and catch a saved choice the server did not see (for instance a cached page).
  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    const saved = readLangCookie();
    if (saved && saved !== lang && !/[?&]lang=/.test(window.location.search)) void router.invalidate();
    else if (/[?&]lang=(bn|en)\b/.test(window.location.search)) writeLangCookie(lang);
  }, [lang, router]);

  // Installable / offline reading: register once the page has settled, production only.
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    const register = () => void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
     <I18nProvider lang={lang} dict={dict} onChange={changeLang}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <SiteIntro />
      <ImageGuard />
      <SearchLauncher />
      <ScrollReveal />
     </I18nProvider>
    </QueryClientProvider>
  );
}
