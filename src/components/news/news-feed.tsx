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
  X,
  type LucideIcon,
} from "lucide-react";
import { data } from "@/lib/data/client";
import { seedPosts } from "@/lib/data/seed";
import type { Post } from "@/lib/data/types";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";

/**
 * Live news feed + full-article reader for the News page.
 *
 * Initial state is the published seed posts so the static export renders real
 * content instantly; a useEffect overlays any live/published updates from the
 * data layer. Cards show an excerpt with a "Read more" affordance; clicking opens
 * a structured article modal (meta + paragraph-split write-up). Works for both
 * seed and admin-created posts without needing per-slug static pages.
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

/** Split a plain-text body into paragraphs on blank lines. */
function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const onlyPublished = (posts: Post[]) =>
  posts.filter((p) => p.status === "published");

export function NewsFeed() {
  const [posts, setPosts] = useState<Post[]>(() => onlyPublished(seedPosts));
  const [active, setActive] = useState<Post | null>(null);
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

  const sorted = useMemo(
    () => [...posts].sort((a, b) => b.date.localeCompare(a.date)),
    [posts],
  );

  return (
    <>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {sorted.map((item, i) => {
          const Icon = iconFor(item.category);
          return (
            <Reveal key={item.id} delay={(i % 2) * 0.08}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
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
                <button
                  type="button"
                  onClick={() => setActive(item)}
                  className="mt-5 inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  aria-label={`Read more: ${item.title}`}
                >
                  Read more
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </article>
            </Reveal>
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
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
