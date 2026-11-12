import { z } from "zod";
import type { ContactData } from "@/lib/contact-schema";
import { getContactProvider, submitHostedContact } from "@/lib/hosted-contact";

export const cvRequestSchema = z.object({
  name: z.string().trim().min(1, "Please enter your full name").max(100),
  identity: z.string().trim().min(5, "Please tell me briefly who you are").max(300),
  email: z.string().trim().email("Please enter a valid email").max(255),
  reason: z.string().trim().min(10, "Please share a little more about why you need my CV").max(1000),
  website: z.string().max(0),
});

export type CvRequestData = z.infer<typeof cvRequestSchema>;

/** Wraps the request in the existing message shape so it arrives, clearly labelled, like any other message. */
export function toRequestMessage(data: CvRequestData): ContactData {
  return {
    name: data.name,
    email: data.email,
    subject: `CV request — ${data.name}`.slice(0, 150),
    message: `CV / RESUME REQUEST\n\nWho I am:\n${data.identity}\n\nWhy I am requesting your CV:\n${data.reason}`,
    website: data.website,
  };
}

/**
 * Sends the request. It never reveals or emails the CV: the owner decides by replying manually.
 *
 * Delivery uses the same kind of hosted form as the contact form but is configured separately:
 *   VITE_CV_REQUEST_PROVIDER   optional, defaults to VITE_CONTACT_PROVIDER
 *   VITE_CV_REQUEST_KEY        optional Web3Forms access key, defaults to VITE_WEB3FORMS_KEY
 *   VITE_CV_REQUEST_ENDPOINT   optional Formspree endpoint, defaults to VITE_FORMSPREE_ENDPOINT
 * The contact form's own code and configuration are not touched.
 */
export async function submitCvRequest(data: CvRequestData): Promise<void> {
  const env = import.meta.env;
  const provider = getContactProvider(env["VITE_CV_REQUEST_PROVIDER"] || env["VITE_CONTACT_PROVIDER"]);
  const message = toRequestMessage(data);
  if (provider === "cloud") {
    const { submitContact } = await import("@/lib/contact.functions");
    await submitContact({ data: message });
    return;
  }
  const config =
    provider === "web3forms"
      ? env["VITE_CV_REQUEST_KEY"] || env["VITE_WEB3FORMS_KEY"]
      : env["VITE_CV_REQUEST_ENDPOINT"] || env["VITE_FORMSPREE_ENDPOINT"];
  await submitHostedContact(provider, message, config);
}
