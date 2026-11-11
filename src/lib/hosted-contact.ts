import type { ContactData } from "@/lib/contact-schema";

export type ContactProvider = "cloud" | "netlify" | "formspree" | "web3forms";

export function getContactProvider(value: string | undefined): ContactProvider {
  if (value === "netlify" || value === "formspree" || value === "web3forms") return value;
  if (value && value !== "cloud") throw new Error("Contact delivery is not configured correctly.");
  return "cloud";
}

const NOT_CONFIGURED = "Contact delivery is not configured yet. Please connect through LinkedIn.";

/** `config` is the Formspree endpoint or the Web3Forms access key. */
export async function submitHostedContact(
  provider: Exclude<ContactProvider, "cloud">,
  data: ContactData,
  config?: string,
): Promise<void> {
  if (
    provider === "formspree" &&
    (!config || !/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(config))
  ) {
    throw new Error(NOT_CONFIGURED);
  }
  if (provider === "web3forms" && (!config || !/^[0-9a-f-]{36}$/i.test(config))) {
    throw new Error(NOT_CONFIGURED);
  }
  const url =
    provider === "netlify"
      ? "/__forms.html"
      : provider === "web3forms"
        ? "https://api.web3forms.com/submit"
        : (config ?? "");
  const body =
    provider === "netlify"
      ? new URLSearchParams({ "form-name": "contact", ...data })
      : provider === "web3forms"
        ? JSON.stringify({
            access_key: config,
            name: data.name,
            email: data.email,
            subject: data.subject || `New message from ${data.name}`,
            message: data.message,
            from_name: "tauhidul. website",
            botcheck: data.website,
          })
        : JSON.stringify(data);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type":
        provider === "netlify" ? "application/x-www-form-urlencoded" : "application/json",
      Accept: "application/json",
    },
    body,
  });
  if (!response.ok) throw new Error("Could not send your message. Please try again later.");
  // Outside Netlify, a static server may return the detection file with HTTP 200.
  if (provider === "netlify" && (await response.text()).includes("contact-detection-only")) {
    throw new Error("Contact delivery is not available. Please connect through LinkedIn.");
  }
  if (provider === "web3forms") {
    const result = (await response.json().catch(() => ({}))) as { success?: boolean };
    if (!result.success) throw new Error("Could not send your message. Please try again later.");
  }
}
