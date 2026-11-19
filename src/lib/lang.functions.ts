import { createServerFn } from "@tanstack/react-start";
import type { Lang } from "@/lib/i18n";

/** Reads the visitor's saved language from the request cookie, so the first page they see is already in it. Any failure means English. */
export const readRequestLang = createServerFn({ method: "GET" }).handler(async (): Promise<Lang> => {
  try {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const m = /(?:^|;\s*)tauhidul-lang=(bn|en)/.exec(getRequestHeader("cookie") ?? "");
    return m?.[1] === "bn" ? "bn" : "en";
  } catch {
    return "en";
  }
});
