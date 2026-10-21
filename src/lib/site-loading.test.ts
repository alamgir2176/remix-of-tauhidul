import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrapIntro, INTRO_READING_MS, INTRO_RECOVERY_MS, INTRO_SEEN_KEY, INTRO_SKIP_SCRIPT } from "./site-loading";

const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

describe("Genuine website loading", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    document.documentElement.className = "";
    delete document.documentElement.dataset["introProgress"];
    document.body.innerHTML = "";
    window.history.replaceState(null, "", "/");
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  });
  afterEach(() => {
    window.dispatchEvent(new Event("intro-dismiss"));
    Reflect.deleteProperty(document, "fonts");
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const start = () => bootstrapIntro(INTRO_SEEN_KEY, INTRO_RECOVERY_MS, INTRO_READING_MS);
  it("runs the serialized head bootstrap independently of module bindings", async () => {
    window.eval(INTRO_SKIP_SCRIPT);
    await flush();
    expect(document.documentElement.dataset["introProgress"]).toBe("100");
    expect(document.documentElement).toHaveClass("intro-loaded");
    await vi.advanceTimersByTimeAsync(4200);
    expect(document.documentElement).toHaveClass("intro-ready");
  });
  const pendingImage = (lazy = false) => {
    const image = document.createElement("img");
    if (lazy) image.loading = "lazy";
    vi.spyOn(image, "complete", "get").mockReturnValue(false);
    document.body.append(image);
    return image;
  };

  it("keeps the first quotation readable for 4.2 seconds, without pretending resources are still loading", async () => {
    start();
    await flush();
    expect(document.documentElement).toHaveClass("intro-loaded");
    await vi.advanceTimersByTimeAsync(4199);
    expect(document.documentElement).not.toHaveClass("intro-ready");
    await vi.advanceTimersByTimeAsync(1);
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
    await vi.advanceTimersByTimeAsync(4200);
    decode?.();
    await flush();
    expect(document.documentElement).toHaveClass("intro-ready");
  });

  it("does not hold the website for below-fold lazy photos", async () => {
    pendingImage(true);
    start();
    await flush();
    await vi.advanceTimersByTimeAsync(4200);
    expect(document.documentElement).toHaveClass("intro-ready");
  });

  it("reveals available content if an eager photo fails", async () => {
    const image = pendingImage();
    start();
    image.dispatchEvent(new Event("error"));
    await flush();
    await vi.advanceTimersByTimeAsync(4200);
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

  it("allows immediate entry during the reading window", async () => {
    start();
    await flush();
    window.dispatchEvent(new Event("intro-dismiss"));
    expect(document.documentElement).toHaveClass("intro-ready");
  });

  it("reports completed resources, including image decoding, without timer-based progress", async () => {
    const first = pendingImage();
    const second = pendingImage();
    const fonts = Promise.resolve();
    Object.defineProperty(document, "fonts", { configurable: true, value: { ready: fonts } });
    start();
    expect(document.documentElement.dataset["introProgress"]).toBe("25");
    await flush();
    expect(document.documentElement.dataset["introProgress"]).toBe("50");
    await vi.advanceTimersByTimeAsync(1000);
    expect(document.documentElement.dataset["introProgress"]).toBe("50");
    first.dispatchEvent(new Event("error"));
    await flush();
    expect(document.documentElement.dataset["introProgress"]).toBe("75");
    second.dispatchEvent(new Event("error"));
    await flush();
    expect(document.documentElement.dataset["introProgress"]).toBe("100");
  });
});