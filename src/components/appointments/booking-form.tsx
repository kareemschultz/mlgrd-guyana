"use client";

/**
 * Public REO appointment booking form. A citizen picks a Region / Regional
 * Executive Officer, a preferred date (no past dates) and time slot, and gives
 * their contact details + reason. On submit it posts through the data layer
 * (`data.appointments.create`) — localStorage in demo mode, Cloudflare D1 live —
 * and shows a success card with the reference id. Seed-then-overlay does not
 * apply here (write-only public surface).
 */
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  User2,
  UserCheck,
} from "lucide-react";

import { data } from "@/lib/data/client";
import { reoOptions, reoByRegion, TIME_SLOTS } from "@/lib/reo";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Today as `yyyy-mm-dd` in local time (min for the date input). */
function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

const schema = z.object({
  region: z.string().min(1, "Please choose a region / REO."),
  date: z.string().min(1, "Please choose a preferred date."),
  time: z.string().optional(),
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().optional(),
  subject: z.string().trim().min(3, "Please add a short subject."),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;
type FieldErrors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = {
  region: "",
  date: "",
  time: "",
  name: "",
  email: "",
  phone: "",
  subject: "",
  notes: "",
};

interface Success {
  id: string;
  reoName: string;
  regionName: string;
  date: string;
  time?: string;
}

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BookingForm() {
  const [values, setValues] = React.useState<Values>(EMPTY);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<Success | null>(null);
  const reduce = useReducedMotion();

  const min = React.useMemo(() => todayISO(), []);
  const selectedReo = values.region ? reoByRegion(values.region) : undefined;

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

    const reo = reoByRegion(parsed.data.region);
    if (!reo) {
      setErrors({ region: "Please choose a valid region / REO." });
      return;
    }

    // Guard against a past date slipping through (e.g. typed input).
    if (parsed.data.date < min) {
      setErrors({ date: "Please choose today or a future date." });
      return;
    }

    setSubmitting(true);
    try {
      const created = await data.appointments.create({
        region: reo.region,
        regionName: reo.regionName,
        reoName: reo.reoName,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || undefined,
        date: parsed.data.date,
        time: parsed.data.time || undefined,
        subject: parsed.data.subject,
        notes: parsed.data.notes || undefined,
      });
      setSuccess({
        id: created.id,
        reoName: reo.reoName,
        regionName: reo.regionName,
        date: parsed.data.date,
        time: parsed.data.time || undefined,
      });
      setValues(EMPTY);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "We couldn't submit your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-brand via-gold to-brand" />
        <div className="p-7 sm:p-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-7" />
          </div>
          <h2 className="mt-5 font-heading text-2xl font-extrabold tracking-tight">
            Request received
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your appointment request with{" "}
            <span className="font-semibold text-foreground">{success.reoName}</span>{" "}
            (REO, {success.regionName}) has been logged. The REO&rsquo;s office
            will review your request and follow up by email to confirm or
            propose another time.
          </p>

          <dl className="mt-6 grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reference
              </dt>
              <dd className="mt-0.5 font-mono font-semibold text-brand-700">
                {success.id}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Preferred date
              </dt>
              <dd className="mt-0.5 font-medium">
                {fmtDate(success.date)}
                {success.time ? ` · ${success.time}` : ""}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <CalendarCheck className="size-4" />
              Book another appointment
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border bg-card shadow-sm"
      noValidate
    >
      <div className="flex items-center gap-3 border-b bg-muted/30 px-7 py-5">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
          <CalendarClock className="size-6" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-bold tracking-tight">
            Book an appointment
          </h2>
          <p className="text-sm text-muted-foreground">
            Request a meeting with your Regional Executive Officer.
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-7 sm:p-8">
        {/* Region / REO */}
        <FormField
          label="Region & REO"
          htmlFor="appt-region"
          required
          error={errors.region}
          icon={MapPin}
        >
          <Select
            value={values.region}
            onValueChange={(v) => set("region", v)}
          >
            <SelectTrigger
              id="appt-region"
              className="w-full"
              aria-invalid={!!errors.region}
            >
              <SelectValue placeholder="Choose your region…" />
            </SelectTrigger>
            <SelectContent>
              {reoOptions.map((o) => (
                <SelectItem key={o.region} value={o.region}>
                  {o.region} — {o.regionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedReo && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand/5 px-3 py-1.5 text-sm text-brand-700">
              <UserCheck className="size-4" />
              Your REO:{" "}
              <span className="font-semibold">{selectedReo.reoName}</span>
            </p>
          )}
        </FormField>

        {/* Date + time */}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Preferred date"
            htmlFor="appt-date"
            required
            error={errors.date}
            icon={CalendarCheck}
          >
            <DatePicker
              id="appt-date"
              value={values.date}
              onChange={(iso) => set("date", iso)}
              min={min}
              invalid={!!errors.date}
              placeholder="Choose a date"
            />
          </FormField>

          <FormField
            label="Preferred time slot"
            htmlFor="appt-time"
            error={errors.time}
            icon={CalendarClock}
          >
            <Select value={values.time} onValueChange={(v) => set("time", v)}>
              <SelectTrigger id="appt-time" className="w-full">
                <SelectValue placeholder="Any office-hours slot" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {/* Name + email */}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Full name"
            htmlFor="appt-name"
            required
            error={errors.name}
            icon={User2}
          >
            <Input
              id="appt-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Jane Citizen"
              autoComplete="name"
              aria-invalid={!!errors.name}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="appt-email"
            required
            error={errors.email}
            icon={Mail}
          >
            <Input
              id="appt-email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
          </FormField>
        </div>

        {/* Phone */}
        <FormField
          label="Phone (optional)"
          htmlFor="appt-phone"
          error={errors.phone}
          icon={Phone}
        >
          <Input
            id="appt-phone"
            type="tel"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+592 …"
            autoComplete="tel"
          />
        </FormField>

        {/* Subject */}
        <FormField
          label="Subject"
          htmlFor="appt-subject"
          required
          error={errors.subject}
        >
          <Input
            id="appt-subject"
            value={values.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="What is your appointment about?"
            aria-invalid={!!errors.subject}
          />
        </FormField>

        {/* Notes */}
        <FormField
          label="Additional notes (optional)"
          htmlFor="appt-notes"
          error={errors.notes}
        >
          <Textarea
            id="appt-notes"
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={4}
            placeholder="Any background or details that will help the REO's office prepare."
          />
        </FormField>

        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <p className="text-xs text-muted-foreground">
            The REO&rsquo;s office will follow up by email to confirm.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Request appointment
              </>
            )}
          </button>
        </div>
      </div>
    </motion.form>
  );
}

/** A labelled form control with optional icon + inline error. */
function FormField({
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
      {error && (
        <p className="text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
