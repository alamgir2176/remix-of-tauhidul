import { createServerFn } from "@tanstack/react-start";
import { contactSchema } from "@/lib/contact-schema";
export { contactSchema } from "@/lib/contact-schema";

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_submissions").insert({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
    });
    if (error) {
      console.error("contact insert failed", error.message);
      throw new Error("Could not send your message. Please try again later.");
    }
    return { ok: true };
  });
