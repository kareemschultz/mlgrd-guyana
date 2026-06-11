"use client";

/**
 * Brand-themed appointment date + time picker — calendar on the left, a
 * scrollable column of office-hours slots on the right, and a live confirmation
 * line. Adapted from the shadcn studio "Appointment calendar" block
 * (calendar-24) to our government-corporate look and bound to plain strings so
 * it drops into the booking wizard's form state.
 */
import * as React from "react";
import { format } from "date-fns";
import { CalendarClock, CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";

/** Convert a Date to a local `yyyy-mm-dd` string. */
function toISO(d: Date): string {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

export function AppointmentPicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  min,
  slots,
  invalid,
}: {
  date: string;
  time: string;
  onDateChange: (iso: string) => void;
  onTimeChange: (slot: string) => void;
  /** Earliest selectable date (ISO); earlier days are disabled. */
  min?: string;
  slots: readonly string[];
  invalid?: boolean;
}) {
  const selected = date ? new Date(`${date}T00:00:00`) : undefined;
  const minDate = min ? new Date(`${min}T00:00:00`) : undefined;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-sm",
        invalid && "border-destructive/50",
      )}
    >
      <div className="relative md:pr-52">
        {/* Calendar */}
        <div className="p-4 sm:p-6 max-sm:flex max-sm:justify-center">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? minDate}
            onSelect={(d) => {
              if (d) onDateChange(toISO(d));
            }}
            disabled={minDate ? { before: minDate } : undefined}
            showOutsideDays={false}
            className="bg-transparent p-0 [--cell-size:--spacing(10)]"
          />
        </div>

        {/* Time slots */}
        <div className="inset-y-0 right-0 flex w-full flex-col border-t md:absolute md:w-52 md:border-l md:border-t-0">
          <div className="border-b bg-muted/30 px-4 py-2.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CalendarClock className="size-3.5" />
              Time slot
            </p>
          </div>
          <ScrollArea className="h-44 md:h-full">
            <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-1">
              {slots.map((slot) => {
                const active = time === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onTimeChange(slot)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                        : "bg-card hover:border-brand/40 hover:bg-brand/5",
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Confirmation line */}
      <div className="flex items-center gap-2 border-t px-4 py-3 text-sm sm:px-6">
        {selected && time ? (
          <>
            <CircleCheck className="size-5 shrink-0 text-emerald-600" />
            <span>
              Requesting{" "}
              <span className="font-semibold">
                {format(selected, "EEEE, d MMMM")}
              </span>{" "}
              at <span className="font-semibold">{time}</span>.
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">
            Select a preferred date and time slot.
          </span>
        )}
      </div>
    </div>
  );
}
