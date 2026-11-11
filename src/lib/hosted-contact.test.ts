import { afterEach, describe, expect, it, vi } from "vitest";
import { getContactProvider, submitHostedContact } from "./hosted-contact";

const data = {
  name: "Test",
  email: "test@example.com",
  subject: "",
  message: "A test message.",
  website: "",
};
afterEach(() => vi.unstubAllGlobals());

describe("hosted contact delivery", () => {
  it("preserves Cloud unless a hosted provider is explicitly selected", () => {
    expect(getContactProvider(undefined)).toBe("cloud");
    expect(getContactProvider("netlify")).toBe("netlify");
    expect(getContactProvider("formspree")).toBe("formspree");
    expect(() => getContactProvider("invalid")).toThrow();
  });
  it("posts Netlify fields to its static detection path without a database", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("received", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await submitHostedContact("netlify", data);
    const [url, options] = fetchMock.mock.calls[0] as [string, { body: URLSearchParams }];
    expect(url).toBe("/__forms.html");
    expect(options.body.get("form-name")).toBe("contact");
    expect(options.body.get("message")).toBe("A test message.");
  });
  it("never claims success when static HTML is returned instead of form capture", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("contact-detection-only")));
    await expect(submitHostedContact("netlify", data)).rejects.toThrow("not available");
  });
  it("requires a real Formspree endpoint before sending", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(submitHostedContact("formspree", data)).rejects.toThrow("not configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("reports unsuccessful hosted submissions", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    await expect(
      submitHostedContact("formspree", data, "https://formspree.io/f/abc123"),
    ).rejects.toThrow("Could not send");
  });
  it("sends Web3Forms with the access key and requires success", async () => {
    const key = "12345678-1234-1234-1234-123456789abc";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true })));
    vi.stubGlobal("fetch", fetchMock);
    await submitHostedContact("web3forms", data, key);
    const [url, options] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(url).toBe("https://api.web3forms.com/submit");
    expect(JSON.parse(options.body).access_key).toBe(key);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false }))),
    );
    await expect(submitHostedContact("web3forms", data, key)).rejects.toThrow("Could not send");
  });
  it("requires a Web3Forms key before sending", async () => {
    await expect(submitHostedContact("web3forms", data)).rejects.toThrow("not configured");
  });
});
