"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Recycle,
  Landmark,
  Megaphone,
  HandHelping,
  Newspaper,
  Calendar,
  ArrowRight,
  ExternalLink,
  Search,
  X,
  SlidersHorizontal,
  Tag as TagIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { data } from "@/lib/data/client";
import { seedPosts } from "@/lib/data/seed";
import type { Post } from "@/lib/data/types";

/**
 * Slugs that have a statically-generated /news/[slug] page (built from the
 * published seed). Posts created live in the admin aren't pre-rendered, so they
 * open in the in-page reader until the next deploy bakes their page in.
 */
const ARTICLE_SLUGS = new Set(
  seedPosts.filter((p) => p.status === "published").map((p) => p.slug),
);
import { useModalA11y } from "@/hooks/use-modal-a11y";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Live news feed with robust search + filtering, and a full-article reader.
 *
 * Filters (all combinable, AND): a keyword search over title/excerpt/body/
 * category/tags supporting `*` and `?` wildcards (and plain substring); a year
 * filter; a single-select category filter; and multi-select tag chips. Initial
 * state is the published seed posts so the static export renders instantly; a
 * useEffect overlays live/published updates from the data layer.
 */

const CATEGORY_ICON: Record<string, LucideIcon> = {
  Legislation: Recycle,
  "Capacity-building": Landmark,
  "Digital services": Megaphone,
  "Community development": HandHelping,
  Programmes: HandHelping,
  Governance: Landmark,
  Environment: Recycle,
  "Regional Development": Landmark,
  "Local Democracy": Landmark,
  "Press Release": Megaphone,
};

function iconFor(category: string): LucideIcon {
  return CATEGORY_ICON[category] ?? Newspaper;
}

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function yearOf(iso: string): string {
  return iso.slice(0, 4);
}

function countLabel(n: number): string {
  return `${n} update${n === 1 ? "" : "s"}`;
}

function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const onlyPublished = (posts: Post[]) =>
  posts.filter((p) => p.status === "published");

/** The searchable text blob for a post. */
function haystack(p: Post): string {
  return [p.title, p.excerpt, p.body, p.category, ...(p.tags ?? [])]
    .join(" ")
    .toLowerCase();
}

/**
 * Build a matcher from a query. Each whitespace-separated term must match
 * (AND). A term with `*` (any run) or `?` (any single char) is treated as a
 * wildcard pattern; otherwise it's a plain substring. Returns null for an empty
 * query (matches everything).
 */
function buildMatcher(query: string): ((hay: string) => boolean) | null {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return null;
  const tests = terms.map((t) => {
    if (/[*?]/.test(t)) {
      const pattern = t
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".");
      try {
        return new RegExp(pattern);
      } catch {
        return t.replace(/[*?]/g, "");
      }
    }
    return t;
  });
  return (hay: string) =>
    tests.every((test) =>
      typeof test === "string" ? hay.includes(test) : test.test(hay),
    );
}

const ALL = "all" as const;

export function NewsFeed() {
  const [posts, setPosts] = useState<Post[]>(() => onlyPublished(seedPosts));
  const [active, setActive] = useState<Post | null>(null);
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [tags, setTags] = useState<Set<string>>(() => new Set());
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLElement>(null);
  useModalA11y(!!active, () => setActive(null), dialogRef);

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

  const years = useMemo(() => {
    const set = new Set(sorted.map((p) => yearOf(p.date)));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [sorted]);

  const categories = useMemo(() => {
    const set = new Set(sorted.map((p) => p.category).filter(Boolean));
    return [...set].sort();
  }, [sorted]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of sorted) for (const t of p.tags ?? []) set.add(t);
    return [...set].sort();
  }, [sorted]);

  const activeYear = year !== ALL && years.includes(year) ? year : ALL;
  const activeCategory = category !== ALL && categories.includes(category) ? category : ALL;

  const matcher = useMemo(() => buildMatcher(query), [query]);

  const visible = useMemo(() => {
    return sorted.filter((p) => {
      if (activeYear !== ALL && yearOf(p.date) !== activeYear) return false;
      if (activeCategory !== ALL && p.category !== activeCategory) return false;
      if (tags.size > 0) {
        const pt = new Set(p.tags ?? []);
        for (const t of tags) if (!pt.has(t)) return false;
      }
      if (matcher && !matcher(haystack(p))) return false;
      return true;
    });
  }, [activeCategory, activeYear, sorted, tags, matcher]);

  const filtersActive =
    query.trim() !== "" || activeYear !== ALL || activeCategory !== ALL || tags.size > 0;

  const toggleTag = (t: string) =>
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const clearAll = () => {
    setQuery("");
    setYear(ALL);
    setCategory(ALL);
    setTags(new Set());
  };

  // Re-animate the grid when the chip filters change (not on every keystroke).
  const gridKey = `${activeYear}|${activeCategory}|${[...tags].sort().join(",")}`;

  return (
    <>
      {/* ───────────── Search + filters toolbar ───────────── */}
      <Reveal className="mt-8 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        {/* Search box */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            placeholder="Search updates… (try a keyword, or wildcards like road* or reg?on)"
            aria-label="Search updates"
            className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Year + Category rows */}
        <div className="mt-4 space-y-3">
          <FilterRow label="Year">
            <FilterChip label="All" active={year === ALL} onClick={() => setYear(ALL)} />
            {years.map((y) => (
              <FilterChip key={y} label={y} active={year === y} onClick={() => setYear(y)} />
            ))}
          </FilterRow>

          {categories.length > 0 && (
            <FilterRow label="Category">
              <FilterChip
                label="All"
                active={category === ALL}
                onClick={() => setCategory(ALL)}
              />
              {categories.map((c) => (
                <FilterChip
                  key={c}
                  label={c}
                  active={category === c}
                  onClick={() => setCategory(category === c ? ALL : c)}
                />
              ))}
            </FilterRow>
          )}

          {allTags.length > 0 && (
            <FilterRow label="Tags" icon={TagIcon}>
              {allTags.map((t) => (
                <FilterChip
                  key={t}
                  label={t}
                  active={tags.has(t)}
                  variant="tag"
                  onClick={() => toggleTag(t)}
                />
              ))}
            </FilterRow>
          )}
        </div>

        {/* Count + clear */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground" aria-live="polite">
            <SlidersHorizontal className="size-3.5" />
            {filtersActive
              ? `${countLabel(visible.length)} match your filters`
              : `${countLabel(visible.length)} in total`}
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand-700"
            >
              <X className="size-3.5" /> Clear all
            </button>
          )}
        </div>
      </Reveal>

      {/* ───────────── Results grid ───────────── */}
      {visible.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <Newspaper className="size-10 text-muted-foreground/50" />
          <p className="mt-4 font-heading text-lg font-bold">No updates found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Nothing matches your search and filters. Try a different keyword or
            clear the filters.
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <X className="size-4" /> Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div key={gridKey} className="mt-8 grid gap-6 md:grid-cols-2">
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
                      alt={item.title}
                      loading="lazy"
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

                {/* Clickable tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.tags.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                          tags.has(t)
                            ? "bg-brand-600 text-white"
                            : "bg-secondary text-muted-foreground hover:bg-brand/10 hover:text-brand-700",
                        )}
                        aria-pressed={tags.has(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {ARTICLE_SLUGS.has(item.slug) ? (
                    <Link
                      href={`/news/${item.slug}`}
                      className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                      aria-label={`Read more: ${item.title}`}
                    >
                      Read more
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActive(item)}
                      className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                      aria-label={`Read more: ${item.title}`}
                    >
                      Read more
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}
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
      )}

      {/* ───────────── Full-article reader ───────────── */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
          >
            <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" />
            <motion.article
              ref={dialogRef}
              tabIndex={-1}
              className="relative z-10 max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border bg-card shadow-2xl focus:outline-none sm:rounded-2xl"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
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
                  <img src={active.coverImage} alt={active.title} loading="lazy" className="h-full w-full object-cover" />
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
                {active.tags && active.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap items-center gap-1.5">
                    <TagIcon className="size-3.5 text-muted-foreground" />
                    {active.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
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

/** A labelled row of filter chips. */
function FilterRow({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-2">
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-20 sm:pt-1.5">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </span>
      {/* Mobile: one horizontally-scrollable strip (saves vertical space).
          Desktop: wrap onto multiple lines where there's room. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {children}
      </div>
    </div>
  );
}

/** A single filter chip (toggle button). */
function FilterChip({
  label,
  active,
  onClick,
  variant = "default",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "tag";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2",
        variant === "tag" ? "px-3 py-1 text-xs" : "px-4 py-1.5",
        active
          ? "border-brand-600 bg-brand-600 text-white shadow-sm"
          : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-brand-700",
      )}
    >
      {variant === "tag" && !active ? `#${label}` : label}
    </button>
  );
}
