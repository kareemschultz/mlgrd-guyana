"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  Recycle,
  Landmark,
  Megaphone,
  HandHelping,
  Newspaper,
  Calendar,
  ArrowRight,
  ExternalLink,
  X,
  type LucideIcon,
} from "lucide-react";
import { data } from "@/lib/data/client";
import { seedPosts } from "@/lib/data/seed";
import type { Post } from "@/lib/data/types";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Live news feed + full-article reader for the News page.
 *
 * Initial state is the published seed posts so the static export renders real
 * content instantly; a useEffect overlays any live/published updates from the
 * data layer. News is presented chronologically (newest first) and can be
 * filtered by year via a row of "chips" derived from the posts' dates — News is
 * what the Ministry updates daily, so jumping to a year's developments is the
 * primary navigation. Cards show a cover image, an excerpt with a "Read more"
 * affordance, and a "View source" link to the original DPI/Facebook post when
 * present; clicking "Read more" opens a structured article modal (meta +
 * paragraph-split write-up + source). Works for both seed and admin-created
 * posts without needing per-slug static pages.
 */

const CATEGORY_ICON: Record<string, LucideIcon> = {
  Legislation: Recycle,
  "Capacity-building": Landmark,
  "Digital services": Megaphone,
  "Community development": HandHelping,
};

function iconFor(category: string): LucideIcon {
  return CATEGORY_ICON[category] ?? Newspaper;
}

/** Format an ISO `yyyy-mm-dd` date as e.g. "March 2026". */
function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** Extract the 4-digit year from an ISO `yyyy-mm-dd` date. */
function yearOf(iso: string): string {
  return iso.slice(0, 4);
}

/** A pluralised "N update(s)" label. */
function countLabel(n: number): string {
  return `${n} update${n === 1 ? "" : "s"}`;
}

/** Split a plain-text body into paragraphs on blank lines. */
function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const onlyPublished = (posts: Post[]) =>
  posts.filter((p) => p.status === "published");

/** Sentinel for the "All years" chip. */
const ALL = "all" as const;

export function NewsFeed() {
  const [posts, setPosts] = useState<Post[]>(() => onlyPublished(seedPosts));
  const [active, setActive] = useState<Post | null>(null);
  const [year, setYear] = useState<string>(ALL);
  const reduce = useReducedMotion();

  useEffect(() => {
    let alive = true;
    data.posts
      .list()
      .then((live) => {
        if (alive && Array.isArray(live)) setPosts(onlyPublished(live));
      })
      .catch(() => {
        /* keep seed fallback */
      });
    return () => {
      alive = false;
    };
  }, []);

  // Lock body scroll while the article reader is open.
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  // All published posts, newest first.
  const sorted = useMemo(
    () => [...posts].sort((a, b) => b.date.localeCompare(a.date)),
    [posts],
  );

  // Distinct years present, newest first, for the filter chips.
  const years = useMemo(() => {
    const set = new Set(sorted.map((p) => yearOf(p.date)));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [sorted]);

  // If the selected year disappears (e.g. live data differs), fall back to All.
  useEffect(() => {
    if (year !== ALL && !years.includes(year)) setYear(ALL);
  }, [year, years]);

  // Posts after applying the active year filter (still newest first).
  const visible = useMemo(
    () => (year === ALL ? sorted : sorted.filter((p) => yearOf(p.date) === year)),
    [sorted, year],
  );

  const countText =
    year === ALL
      ? `${countLabel(visible.length)} across all years`
      : `${countLabel(visible.length)} in ${year}`;

  return (
    <>
      {/* ───── Year filter ───── */}
      <Reveal className="mt-8">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter news by year"
        >
          <YearChip
            label="All"
            active={year === ALL}
            onClick={() => setYear(ALL)}
          />
          {years.map((y) => (
            <YearChip
              key={y}
              label={y}
              active={year === y}
              onClick={() => setYear(y)}
            />
          ))}
        </div>
        <p
          className="mt-3 text-sm font-medium text-muted-foreground"
          aria-live="polite"
        >
          {countText}
        </p>
      </Reveal>

      {/*
        Filtering: re-mount the grid on every year change by keying it on `year`.
        React fully swaps the subtree, so each card runs its entrance animation
        afresh for a clean filter transition — no AnimatePresence exit churn,
        which previously wedged on the large seed→live data overlay. Stagger gives
        a brief cascade; reduced-motion collapses it to a plain fade.
      */}
      <div key={year} className="mt-8 grid gap-6 md:grid-cols-2">
        {visible.map((item, i) => {
          const Icon = iconFor(item.category);
          return (
            <motion.article
              key={item.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.35,
                delay: reduce ? 0 : Math.min(i, 8) * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-7 transition-colors duration-300 hover:border-brand/40 hover:shadow-lg"
            >
              {item.coverImage && (
                <div className="-mx-7 -mt-7 mb-5 aspect-[16/9] overflow-hidden border-b">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.coverImage}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="size-6" />
                </div>
                <Badge variant="secondary">{item.category}</Badge>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calendar className="size-3.5" />
                {fmtDate(item.date)}
              </div>
              <h3 className="mt-2 font-heading text-xl font-bold leading-snug">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {item.excerpt || paragraphs(item.body)[0]}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                <button
                  type="button"
                  onClick={() => setActive(item)}
                  className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  aria-label={`Read more: ${item.title}`}
                >
                  Read more
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </button>
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                    aria-label={`View source for: ${item.title} (opens in a new tab)`}
                  >
                    <ExternalLink className="size-3.5" />
                    View source
                  </a>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* ───── Full-article reader ───── */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
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
            <motion.article
              className="relative z-10 max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border bg-card shadow-2xl sm:rounded-2xl"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close article"
                className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-ink/30 text-white backdrop-blur transition-colors hover:bg-ink/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="size-5" />
              </button>

              {active.coverImage ? (
                <div className="aspect-[2/1] w-full overflow-hidden border-b">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={active.coverImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-2 w-full bg-gradient-to-r from-brand via-gold to-brand" />
              )}

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">{active.category}</Badge>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {fmtDate(active.date)}
                  </span>
                </div>
                <h2 className="mt-4 font-heading text-2xl font-extrabold leading-tight sm:text-3xl">
                  {active.title}
                </h2>
                <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                  {paragraphs(active.body).map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
                {active.sourceUrl && (
                  <a
                    href={active.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:border-brand/50 hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  >
                    <ExternalLink className="size-4" />
                    Read on the official source
                  </a>
                )}
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** A single year filter "chip" (toggle button). */
function YearChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2",
        active
          ? "border-brand-600 bg-brand-600 text-white shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-brand-700",
      )}
    >
      {label}
    </button>
  );
}
