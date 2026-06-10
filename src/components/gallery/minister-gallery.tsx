"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { X, ExternalLink } from "lucide-react";
import { data } from "@/lib/data/client";
import { seedMinisters } from "@/lib/data/seed";
import type { Minister } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Animated leadership gallery for the Minister's Desk.
 *
 * Renders instantly from `seedMinisters` (so static export ships real content),
 * then overlays any live updates from the data layer in a useEffect. Each card
 * staggers into view; hover lifts the card; clicking opens an animated lightbox
 * with the official's bio. Reduced-motion is honoured both globally (via
 * MotionConfig) and locally (transforms/lightbox motion are skipped).
 */

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function fmtTerm(m: Minister): string | null {
  if (m.current) {
    return m.termStart ? `In office since ${m.termStart}` : "In office";
  }
  if (m.termStart || m.termEnd) {
    return `${m.termStart || "—"} – ${m.termEnd || "—"}`;
  }
  return null;
}

export function MinisterGallery() {
  const [ministers, setMinisters] = useState<Minister[]>(seedMinisters);
  const [active, setActive] = useState<Minister | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let alive = true;
    data.ministers
      .list()
      .then((live) => {
        if (alive && Array.isArray(live) && live.length) setMinisters(live);
      })
      .catch(() => {
        /* keep seed fallback */
      });
    return () => {
      alive = false;
    };
  }, []);

  // Lock body scroll while the lightbox is open.
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  return (
    <>
      <motion.ul
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15, margin: "0px 0px -6% 0px" }}
      >
        {ministers.map((m) => {
          const term = fmtTerm(m);
          return (
            <motion.li key={m.id} variants={cardVariants}>
              <motion.button
                type="button"
                onClick={() => setActive(m)}
                whileHover={reduce ? undefined : { y: -6 }}
                whileTap={reduce ? undefined : { scale: 0.99 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-shadow duration-300 hover:border-brand/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                {/* Portrait or branded initials tile */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-brand-600 to-brand-700">
                  <div className="pointer-events-none absolute inset-0 bg-dot text-white/10" />
                  {m.portrait ? (
                    <img
                      src={m.portrait}
                      alt={`Portrait of ${m.name}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-heading text-5xl font-extrabold tracking-wide text-white/95">
                        {m.initials || m.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <Badge
                      className={cn(
                        "backdrop-blur",
                        m.current
                          ? "bg-gold text-ink"
                          : "bg-black/40 text-white",
                      )}
                    >
                      {m.current ? "Current" : "Past"}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-lg font-bold leading-snug">
                    {m.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{m.title}</p>
                  {term && (
                    <p className="mt-3 text-xs font-medium text-brand-600">
                      {term}
                    </p>
                  )}
                </div>
              </motion.button>
            </motion.li>
          );
        })}
      </motion.ul>

      {/* ───── Lightbox ───── */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`About ${active.name}`}
          >
            <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" />
            <motion.div
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-2xl"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="size-5" />
              </button>

              <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600 to-brand-700">
                <div className="pointer-events-none absolute inset-0 bg-dot text-white/10" />
                {active.portrait ? (
                  <img
                    src={active.portrait}
                    alt={`Portrait of ${active.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-heading text-6xl font-extrabold tracking-wide text-white/95">
                    {active.initials || active.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={active.current ? "bg-gold/20 text-brand-700" : ""}
                  >
                    {active.current ? "Current" : "Past"}
                  </Badge>
                  {fmtTerm(active) && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {fmtTerm(active)}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-heading text-2xl font-extrabold">
                  {active.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-brand-600">
                  {active.title}
                </p>
                {active.bio && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {active.bio}
                  </p>
                )}
                {active.profileUrl && (
                  <a
                    href={active.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  >
                    View profile
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
