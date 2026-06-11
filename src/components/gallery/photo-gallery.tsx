"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  X,
  Calendar,
  Landmark,
  Users,
  CalendarDays,
  HandHelping,
  Maximize2,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { data } from "@/lib/data/client";
import { seedGallery } from "@/lib/data/seed";
import type { GalleryItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/ui/blur-fade";

/**
 * Animated ministry photo gallery — a hybrid of the StyleOS gallery motion
 * pattern (motion/react):
 *   1. Two infinite marquee rows scrolling in opposite directions (showcase).
 *   2. A spring `layoutId` indicator on the category filter pills.
 *   3. BlurFade scroll-reveal on the browsable masonry grid below.
 *   4. whileHover lift on every photo card.
 * Clicking any photo opens an animated lightbox. Reduced motion is honoured
 * (marquee is hidden, reveals collapse to a fade).
 */

const ALL = "All";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Capacity-building": Landmark,
  Community: HandHelping,
  Events: CalendarDays,
  Leadership: Users,
  Engagements: Users,
  Regional: Landmark,
  Minister: Users,
};

function iconFor(category?: string): LucideIcon {
  if (category && CATEGORY_ICON[category]) return CATEGORY_ICON[category];
  return ImageIcon;
}

function CategoryIcon({ category, className }: { category?: string; className?: string }) {
  switch (category) {
    case "Capacity-building":
    case "Regional":
      return <Landmark className={className} />;
    case "Community":
      return <HandHelping className={className} />;
    case "Events":
      return <CalendarDays className={className} />;
    case "Leadership":
    case "Engagements":
    case "Minister":
      return <Users className={className} />;
    default:
      return <ImageIcon className={className} />;
  }
}

/** A fixed-size card used inside the moving marquee rows. */
function MarqueeCard({
  item,
  onPick,
  reduce,
}: {
  item: GalleryItem;
  onPick: (it: GalleryItem) => void;
  reduce: boolean | null;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onPick(item)}
      whileHover={reduce ? undefined : { scale: 1.03, y: -4 }}
      transition={{ duration: 0.18 }}
      className="group relative h-40 w-60 shrink-0 overflow-hidden rounded-2xl bg-ink text-left shadow-md ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:h-44 sm:w-72"
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.caption || item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 text-white">
          <CategoryIcon category={item.category} className="size-9 text-white/90" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        {item.category && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
            {item.category}
          </span>
        )}
        <h3 className="font-heading text-sm font-bold leading-snug text-white">
          {item.title}
        </h3>
      </div>
    </motion.button>
  );
}

/** One infinite-scrolling row (duplicated content for a seamless loop). */
function MarqueeRow({
  items,
  direction,
  duration,
  onPick,
  reduce,
}: {
  items: GalleryItem[];
  direction: "left" | "right";
  duration: number;
  onPick: (it: GalleryItem) => void;
  reduce: boolean | null;
}) {
  const loop = [...items, ...items];
  return (
    <div className="flex overflow-hidden">
      <motion.div
        className="flex w-max shrink-0 gap-4 pr-4"
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ ease: "linear", repeat: Infinity, duration }}
      >
        {loop.map((it, i) => (
          <MarqueeCard key={`${it.id}-${i}`} item={it} onPick={onPick} reduce={reduce} />
        ))}
      </motion.div>
    </div>
  );
}

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
      {/* ── 1. Moving marquee rows (opposite directions) ── */}
      {!reduce && items.length > 1 && (
        <div className="relative mb-12 space-y-4">
          <MarqueeRow items={items} direction="left" duration={34} onPick={setActive} reduce={reduce} />
          <MarqueeRow items={[...items].reverse()} direction="right" duration={40} onPick={setActive} reduce={reduce} />
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent sm:w-24" />
        </div>
      )}

      {/* ── 2. Category filter pills with spring layoutId indicator ── */}
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
                  "relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2",
                  selected
                    ? "border-brand-600 text-white"
                    : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="gallery-tab"
                    className="absolute inset-0 -z-0 rounded-full bg-brand-600"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <span className="relative z-10">{c}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── 3 + 4. BlurFade masonry grid with hover-lift cards ── */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {visible.map((it, i) => {
          const Icon = iconFor(it.category);
          return (
            <BlurFade
              key={it.id}
              inView
              delay={(i % 9) * 0.06}
              className="break-inside-avoid"
            >
              <motion.button
                type="button"
                onClick={() => setActive(it)}
                whileHover={reduce ? undefined : { scale: 1.03, y: -4 }}
                transition={{ duration: 0.18 }}
                className="group relative block w-full overflow-hidden rounded-2xl bg-ink text-left shadow-md ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.caption || it.title}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 text-white">
                    <div className="pointer-events-none absolute inset-0 bg-dot text-white/10" />
                    <Icon className="size-10 text-white/90" />
                  </div>
                )}

                {/* fade gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/35 to-transparent" />

                {/* zoom affordance */}
                <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <Maximize2 className="size-4" />
                </span>

                {/* caption */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  {it.category && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                      {it.category}
                    </span>
                  )}
                  <h3 className="mt-0.5 font-heading text-sm font-bold leading-snug text-white">
                    {it.title}
                  </h3>
                  {it.date && (
                    <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-white/65">
                      <Calendar className="size-3" />
                      {it.date}
                    </span>
                  )}
                </div>

                {/* gold base accent on hover */}
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand via-gold to-brand transition-transform duration-300 group-hover:scale-x-100" />
              </motion.button>
            </BlurFade>
          );
        })}
      </div>

      {/* ── Lightbox ── */}
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
