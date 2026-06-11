"use client";

/**
 * Floating decorative motifs for the home-page emblem tile — drawn from the
 * ministry emblem (handshake, leaf, house, health heart, family, puzzle) plus
 * the Guyana flag and a simplified national map. They drift, rotate and pulse
 * gently around the crest on the dark tile. Subtle + low-opacity so the emblem
 * stays the focus; fully static under prefers-reduced-motion.
 */
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Handshake,
  Leaf,
  House,
  HeartPulse,
  Users,
  Puzzle,
  Star,
  type LucideIcon,
} from "lucide-react";

/** The Golden Arrowhead — Guyana's national flag. */
function GuyanaFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" className={className} aria-hidden="true">
      <rect width="32" height="20" rx="2.5" fill="#009E49" />
      <path d="M0 1 L31 10 L0 19 Z" fill="#ffffff" />
      <path d="M0 3 L26 10 L0 17 Z" fill="#FCD116" />
      <path d="M0 1 L15 10 L0 19 Z" fill="#111111" />
      <path d="M0 3 L12 10 L0 17 Z" fill="#CE1126" />
    </svg>
  );
}

/** A simplified outline of Guyana (as on the emblem). */
function GuyanaMap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M6.5 2.2 L15.5 3.4 L17 7.2 L15 10.5 L14.4 14 L12 21.6 L10.2 14.5 L6.6 11 L5.2 6.4 Z" />
    </svg>
  );
}

type Motif = {
  key: string;
  Icon?: LucideIcon;
  custom?: (cls: string) => React.ReactNode;
  pos: string; // tailwind position utilities
  size: string;
  color: string;
  dur: number;
  rot: number;
  drift: number;
};

const MOTIFS: Motif[] = [
  { key: "leaf", Icon: Leaf, pos: "left-[7%] top-[13%]", size: "size-7", color: "text-emerald-400/35", dur: 9, rot: 9, drift: 10 },
  { key: "shake", Icon: Handshake, pos: "right-[7%] top-[11%]", size: "size-8", color: "text-gold/40", dur: 11, rot: -7, drift: 12 },
  { key: "star", Icon: Star, pos: "left-[46%] top-[5%]", size: "size-4", color: "text-gold/35", dur: 7, rot: 12, drift: 7 },
  { key: "puzzle", Icon: Puzzle, pos: "left-[12%] top-[44%]", size: "size-5", color: "text-gold/30", dur: 13, rot: -6, drift: 9 },
  { key: "users", Icon: Users, pos: "right-[12%] top-[42%]", size: "size-5", color: "text-white/25", dur: 12, rot: 6, drift: 8 },
  { key: "house", Icon: House, pos: "left-[10%] bottom-[20%]", size: "size-6", color: "text-white/22", dur: 10, rot: 7, drift: 10 },
  { key: "heart", Icon: HeartPulse, pos: "right-[8%] bottom-[24%]", size: "size-6", color: "text-red-400/35", dur: 8, rot: -9, drift: 9 },
  { key: "flag", custom: (cls) => <GuyanaFlag className={cls} />, pos: "left-[40%] bottom-[8%]", size: "w-9", color: "opacity-60", dur: 10, rot: -5, drift: 8 },
  { key: "map", custom: (cls) => <GuyanaMap className={cls} />, pos: "right-[40%] top-[14%]", size: "size-6", color: "text-gold/25", dur: 14, rot: 8, drift: 7 },
];

export function EmblemMotifs() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {MOTIFS.map((m, i) => {
        const cls = `${m.size} ${m.color}`;
        const content = m.custom ? m.custom(cls) : m.Icon ? <m.Icon className={cls} /> : null;
        return (
          <motion.div
            key={m.key}
            className={`absolute ${m.pos}`}
            initial={reduce ? { opacity: 0.5 } : { opacity: 0, scale: 0.8 }}
            animate={
              reduce
                ? { opacity: 0.5 }
                : {
                    opacity: [0.35, 0.8, 0.35],
                    y: [0, -m.drift, 0],
                    rotate: [-m.rot, m.rot, -m.rot],
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: m.dur,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }
            }
          >
            {content}
          </motion.div>
        );
      })}
    </div>
  );
}
