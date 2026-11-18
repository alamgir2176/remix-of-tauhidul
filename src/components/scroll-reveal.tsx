import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const TARGETS = [
  ".section-label", ".section-heading", ".statement", ".about-body", ".card-grid > *", ".photo-grid > *",
  ".doc-row", ".experience-stories > *", ".perspective-item", ".explore li", ".quote-list > li", ".now-list > *",
  ".read-next li", ".contact-form-wrap",
].join(",");

/**
 * Sections ease in as they scroll into view. Only elements that start below the fold are touched, and
 * only after the page has loaded, so without JavaScript (or with reduced motion) everything is simply there.
 */
export function ScrollReveal() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (path.startsWith("/writings/")) return; // articles stay perfectly still while you read
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add("is-in");
          io.unobserve(el);
          // Once settled, hand the element back to its normal hover styles.
          window.setTimeout(() => { el.classList.remove("rv", "is-in"); el.style.removeProperty("--rv-d"); }, 1100);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    const raf = window.requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(TARGETS).forEach((el, i) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
        el.style.setProperty("--rv-d", `${(i % 3) * 70}ms`);
        el.classList.add("rv");
        io.observe(el);
      });
    });
    return () => {
      window.cancelAnimationFrame(raf);
      io.disconnect();
      document.querySelectorAll(".rv:not(.is-in)").forEach((el) => el.classList.add("is-in"));
    };
  }, [path]);
  return null;
}
