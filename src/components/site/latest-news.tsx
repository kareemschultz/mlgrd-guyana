"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import { asset } from "@/lib/site";
import { BorderBeam } from "@/components/ui/border-beam";
import { data } from "@/lib/data/client";
import { seedPosts } from "@/lib/data/seed";
import type { Post } from "@/lib/data/types";

/**
 * Hero right-hand column: the ministry emblem treatment + a compact
 * "Latest updates" panel.
 *
 * The emblem makes the local-government identity read instantly (per the
 * Minister's brief). Beneath it, the newest 3 published posts are listed, each
 * linking through to /news. Initial state is seeded from `seedPosts` so the
 * static export shows real content immediately; a useEffect overlays live data
 * from the admin/backend. A subtle motion entrance respects reduced motion.
 */

const onlyPublished = (posts: Post[]) =>
  posts.filter((p) => p.status === "published");

const newestThree = (posts: Post[]) =>
  [...onlyPublished(posts)]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

/** Format an ISO `yyyy-mm-dd` date as e.g. "9 Jun 2026". */
function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HeroEmblemNews() {
  const [posts, setPosts] = useState<Post[]>(() => newestThree(seedPosts));
  const reduce = useReducedMotion();

  useEffect(() => {
    let alive = true;
    data.posts
      .list()
      .then((live) => {
        if (alive && Array.isArray(live)) setPosts(newestThree(live));
      })
      .catch(() => {
        /* keep seed fallback */
      });
    return () => {
      alive = false;
    };
  }, []);

  const entrance = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={entrance.initial}
      animate={entrance.animate}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Emblem treatment (official ministry crest on a dark tile) ── */}
      <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-ink via-ink to-[#161514] px-6 py-8 text-center shadow-xl shadow-ink/30">
        <BorderBeam
          size={160}
          duration={10}
          className="from-gold via-gold to-transparent"
        />
        <div className="pointer-events-none absolute inset-0 bg-dot text-gold/[0.12]" />
        {/* pulsing gold glow behind the crest */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/25 blur-3xl"
          animate={reduce ? undefined : { opacity: [0.5, 0.85, 0.5], scale: [1, 1.08, 1] }}
          transition={
            reduce
              ? undefined
              : { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.img
          src={asset("/emblem.png")}
          alt="Ministry of Local Government & Regional Development emblem"
          className="relative mx-auto h-auto w-56 drop-shadow-[0_8px_30px_rgba(212,160,23,0.35)] sm:w-72"
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={
            reduce
              ? undefined
              : { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <p className="relative mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
          Government of Guyana
        </p>
        <div className="relative mx-auto mt-3 h-0.5 w-16 rounded-full bg-gold" />
      </div>

      {/* ── Latest updates ── */}
      <div className="relative overflow-hidden rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
            <Newspaper className="size-4 text-gold" /> Latest updates
          </h3>
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gold transition-colors hover:text-gold/80"
          >
            View all news <ArrowRight className="size-3" />
          </Link>
        </div>

        <ul className="mt-4 flex flex-col divide-y divide-border">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href="/news"
                className="group flex flex-col gap-1 py-3 transition-colors first:pt-0 last:pb-0"
              >
                <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Calendar className="size-3" />
                  {fmtDate(post.date)}
                </span>
                <span className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-gold-700">
                  {post.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
