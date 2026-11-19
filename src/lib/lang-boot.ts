import { LANG_COOKIE } from "@/lib/i18n";

/** Runs in <head> before first paint: sets <html lang> from the saved choice so screen readers and fonts are right immediately. */
export const LANG_BOOT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)${LANG_COOKIE}=(bn|en)/);if(m){document.documentElement.setAttribute("lang",m[1]);}}catch(e){}})();`;
