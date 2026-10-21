import { describe, expect, it } from "vitest";
import { publicHomepage } from "./site-metadata";

describe("Public homepage metadata", () => {
  it("does not invent an address for an unpublished site", () => {
    expect(publicHomepage(undefined)).toBeUndefined();
    expect(publicHomepage("/")).toBeUndefined();
  });
  it("normalizes a configured HTTPS homepage without section or query fragments", () => {
    expect(publicHomepage("https://example.org/?source=link#contact")).toBe("https://example.org/");
  });
  it("rejects unsafe protocols and credentials", () => {
    expect(publicHomepage("http://example.org")).toBeUndefined();
    expect(publicHomepage("https://user:password@example.org")).toBeUndefined();
  });
});