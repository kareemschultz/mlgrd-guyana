"use client";

/**
 * Simple "Contact this NDC" form shown on each NDC detail page.
 *
 * Per the client: NDCs aren't digitised yet, so for now every enquiry routes to
 * ONE central destination — it lands in the admin inbox (data.messages, tagged
 * with the NDC) and, if NEXT_PUBLIC_FORM_ENDPOINT is set, is also emailed to one
 * address. Later this can fan out to a per-NDC email via `ndcRouting` below.
 */
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import {
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  User2,
} from "lucide-react";

import { data } from "@/lib/data/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * Where NDC enquiries are delivered. Empty for now → the central Ministry inbox
 * (and NEXT_PUBLIC_FORM_ENDPOINT email if configured). Add `"<ndc name>":
 * "council@example.gov.gy"` entries here to route specific NDCs to their own
 * email once they're set up.
 */
const ndcRouting: Record<string, string> = {};

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().optional(),
  subject: z.string().trim().min(3, "Please add a short subject."),
  message: z.string().trim().min(10, "Please enter your message."),
});

type Values = z.infer<typeof schema>;
type FieldErrors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { name: "", email: "", phone: "", subject: "", message: "" };

export function NdcContactForm({
  ndcName,
  region,
  regionName,
}: {
  ndcName: string;
  region: string;
  regionName: string;
}) {
  const [values, setValues] = React.useState<Values>(EMPTY);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [doneRef, setDoneRef] = React.useState<string | null>(null);
  const reduce = useReducedMotion();

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Values;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const routeTo = ndcRouting[ndcName] || ""; // empty = central
      const created = await data.messages.create({
        channel: "contact",
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        category: `NDC — ${ndcName} (${region})`,
        body: [
          parsed.data.message,
          "",
          `— Sent via the ${ndcName} NDC contact form (${region}, ${regionName}).`,
          parsed.data.phone ? `Phone: ${parsed.data.phone}` : "",
          routeTo ? `Routed to: ${routeTo}` : "Routed to: central Ministry inbox",
        ]
          .filter(Boolean)
          .join("\n"),
      });

      // Optional email delivery (one address now) via a form endpoint.
      const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
      if (endpoint) {
        try {
          await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              _subject: `[NDC: ${ndcName}] ${parsed.data.subject}`,
              ndc: ndcName,
              region,
              name: parsed.data.name,
              email: parsed.data.email,
              phone: parsed.data.phone,
              message: parsed.data.message,
              deliverTo: routeTo || undefined,
            }),
          });
        } catch {
          /* inbox already has it; email is best-effort */
        }
      }

      setDoneRef(created.id);
      setValues(EMPTY);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "We couldn't send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (doneRef) {
    return (
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border bg-card p-7 text-center shadow-sm sm:p-8"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="mt-4 font-heading text-xl font-bold">Message sent</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Thank you. Your enquiry for the{" "}
          <span className="font-semibold text-foreground">{ndcName}</span> NDC has
          been received and routed to the Ministry. You&rsquo;ll get a reply by email.
        </p>
        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-lg border bg-secondary px-4 py-2 text-sm">
          <span className="text-muted-foreground">Reference</span>
          <span className="font-mono font-semibold text-brand-700">{doneRef}</span>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setDoneRef(null)}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Send another message
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      <div className="flex items-center gap-3 border-b bg-muted/30 px-6 py-5">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
          <MessageSquareText className="size-5" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-bold">Contact this NDC</h2>
          <p className="text-sm text-muted-foreground">
            Send an enquiry to {ndcName}. It&rsquo;s routed to the Ministry, who
            will respond.
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-6 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="ndc-name" required error={errors.name} icon={User2}>
            <Input
              id="ndc-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Jane Citizen"
              autoComplete="name"
              aria-invalid={!!errors.name}
            />
          </Field>
          <Field label="Email" htmlFor="ndc-email" required error={errors.email} icon={Mail}>
            <Input
              id="ndc-email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone (optional)" htmlFor="ndc-phone" icon={Phone}>
            <Input
              id="ndc-phone"
              type="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+592 …"
              autoComplete="tel"
            />
          </Field>
          <Field label="Subject" htmlFor="ndc-subject" required error={errors.subject}>
            <Input
              id="ndc-subject"
              value={values.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="What is this about?"
              aria-invalid={!!errors.subject}
            />
          </Field>
        </div>

        <Field label="Message" htmlFor="ndc-message" required error={errors.message}>
          <Textarea
            id="ndc-message"
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            rows={5}
            placeholder={`How can the ${ndcName} NDC help?`}
            aria-invalid={!!errors.message}
          />
        </Field>

        {formError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <div className="flex items-center justify-end border-t pt-5">
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                <Send className="size-4" /> Send message
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  icon: Icon,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="flex items-center gap-1.5 text-sm">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        <span>{label}</span>
        {required && <span className="text-flag-red">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
