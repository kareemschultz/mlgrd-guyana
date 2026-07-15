"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Loader2, ImagePlus, X, FileText, FileUp } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Icon-only button with a hover/focus tooltip and an accessible label — for
 * compact row actions (edit, delete, …) so staff aren't guessing what an icon
 * does. The label doubles as the aria-label.
 */
export function IconAction({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={className}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animation presets
// ─────────────────────────────────────────────────────────────────────────────

/** Subtle enter for a whole panel. */
export const panelMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
};

/** Stagger container for lists/grids. */
export const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

/** Each child in a staggered list. */
export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export const MotionDiv = motion.div;

// ─────────────────────────────────────────────────────────────────────────────
// Form field wrapper (label + control + help/error)
// ─────────────────────────────────────────────────────────────────────────────

export function Field({
  label,
  htmlFor,
  className,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Image upload — file → data URL string
// ─────────────────────────────────────────────────────────────────────────────

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({
  value,
  onChange,
  label,
  id,
  shape = "wide",
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
  label: string;
  id: string;
  shape?: "wide" | "square" | "portrait";
}) {
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await readFileAsDataUrl(file);
      onChange(url);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const aspect =
    shape === "square"
      ? "aspect-square"
      : shape === "portrait"
        ? "aspect-[3/4]"
        : "aspect-[16/9]";

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-lg border border-dashed border-input bg-muted/30",
          aspect,
          shape === "portrait" && "max-w-[160px]",
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImagePlus className="size-6" />
            <span className="text-xs">No image</span>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="size-5 animate-spin text-brand-600" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ImagePlus className="size-3.5" />
          {value ? "Replace" : "Upload"}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-3.5" />
            Remove
          </button>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Document upload — file (PDF/Word) → data URL string
// ─────────────────────────────────────────────────────────────────────────────

export function DocumentUpload({
  value,
  valueName,
  onChange,
  label,
  id,
  maxBytes = 5 * 1024 * 1024,
}: {
  value?: string;
  valueName?: string;
  onChange: (dataUrl: string, fileName: string) => void;
  label: string;
  id: string;
  /** Client-side size guard so users get instant feedback (default 5MB). */
  maxBytes?: number;
}) {
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxBytes) {
      toast.error(
        `That file is too large — please use a document under ${Math.round(maxBytes / (1024 * 1024))}MB.`,
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setBusy(true);
    try {
      const url = await readFileAsDataUrl(file);
      onChange(url, file.name);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-input bg-muted/30 p-3">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm">
          {valueName || "No document attached"}
        </span>
        {busy && (
          <Loader2 className="size-4 shrink-0 animate-spin text-brand-600" />
        )}
      </div>
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <FileUp className="size-3.5" />
          {value ? "Replace" : "Upload"}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-3.5" />
            Remove
          </button>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty + loading states
// ─────────────────────────────────────────────────────────────────────────────

export function LoadingState({
  label = "Loading…",
  rows = 5,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-3 py-2" role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border p-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="hidden h-6 w-16 rounded-full sm:block" />
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
        <Icon className="size-6" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm-delete inline button
// ─────────────────────────────────────────────────────────────────────────────

export function formatDate(value?: string): string {
  if (!value) return "—";
  // Accept yyyy-mm-dd or ISO.
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Title → url-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
