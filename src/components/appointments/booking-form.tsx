"use client";

/**
 * Public REO appointment booking — a two-step wizard (Schedule → Your details)
 * that shares the look of the site's other multi-step forms. The citizen picks
 * a Region / Regional Executive Officer and a date + time slot (calendar
 * picker), then gives their contact details + reason. On submit it posts the
 * structured booking through the data layer (`data.appointments.create`) —
 * localStorage in demo mode, Cloudflare D1 live — so it lands in the admin
 * appointments inbox, and shows a success card with the reference id.
 */
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
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
import { AppointmentPicker } from "@/components/appointments/appointment-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Today as `yyyy-mm-dd` in local time (min selectable date). */
function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

const scheduleSchema = z.object({
  region: z.string().min(1, "Please choose a region / REO."),
  date: z.string().min(1, "Please choose a preferred date."),
  time: z.string().optional(),
});
const detailsSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().optional(),
  subject: z.string().trim().min(3, "Please add a short subject."),
  notes: z.string().optional(),
});
type Values = z.infer<typeof scheduleSchema> & z.infer<typeof detailsSchema>;
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

const STEPS = [
  { id: "schedule", title: "Schedule" },
  { id: "details", title: "Your details" },
] as const;

export function BookingForm({ defaultRegion }: { defaultRegion?: string }) {
  const [values, setValues] = React.useState<Values>(() =>
    defaultRegion && reoByRegion(defaultRegion)
      ? { ...EMPTY, region: defaultRegion }
      : EMPTY,
  );
  const [step, setStep] = React.useState(0);
  const [dir, setDir] = React.useState(1);
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

  function validateStep(): boolean {
    const s = step === 0 ? scheduleSchema : detailsSchema;
    const res = s.safeParse(values);
    if (res.success) {
      // Extra guard: no past dates on the schedule step.
      if (step === 0 && values.date < min) {
        setErrors({ date: "Please choose today or a future date." });
        return false;
      }
      setErrors({});
      return true;
    }
    const next: FieldErrors = {};
    for (const issue of res.error.issues) {
      const key = issue.path[0] as keyof Values;
      if (!next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return false;
  }

  function goNext() {
    if (!validateStep()) return;
    setDir(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setErrors({});
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }
    if (!validateStep()) return;
    setFormError(null);

    const reo = reoByRegion(values.region);
    if (!reo) {
      setStep(0);
      setErrors({ region: "Please choose a valid region / REO." });
      return;
    }

    setSubmitting(true);
    try {
      const created = await data.appointments.create({
        region: reo.region,
        regionName: reo.regionName,
        reoName: reo.reoName,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone || undefined,
        date: values.date,
        time: values.time || undefined,
        subject: values.subject.trim(),
        notes: values.notes || undefined,
      });
      setSuccess({
        id: created.id,
        reoName: reo.reoName,
        regionName: reo.regionName,
        date: values.date,
        time: values.time || undefined,
      });
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

  // ── success ──
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
            <CalendarCheck className="size-7" />
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
              onClick={() => {
                setSuccess(null);
                setValues(EMPTY);
                setStep(0);
              }}
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
    <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      {/* Stepper */}
      <ol className="mb-7 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          return (
            <li
              key={s.id}
              className="flex flex-1 items-center gap-2"
              aria-current={state === "active" ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  state === "done" && "border-brand-600 bg-brand-600 text-white",
                  state === "active" && "border-brand-600 text-brand-600",
                  state === "todo" && "border-border text-muted-foreground",
                )}
              >
                {state === "done" ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  state === "active" ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.title}
              </span>
              {i < STEPS.length - 1 && (
                <span className="mx-1 h-px flex-1 bg-border" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>

      <form onSubmit={onSubmit} noValidate>
        {formError && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          >
            {formError}
          </div>
        )}

        <div>
          <motion.div
            key={STEPS[step].id}
            initial={reduce ? false : { opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
              Step {step + 1} of {STEPS.length}
            </div>

            {step === 0 ? (
              <div className="space-y-5">
                <h3 className="font-heading text-xl font-bold">Schedule</h3>
                <FormField
                  label="Region & REO"
                  htmlFor="appt-region"
                  required
                  error={errors.region}
                  icon={MapPin}
                >
                  <Select value={values.region} onValueChange={(v) => set("region", v)}>
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

                <div className="flex flex-col gap-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <CalendarCheck className="size-3.5 text-muted-foreground" />
                    <span>Preferred date &amp; time</span>
                    <span className="text-flag-red">*</span>
                  </Label>
                  <AppointmentPicker
                    date={values.date}
                    time={values.time ?? ""}
                    onDateChange={(iso) => set("date", iso)}
                    onTimeChange={(slot) => set("time", slot)}
                    min={min}
                    slots={TIME_SLOTS}
                    invalid={!!errors.date}
                  />
                  {errors.date && (
                    <p className="text-xs font-medium text-destructive">{errors.date}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <h3 className="font-heading text-xl font-bold">Your details</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField label="Full name" htmlFor="appt-name" required error={errors.name} icon={User2}>
                    <Input
                      id="appt-name"
                      value={values.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Jane Citizen"
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                    />
                  </FormField>
                  <FormField label="Email" htmlFor="appt-email" required error={errors.email} icon={Mail}>
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
                <FormField label="Phone (optional)" htmlFor="appt-phone" icon={Phone}>
                  <Input
                    id="appt-phone"
                    type="tel"
                    value={values.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+592 …"
                    autoComplete="tel"
                  />
                </FormField>
                <FormField label="Subject" htmlFor="appt-subject" required error={errors.subject}>
                  <Input
                    id="appt-subject"
                    value={values.subject}
                    onChange={(e) => set("subject", e.target.value)}
                    placeholder="What is your appointment about?"
                    aria-invalid={!!errors.subject}
                  />
                </FormField>
                <FormField label="Additional notes (optional)" htmlFor="appt-notes">
                  <Textarea
                    id="appt-notes"
                    value={values.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    rows={4}
                    placeholder="Any background or details that will help the REO's office prepare."
                  />
                </FormField>
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0 || submitting}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-0",
              step === 0 && "invisible",
            )}
          >
            <ChevronLeft className="size-4" /> Back
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Submitting…
              </>
            ) : step < STEPS.length - 1 ? (
              <>
                Continue <ChevronRight className="size-4" />
              </>
            ) : (
              <>
                <Send className="size-4" /> Request appointment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
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
  const errorId = `${htmlFor}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="flex items-center gap-1.5 text-sm">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        <span>{label}</span>
        {required && <span className="text-flag-red">*</span>}
      </Label>
      {error && React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<{ "aria-describedby"?: string }>,
            { "aria-describedby": errorId },
          )
        : children}
      {error && (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
