"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  X,
  Calendar,
  Landmark,
  Users,
  CalendarDays,
  HandHelping,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { data } from "@/lib/data/client";
import { seedGallery } from "@/lib/data/seed";
import type { GalleryItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/**
 * Animated ministry photo gallery for the Minister's Desk.
 *
 * Initial state is `seedGallery` so the static export renders real content
 * immediately; a useEffect overlays any live updates. Items without an `image`
 * render a tasteful branded placeholder tile (gradient + category icon) rather
 * than a broken image. Tiles stagger into view and zoom on hover; clicking
 * opens an animated lightbox with the caption. Category chips filter the grid.
 * Reduced-motion is honoured globally and locally.
 */

const ALL = "All";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Capacity-building": Landmark,
  Community: HandHelping,
  Events: CalendarDays,
  Minister: Users,
};

function iconFor(category?: string): LucideIcon {
  if (category && CATEGORY_ICON[category]) return CATEGORY_ICON[category];
  return ImageIcon;
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const tileVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function PhotoGallery() {
  const [items, setItems] = useState<GalleryItem[]>(seedGallery);
  const [filter, setFilter] = useState<string>(ALL);
  const [active, setActive] = useState<GalleryItem | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let alive = true;
    data.gallery
      .list()
      .then((live) => {
        if (alive && Array.isArray(live) && live.length) setItems(live);
      })
      .catch(() => {
        /* keep seed fallback */
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) if (it.category) set.add(it.category);
    return Array.from(set);
  }, [items]);

  const visible = useMemo(
    () =>
      filter === ALL ? items : items.filter((it) => it.category === filter),
    [items, filter],
  );

  return (
    <>
      {/* ───── Category filter chips ───── */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {[ALL, ...categories].map((c) => {
            const selected = filter === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                aria-pressed={selected}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2",
                  selected
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground",
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {/* ───── Masonry grid ───── */}
      <motion.div
        layout
        className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1, margin: "0px 0px -6% 0px" }}
      >
        <AnimatePresence mode="popLayout">
          {visible.map((it) => {
            const Icon = iconFor(it.category);
            return (
              <motion.button
                key={it.id}
                layout
                type="button"
                variants={tileVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.96 }}
                whileHover={reduce ? undefined : { y: -4 }}
                onClick={() => setActive(it)}
                className="group block w-full break-inside-avoid overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-shadow duration-300 hover:border-brand/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {it.image ? (
                    <img
                      src={it.image}
                      alt={it.caption || it.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 text-white transition-transform duration-500 group-hover:scale-105">
                      <div className="pointer-events-none absolute inset-0 bg-dot text-white/10" />
                      <Icon className="size-10 text-white/90" />
                      <span className="mt-3 max-w-[80%] text-center text-xs font-semibold uppercase tracking-wide text-white/80">
                        {it.category || it.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-sm font-bold leading-snug">
                    {it.title}
                  </h3>
                  {it.date && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Calendar className="size-3.5" />
                      {it.date}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>

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
            aria-label={active.title}
          >
            <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" />
            <motion.div
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-2xl"
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
                {active.image ? (
                  <img
                    src={active.image}
                    alt={active.caption || active.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (() => {
                    const Icon = iconFor(active.category);
                    return <Icon className="size-16 text-white/90" />;
                  })()
                )}
              </div>

              <div className="p-6">
                {active.category && (
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                    {active.category}
                  </p>
                )}
                <h3 className="mt-1 font-heading text-xl font-extrabold">
                  {active.title}
                </h3>
                {active.caption && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {active.caption}
                  </p>
                )}
                {active.date && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {active.date}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
