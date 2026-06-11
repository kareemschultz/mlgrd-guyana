"use client";

import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { motion, useReducedMotion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Loader2, PartyPopper, Send } from "lucide-react";
import type { FieldDef, FormConfig } from "@/components/forms/configs";
import { formConfigs } from "@/components/forms/configs";
import { data } from "@/lib/data/client";
import type { NewMessage } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function makeRef() {
  return `MLGRD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/**
 * Map a (config-agnostic) set of form values into a helpdesk/contact message so
 * every public submission — feedback, helpdesk, report-a-problem, vendor enquiry
 * — lands in the admin Messages inbox via the data layer. The message body keeps
 * all the contextual fields (region, urgency, company, etc.) using their labels.
 */
function buildMessage(
  config: FormConfig,
  value: Record<string, string>,
  ref: string,
): NewMessage {
  const labels: Record<string, string> = {};
  for (const s of config.steps) for (const f of s.fields) labels[f.name] = f.label;

  const lead = value.message || value.description || "";
  const omit = new Set(["name", "email", "subject", "message", "description"]);
  const extras = Object.entries(value)
    .filter(([k, v]) => v && !omit.has(k))
    .map(([k, v]) => `${labels[k] ?? k}: ${v}`);

  const body = [lead, extras.join("\n"), config.contextNote, `Reference: ${ref}`]
    .filter(Boolean)
    .join("\n\n");

  return {
    channel: config.id === "helpdesk" ? "helpdesk" : "contact",
    name: value.name || value.company || "Website visitor",
    email: value.email || "",
    subject: value.subject || config.title,
    category: value.topic || value.category || value.interest || config.subject,
    body,
    ...config.fixed,
  };
}

export function MultiStepForm({
  configId,
  config: configProp,
}: {
  configId?: keyof typeof formConfigs;
  config?: FormConfig;
}) {
  const config = configProp ?? formConfigs[configId ?? "helpdesk"];
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | string>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const defaultValues = useMemo(() => {
    const v: Record<string, string> = {};
    for (const s of config.steps) for (const f of s.fields) v[f.name] = "";
    return v;
  }, [config]);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setSubmitting(true);
      const ref = makeRef();
      const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
      try {
        let delivered = false;
        // Always log the submission to the data layer so it appears in the admin
        // helpdesk inbox (localStorage in demo mode, Cloudflare D1 in live mode).
        try {
          await data.messages.create(
            buildMessage(config, value as Record<string, string>, ref),
          );
          delivered = true;
        } catch (error) {
          console.error("MLGRD form data-layer submission failed", error);
        }
        // Optional: also email a copy if a form endpoint (e.g. Formspree) is set.
        if (endpoint) {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ _subject: `${config.subject} (${ref})`, reference: ref, ...value }),
          });
          delivered = delivered || response.ok;
        }
        if (!delivered) {
          throw new Error("We could not send your message. Please try again or contact the Ministry by phone or email.");
        }
        setDone(ref);
      } catch (error) {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "We could not send your message. Please try again.",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const current = config.steps[step];
  const isLast = step === config.steps.length - 1;

  function validateStep(): boolean {
    const values = form.state.values as Record<string, string>;
    const subset: Record<string, string> = {};
    for (const f of current.fields) subset[f.name] = values[f.name];
    const res = current.schema.safeParse(subset);
    if (res.success) {
      setErrors({});
      return true;
    }
    const next: Record<string, string> = {};
    for (const issue of res.error.issues) next[String(issue.path[0])] = issue.message;
    setErrors(next);
    return false;
  }

  function goNext() {
    if (!validateStep()) return;
    setDir(1);
    setStep((s) => Math.min(s + 1, config.steps.length - 1));
  }
  function goBack() {
    setErrors({});
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  // ── success ──
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-12"
      >
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand/10 text-brand-600">
          <PartyPopper className="size-8" />
        </div>
        <h2 className="mt-5 font-heading text-2xl font-bold">{config.successTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">{config.successText}</p>
        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg border bg-secondary px-4 py-2 text-sm">
          <span className="text-muted-foreground">Reference</span>
          <span className="font-mono font-semibold">{done}</span>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Your message has been logged to the Ministry helpdesk
          {process.env.NEXT_PUBLIC_FORM_ENDPOINT
            ? " and emailed to the team."
            : "."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      {/* Stepper */}
      <ol className="mb-7 flex items-center gap-2">
        {config.steps.map((s, i) => {
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
                  state === "todo" && "border-border text-muted-foreground"
                )}
              >
                {state === "done" ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  state === "active" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.title}
              </span>
              {i < config.steps.length - 1 && (
                <span className="mx-1 h-px flex-1 bg-border" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) {
            if (validateStep()) form.handleSubmit();
          } else {
            goNext();
          }
        }}
      >
        {errors.form && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          >
            {errors.form}
          </div>
        )}
        <div>
          <motion.div
            key={current.id}
            initial={reduce ? false : { opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
              Step {step + 1} of {config.steps.length}
            </div>
            <h3 className="font-heading text-xl font-bold">{current.title}</h3>
            {current.description && (
              <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {current.fields.map((f) => (
                <form.Field key={f.name} name={f.name}>
                  {(field) => (
                    <FieldControl
                      def={f}
                      value={field.state.value as string}
                      onChange={(v) => field.handleChange(v)}
                      onBlur={field.handleBlur}
                      error={errors[f.name]}
                    />
                  )}
                </form.Field>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={step === 0 || submitting}
            className={cn(step === 0 && "invisible")}
          >
            <ChevronLeft className="size-4" /> Back
          </Button>

          {isLast ? (
            <Button type="submit" disabled={submitting} className="bg-brand-600 hover:bg-brand-700">
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Send className="size-4" /> {config.submitLabel}
                </>
              )}
            </Button>
          ) : (
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700">
              Continue <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function FieldControl({
  def,
  value,
  onChange,
  onBlur,
  error,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
}) {
  const id = `f-${def.name}`;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : def.help ? helpId : undefined;
  const span = def.colSpan === 2 ? "sm:col-span-2" : "";
  return (
    <div className={cn("flex flex-col gap-1.5", span)}>
      <Label htmlFor={id} className="text-sm">
        {def.label}
      </Label>

      {def.type === "textarea" ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={def.placeholder}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
      ) : def.type === "select" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} aria-invalid={!!error} aria-describedby={describedBy} className="w-full">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {def.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={def.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={def.placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
      )}

      {def.help && !error && <p id={helpId} className="text-xs text-muted-foreground">{def.help}</p>}
      {error && <p id={errorId} className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
