"use client";

/**
 * Unified "Get in touch" hub. One entry point for every public form so the site
 * never feels fragmented: the citizen picks an intent and follows a real route
 * to the matching wizard or service page.
 *
 * - message      → general / feedback / council / service enquiry  (→ messages)
 * - appointment  → REO appointment booking  (→ appointments)
 * - report       → report a local problem  (→ messages)
 * - vendor       → vendor & supplier enquiry  (→ messages)
 *
 * Deep-linkable: `/contact?intent=appointment&reo=Region%204` opens the booking
 * wizard pre-scoped to a region. Reads the query on mount (no Suspense needed
 * for static export).
 */
import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  Briefcase,
  CalendarClock,
  ChevronRight,
  Loader2,
  MessageSquareText,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { MultiStepForm } from "@/components/forms/multi-step-form";

// The booking flow pulls in react-day-picker + date-fns; load it only when the
// citizen actually opens the appointment intent so it stays out of the initial
// /contact payload.
const BookingForm = dynamic(
  () => import("@/components/appointments/booking-form").then((m) => m.BookingForm),
  {
    loading: () => (
      <div className="flex items-center justify-center gap-2 rounded-2xl border bg-card p-12 text-sm text-muted-foreground shadow-sm">
        <Loader2 className="size-4 animate-spin" /> Loading booking…
      </div>
    ),
  },
);

type IntentId = "message" | "appointment" | "report" | "vendor";

const INTENTS: {
  id: IntentId;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  href: string;
}[] = [
  {
    id: "message",
    title: "Send a message",
    description: "General enquiries, feedback, a council or a service.",
    icon: MessageSquareText,
    accent: "bg-brand/10 text-brand-600",
    href: "/helpdesk",
  },
  {
    id: "appointment",
    title: "Book an REO appointment",
    description: "Request a meeting with your Regional Executive Officer.",
    icon: CalendarClock,
    accent: "bg-gold/15 text-gold",
    href: "/appointments",
  },
  {
    id: "report",
    title: "Report a local problem",
    description: "Roads, drainage, sanitation and other community issues.",
    icon: TriangleAlert,
    accent: "bg-flag-red/10 text-flag-red",
    href: "/services/reporting-local-problems",
  },
  {
    id: "vendor",
    title: "Vendor & supplier enquiry",
    description: "Procurement, supplier registration and payment queries.",
    icon: Briefcase,
    accent: "bg-ink/10 text-ink",
    href: "/services/vendor-and-supplier-enquiries",
  },
];

export function ContactHub() {
  const [intent, setIntent] = React.useState<IntentId | null>(null);
  const [reo, setReo] = React.useState<string | undefined>(undefined);
  const reduce = useReducedMotion();

  // Honour deep links on mount (?intent=…&reo=Region 4). This is an intentional
  // one-time read of the URL after hydration — the page is prerendered showing
  // the picker, so a lazy initializer would cause a hydration mismatch.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const i = params.get("intent");
    const r = params.get("reo");
    if (i === "message" || i === "appointment" || i === "report" || i === "vendor") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIntent(i);
    }
    if (r) setReo(r);
  }, []);

  const active = intent ? INTENTS.find((x) => x.id === intent) : null;

  return (
    <div className="container-gov py-14 sm:py-16">
      <div className="mx-auto max-w-3xl">
        {!active ? (
          <motion.div
            key="picker"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <h2 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
                How can we help?
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                Choose what you&rsquo;d like to do. Every request is logged and
                routed to the right team at the Ministry.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {INTENTS.map((it) => (
                <Link
                  key={it.id}
                  href={it.href}
                  className="group flex items-start gap-4 rounded-2xl border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  <span
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-xl",
                      it.accent,
                    )}
                  >
                    <it.icon className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-heading text-base font-bold">
                        {it.title}
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {it.description}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={active.id}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              onClick={() => setIntent(null)}
              className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-700"
            >
              <ArrowLeft className="size-4" /> All options
            </button>

            <div className="mb-6 flex items-center gap-3">
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl",
                  active.accent,
                )}
              >
                <active.icon className="size-5" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-bold tracking-tight">
                  {active.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {active.description}
                </p>
              </div>
            </div>

            {active.id === "message" && <MultiStepForm configId="helpdesk" />}
            {active.id === "appointment" && <BookingForm defaultRegion={reo} />}
            {active.id === "report" && (
              <MultiStepForm configId="report-problem" />
            )}
            {active.id === "vendor" && (
              <MultiStepForm configId="vendor-enquiry" />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
