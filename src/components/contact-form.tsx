import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contactSchema } from "@/lib/contact-schema";
import { getContactProvider, submitHostedContact } from "@/lib/hosted-contact";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError("");
    setStatus("sending");
    try {
      const provider = getContactProvider(import.meta.env['VITE_CONTACT_PROVIDER']);
      if (provider === "cloud") {
        const { submitContact } = await import("@/lib/contact.functions");
        await submitContact({ data: parsed.data });
      } else {
        const config = provider === "web3forms"
          ? import.meta.env['VITE_WEB3FORMS_KEY']
          : import.meta.env['VITE_FORMSPREE_ENDPOINT'];
        await submitHostedContact(provider, parsed.data, config);
      }
      setStatus("sent");
      form.reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="contact-success" role="status">
        <p className="font-display text-3xl">Thank you.</p>
        <p className="mt-2 text-muted-foreground">Your message has been received.</p>
        <Button onClick={() => setStatus("idle")} variant="link" className="mt-6 px-0">
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form name="contact" onSubmit={onSubmit} noValidate className="space-y-9" aria-busy={status === "sending"}>
      <input type="hidden" name="form-name" value="contact" />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Name" name="name" error={errors["name"]} autoComplete="name" />
        <Field label="Email" name="email" type="email" error={errors["email"]} autoComplete="email" />
      </div>
      <Field label="Subject (optional)" name="subject" error={errors["subject"]} />
      <div>
        <label htmlFor="message" className="form-label">Message</label>
        <textarea
          id="message"
          name="message"
          rows={3}
          maxLength={2000}
          required
          aria-invalid={Boolean(errors["message"])}
          aria-describedby={errors["message"] ? "message-error" : undefined}
          className="mt-2 w-full resize-none border-b border-input bg-transparent py-2 outline-none transition-colors focus:border-foreground"
        />
        {errors["message"] && <p id="message-error" role="alert" className="mt-1 text-sm text-destructive">{errors["message"]}</p>}
      </div>
      {status === "error" && <p role="alert" className="text-sm text-destructive">{serverError}</p>}
      <Button
        type="submit"
        disabled={status === "sending"}
        className="h-14 w-full justify-between rounded-none px-6 sm:w-auto sm:min-w-52"
      >
        {status === "sending" ? "Sending…" : "Send message"} <ArrowUpRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string | undefined;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="form-label">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={name !== "subject"}
        maxLength={name === "name" ? 100 : name === "email" ? 255 : 150}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="mt-2 w-full border-b border-input bg-transparent py-2 outline-none transition-colors focus:border-foreground"
      />
      {error && <p id={`${name}-error`} role="alert" className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
