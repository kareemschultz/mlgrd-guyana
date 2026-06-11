"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Convert a Date to a local `yyyy-mm-dd` string. */
function toISO(d: Date): string {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

/**
 * A calendar date-picker (popover + shadcn calendar) bound to a `yyyy-mm-dd`
 * string — a drop-in upgrade from a native `<input type="date">`. `min` (ISO)
 * disables earlier dates.
 */
export function DatePicker({
  value,
  onChange,
  min,
  id,
  invalid,
  placeholder = "Choose a date",
}: {
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  id?: string;
  invalid?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;
  const minDate = min ? new Date(`${min}T00:00:00`) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={invalid}
          className={cn(
            "w-full justify-start gap-2 font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          {selected ? format(selected, "EEE, d MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? minDate}
          onSelect={(d) => {
            if (d) onChange(toISO(d));
            setOpen(false);
          }}
          disabled={minDate ? { before: minDate } : undefined}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
