import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cvRequestSchema, submitCvRequest } from "@/lib/cv-request";

const FIELD = "mt-2 w-full border-b border-input bg-transparent py-2 outline-none transition-colors focus:border-foreground";

export function CvRequestForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (Object.keys(errors).length) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);
  useEffect(() => {
    if (status === "sent") successRef.current?.focus();
  }, [status]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current) return;
    const form = e.currentTarget;
    const parsed = cvRequestSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setServerError("");
    submitting.current = true;
    setStatus("sending");
    try {
      await submitCvRequest(parsed.data);
      setStatus("sent");
      form.reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  }

  if (status === "sent") {
    return (
      <div ref={successRef} className="contact-success" role="status" tabIndex={-1}>
        <p className="font-display text-3xl">Request received.</p>
        <p className="mt-2 text-muted-foreground">I review each request personally and will reply by email if I am able to share my CV.</p>
        <Button onClick={() => setStatus("idle")} variant="link" className="mt-6 px-0">Send another request</Button>
      </div>
    );
  }

  const err = (name: string) => errors[name];
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-9" aria-busy={status === "sending"}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="cv-name" className="form-label">Full name</label>
          <input id="cv-name" name="name" type="text" autoComplete="name" required maxLength={100} aria-invalid={Boolean(err("name"))} aria-describedby={err("name") ? "cv-name-error" : undefined} className={FIELD} />
          {err("name") && <p id="cv-name-error" role="alert" className="mt-1 text-sm text-destructive">{err("name")}</p>}
        </div>
        <div>
          <label htmlFor="cv-email" className="form-label">Email address</label>
          <input id="cv-email" name="email" type="email" autoComplete="email" required maxLength={255} aria-invalid={Boolean(err("email"))} aria-describedby={err("email") ? "cv-email-error" : undefined} className={FIELD} />
          {err("email") && <p id="cv-email-error" role="alert" className="mt-1 text-sm text-destructive">{err("email")}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="cv-identity" className="form-label">Who you are (identity or professional introduction)</label>
        <input id="cv-identity" name="identity" type="text" required maxLength={300} aria-invalid={Boolean(err("identity"))} aria-describedby={err("identity") ? "cv-identity-error" : undefined} className={FIELD} />
        {err("identity") && <p id="cv-identity-error" role="alert" className="mt-1 text-sm text-destructive">{err("identity")}</p>}
      </div>
      <div>
        <label htmlFor="cv-reason" className="form-label">Why would you like my CV?</label>
        <textarea id="cv-reason" name="reason" rows={4} maxLength={1000} required aria-invalid={Boolean(err("reason"))} aria-describedby={err("reason") ? "cv-reason-error" : undefined} className={`${FIELD} resize-none`} />
        {err("reason") && <p id="cv-reason-error" role="alert" className="mt-1 text-sm text-destructive">{err("reason")}</p>}
      </div>
      {status === "error" && <p role="alert" className="text-sm text-destructive">{serverError}</p>}
      <p role="status" aria-live="polite" className="sr-only">{status === "sending" ? "Sending your request…" : ""}</p>
      <Button type="submit" disabled={status === "sending"} className="h-14 w-full justify-between rounded-none px-6 sm:w-auto sm:min-w-52">
        {status === "sending" ? "Sending…" : "Request my CV"} <ArrowUpRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
