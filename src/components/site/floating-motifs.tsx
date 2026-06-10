"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Custom ministry-themed SVG motifs that drift slowly in section backgrounds.
 * Decorative only (aria-hidden, pointer-events-none). Reduced-motion is honoured
 * globally via MotionConfig, which freezes the drift.
 */

type MotifKind =
  | "council"
  | "permit"
  | "community"
  | "recycle"
  | "water"
  | "law"
  | "pin"
  | "handshake";

const Motif = ({ kind }: { kind: MotifKind }) => {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "council": // town hall / council building
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 21h18M4 21V10m16 11V10M12 3 4 8h16l-8-5Z" />
          <path d="M8 21v-7m4 7v-7m4 7v-7" />
        </svg>
      );
    case "permit": // document with check
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
          <path d="M14 3v6h6M9 14l2 2 4-4" />
        </svg>
      );
    case "community": // people
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 21v-1a5 5 0 0 1 8-4M16 11a3 3 0 1 0-2-5.2M14 21v-1a5 5 0 0 1 7-4.5" />
        </svg>
      );
    case "recycle":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M7 19H4.8a2 2 0 0 1-1.7-3l1.2-2M9.5 4.5l1.2-2a2 2 0 0 1 3.4 0L15 4M20.7 14l1.2 2a2 2 0 0 1-1.7 3H17" />
          <path d="m7 19 1.5-2.6M17 19l-2.5-1.5M12 5 9.5 9h5L12 5Z" />
        </svg>
      );
    case "water": // drainage / water drop
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
          <path d="M9 14a3 3 0 0 0 3 3" />
        </svg>
      );
    case "law": // scales of justice
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3v18M7 21h10M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0L5 7Zm14 0-2.5 6a3 3 0 0 0 5 0L19 7Z" />
        </svg>
      );
    case "pin": // map pin
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "handshake":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="m11 17 2 2a1 1 0 0 0 3-3M9 15l3 3M3 12l4-4 4 1 3-2 4 3v4l-3 3" />
          <path d="M3 12v3l3 3" />
        </svg>
      );
  }
};

type Item = {
  kind: MotifKind;
  className: string; // positioning
  size: number;
  dur: number;
  delay?: number;
  drift?: number;
};

const PRESETS: Record<string, Item[]> = {
  hero: [
    { kind: "council", className: "left-[4%] top-[18%]", size: 46, dur: 9, drift: 14 },
    { kind: "permit", className: "left-[20%] top-[64%]", size: 34, dur: 11, delay: 1, drift: 10 },
    { kind: "community", className: "right-[30%] top-[12%]", size: 40, dur: 10, delay: 0.5, drift: 12 },
    { kind: "water", className: "right-[8%] top-[58%]", size: 38, dur: 12, delay: 1.5, drift: 16 },
    { kind: "pin", className: "left-[46%] top-[78%]", size: 30, dur: 8, delay: 0.8, drift: 10 },
    { kind: "recycle", className: "right-[16%] top-[30%]", size: 34, dur: 13, delay: 0.3, drift: 14 },
  ],
  band: [
    { kind: "law", className: "left-[6%] top-[20%]", size: 40, dur: 11, drift: 12 },
    { kind: "handshake", className: "right-[8%] top-[40%]", size: 42, dur: 10, delay: 0.7, drift: 14 },
    { kind: "permit", className: "left-[40%] top-[60%]", size: 30, dur: 12, delay: 1.1, drift: 10 },
  ],
};

export function FloatingMotifs({
  preset = "hero",
  className,
}: {
  preset?: keyof typeof PRESETS;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {PRESETS[preset].map((it, i) => (
        <motion.div
          key={i}
          className={cn("absolute", it.className)}
          style={{ width: it.size, height: it.size }}
          initial={{ y: 0, rotate: -4, opacity: 0.0 }}
          animate={{ y: [0, -(it.drift ?? 12), 0], rotate: [-4, 4, -4], opacity: 1 }}
          transition={{
            y: { duration: it.dur, repeat: Infinity, ease: "easeInOut", delay: it.delay ?? 0 },
            rotate: { duration: it.dur * 1.3, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 1.2, delay: it.delay ?? 0 },
          }}
        >
          <Motif kind={it.kind} />
        </motion.div>
      ))}
    </div>
  );
}
