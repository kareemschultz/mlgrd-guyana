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
  | "handshake"
  | "leaf"
  | "star"
  | "map"
  | "sun"
  | "book"
  | "health"
  | "house";

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
    case "leaf": // environment / green
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 20c0-8 6-14 16-14 0 8-6 14-16 14Z" />
          <path d="M4 20C8 16 12 13 18 11" />
        </svg>
      );
    case "star": // Golden Arrowhead star
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3l2.5 5.6 6.1.6-4.6 4 1.4 6-5.4-3.2L6.6 19l1.4-6-4.6-4 6.1-.6L12 3Z" />
        </svg>
      );
    case "map": // simplified Guyana outline
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M7 3l8 1 1.5 5-2 4-1.5 8-2.5-7-4-3.5L7 3Z" />
        </svg>
      );
    case "sun": // development / sunrise
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
        </svg>
      );
    case "book": // education
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5Z" />
          <path d="M4 18a2 2 0 0 0 2 2h13" />
        </svg>
      );
    case "health": // heart + cross
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.2A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" />
          <path d="M12 8.5v4M10 10.5h4" />
        </svg>
      );
    case "house": // housing
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 11 12 4l9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-6h4v6" />
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
    { kind: "council", className: "left-[4%] top-[16%]", size: 46, dur: 9, drift: 18 },
    { kind: "leaf", className: "left-[14%] top-[40%]", size: 34, dur: 12, delay: 0.6, drift: 16 },
    { kind: "permit", className: "left-[22%] top-[70%]", size: 32, dur: 11, delay: 1, drift: 14 },
    { kind: "community", className: "right-[30%] top-[10%]", size: 40, dur: 10, delay: 0.5, drift: 16 },
    { kind: "water", className: "right-[7%] top-[56%]", size: 38, dur: 12, delay: 1.5, drift: 20 },
    { kind: "pin", className: "left-[44%] top-[80%]", size: 30, dur: 8, delay: 0.8, drift: 14 },
    { kind: "recycle", className: "right-[15%] top-[28%]", size: 34, dur: 13, delay: 0.3, drift: 18 },
    { kind: "star", className: "left-[34%] top-[24%]", size: 24, dur: 7, delay: 0.2, drift: 14 },
    { kind: "sun", className: "right-[40%] top-[68%]", size: 32, dur: 14, delay: 1.2, drift: 16 },
    { kind: "house", className: "left-[8%] top-[74%]", size: 32, dur: 10, delay: 0.9, drift: 16 },
    { kind: "health", className: "right-[22%] top-[78%]", size: 30, dur: 9, delay: 0.4, drift: 14 },
    { kind: "book", className: "right-[4%] top-[16%]", size: 30, dur: 11, delay: 1.3, drift: 16 },
    { kind: "map", className: "left-[60%] top-[8%]", size: 30, dur: 15, delay: 0.7, drift: 14 },
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
          initial={{ y: 0, rotate: -4 }}
          animate={{ y: [0, -(it.drift ?? 12), 0], rotate: [-4, 4, -4] }}
          transition={{
            y: { duration: it.dur, repeat: Infinity, ease: "easeInOut", delay: it.delay ?? 0 },
            rotate: { duration: it.dur * 1.3, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Motif kind={it.kind} />
        </motion.div>
      ))}
    </div>
  );
}
