"use client";

/**
 * Command palette (⌘K / Ctrl-K) — quick keyboard navigation across the admin.
 * Type to filter sections and jump straight there. Built on the shadcn command
 * dialog; the trigger button lives in the admin top bar.
 */
import * as React from "react";
import type { LucideIcon } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type CommandTarget<Id extends string> = {
  id: Id;
  label: string;
  icon: LucideIcon;
};

/** Registers the ⌘K / Ctrl-K shortcut; returns open state + setter. */
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}

export function CommandPalette<Id extends string>({
  open,
  onOpenChange,
  items,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandTarget<Id>[];
  onSelect: (id: Id) => void;
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Quick navigation"
      description="Jump to any section"
    >
      <CommandInput placeholder="Jump to a section…" />
      <CommandList>
        <CommandEmpty>No matching section.</CommandEmpty>
        <CommandGroup heading="Sections">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <CommandItem
                key={it.id}
                value={it.label}
                onSelect={() => {
                  onSelect(it.id);
                  onOpenChange(false);
                }}
              >
                <Icon className="size-4 text-muted-foreground" />
                {it.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
