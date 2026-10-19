import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrapIntro, INTRO_RECOVERY_MS, INTRO_SEEN_KEY } from "./site-loading";

const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

describe("Genuine website loading", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    document.documentElement.className = "";
    document.body.innerHTML = "";
    window.history.replaceState(null, "", "/");
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  });
  afterEach(() => {
    window.dispatchEvent(new Event("intro-dismiss"));
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const start = () => bootstrapIntro(INTRO_SEEN_KEY, INTRO_RECOVERY_MS);
  const pendingImage = (lazy = false) => {
    const image = document.createElement("img");
    if (lazy) image.loading = "lazy";
    vi.spyOn(image, "complete", "get").mockReturnValue(false);
    document.body.append(image);
    return image;
  };

  it("reveals a ready website without advancing a timer or enforcing a reading duration", async () => {
    start();
    await flush();
    expect(document.documentElement).toHaveClass("intro-ready");
    expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBe("1");
  });

  it("waits for an eager photo to decode, then immediately reveals", async () => {
    const image = pendingImage();
    vi.spyOn(image, "naturalWidth", "get").mockReturnValue(800);
    let decode: (() => void) | undefined;
    image.decode = () => new Promise<void>((resolve) => { decode = resolve; });
    start();
    await flush();
    expect(document.documentElement).not.toHaveClass("intro-ready");
    image.dispatchEvent(new Event("load"));
    await flush();
    expect(document.documentElement).not.toHaveClass("intro-ready");
    decode?.();
    await flush();
    expect(document.documentElement).toHaveClass("intro-ready");
  });

  it("does not hold the website for below-fold lazy photos", async () => {
    pendingImage(true);
    start();
    await flush();
    expect(document.documentElement).toHaveClass("intro-ready");
  });

  it("reveals available content if an eager photo fails", async () => {
    const image = pendingImage();
    start();
    image.dispatchEvent(new Event("error"));
    await flush();
    expect(document.documentElement).toHaveClass("intro-ready");
  });

  it("recovers at 12 seconds if a resource never settles", async () => {
    pendingImage();
    start();
    await vi.advanceTimersByTimeAsync(11999);
    expect(document.documentElement).not.toHaveClass("intro-ready");
    await vi.advanceTimersByTimeAsync(1);
    expect(document.documentElement).toHaveClass("intro-ready");
  });

  it("skips an already-seen browsing session", () => {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    start();
    expect(document.documentElement).not.toHaveClass("intro-active");
  });

  it("leaves direct section links unobstructed", () => {
    window.history.replaceState(null, "", "/#contact");
    start();
    expect(document.documentElement).not.toHaveClass("intro-active");
  });

  it.each(["Escape", "Tab"])("allows %s to dismiss before application hydration", (key) => {
    pendingImage();
    start();
    document.dispatchEvent(new KeyboardEvent("keydown", { key }));
    expect(document.documentElement).toHaveClass("intro-ready");
  });
});