import { describe, expect, it } from "vitest";
import { profileJsonLd, publicHomepage } from "./site-metadata";

describe("Profile structured data", () => {
  it("describes the person with the verified public identity", () => {
    const jsonLd = profileJsonLd();
    expect(jsonLd["@type"]).toBe("ProfilePage");
    expect(jsonLd.mainEntity.name).toBe("Md Tauhidul Islam");
    expect(jsonLd.mainEntity.sameAs).toContain("https://www.linkedin.com/in/md-tauhidul-islam-910612331");
    expect(jsonLd.mainEntity.alumniOf.name).toBe("Jahangirnagar University");
    expect(jsonLd.mainEntity.address.addressLocality).toBe("Dhaka");
  });
});

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