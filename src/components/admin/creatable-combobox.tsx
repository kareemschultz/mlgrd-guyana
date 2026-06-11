"use client";

/**
 * Creatable combobox — pick an existing option OR type a new one and create it
 * on the fly. Built on the shadcn Command + Popover primitives. Used for fields
 * like a post/gallery Category where staff need the safety of a list but also
 * the freedom to add a new value (which then appears as an option going
 * forward). Strict-ish: no accidental typos from the list, explicit "Create".
 */
import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function CreatableCombobox({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Select or add…",
  noun = "option",
}: {
  id?: string;
  value: string;
  onValueChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  /** Singular noun for the create label, e.g. "category". */
  noun?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const q = query.trim();
  const exactExists = options.some((o) => o.toLowerCase() === q.toLowerCase());

  const choose = (v: string) => {
    onValueChange(v.trim());
    setQuery("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[14rem] p-0"
      >
        <Command>
          <CommandInput
            placeholder={`Search or add a ${noun}…`}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {q ? (
                <button
                  type="button"
                  onClick={() => choose(q)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Plus className="size-4 text-brand-600" /> Create “{q}”
                </button>
              ) : (
                `No ${noun} found.`
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o} value={o} onSelect={() => choose(o)}>
                  <Check
                    className={cn(
                      "size-4",
                      value === o ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {o}
                </CommandItem>
              ))}
              {q && !exactExists && (
                <CommandItem value={`__create__${q}`} onSelect={() => choose(q)}>
                  <Plus className="size-4 text-brand-600" /> Create “{q}”
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
