"use client";

/**
 * Full article page body for /news/[slug]. Renders the post from the build-time
 * seed instantly (so SSG + SEO work), then overlays the latest version from the
 * data layer (live edits) and computes "related" stories. Cover hero, readable
 * body, tags, share, optional source link, and related cards.
 */
import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ExternalLink,
  Share2,
  Tag as TagIcon,
} from "lucide-react";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import { asset } from "@/lib/site";
import type { Post } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ArticleView({ initial }: { initial: Post }) {
  const reduce = useReducedMotion();
  const { slug, category } = initial;
  const [post, setPost] = React.useState<Post>(initial);
  const [related, setRelated] = React.useState<Post[]>([]);

  React.useEffect(() => {
    let alive = true;
    data.posts
      .list()
      .then((all) => {
        if (!alive || !Array.isArray(all)) return;
        const published = all.filter((p) => p.status === "published");
        const fresh = published.find((p) => p.slug === slug);
        if (fresh) setPost(fresh);
        const cat = (fresh ?? initial).category;
        setRelated(
          published
            .filter((p) => p.slug !== slug && p.category === cat)
            .slice(0, 3),
        );
      })
      .catch(() => {
        /* keep seed */
      });
    return () => {
      alive = false;
    };
  }, [slug, category, initial]);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: post.title, text: post.excerpt, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard.");
      }
    } catch {
      /* user cancelled share */
    }
  }

  const body = paragraphs(post.body);
  const enter = reduce
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  return (
    <article>
      {/* ── Hero ── */}
      {post.coverImage ? (
        <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(post.coverImage)}
            alt={post.title}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
          <div className="container-gov relative flex h-full flex-col justify-end pb-10">
            <ArticleMeta post={post} onLight />
            <h1 className="mt-3 max-w-3xl font-heading text-3xl font-extrabold leading-tight text-white drop-shadow sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
          </div>
        </div>
      ) : (
        <div className="bg-ink py-14 text-white sm:py-20">
          <div className="container-gov">
            <ArticleMeta post={post} onLight />
            <h1 className="mt-3 max-w-3xl font-heading text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="container-gov py-10 sm:py-14">
        <Link
          href="/news"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="size-4" /> Back to News
        </Link>

        <motion.div
          {...enter}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl"
        >
          {post.excerpt && (
            <p className="mb-8 border-l-4 border-gold pl-4 font-heading text-lg font-medium leading-relaxed text-foreground/90 sm:text-xl">
              {post.excerpt}
            </p>
          )}

          <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-1.5">
              <TagIcon className="size-3.5 text-muted-foreground" />
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-6">
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <Share2 className="size-4" /> Share
            </button>
            {post.sourceUrl && (
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:border-brand/50 hover:bg-brand/10"
              >
                <ExternalLink className="size-4" /> Read on the official source
              </a>
            )}
          </div>
        </motion.div>

        {/* ── Related ── */}
        {related.length > 0 && (
          <div className="mx-auto mt-14 max-w-5xl border-t pt-10">
            <h2 className="font-heading text-xl font-bold">Related news</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <RelatedCard key={r.id} post={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function ArticleMeta({ post, onLight }: { post: Post; onLight?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge className={cn(onLight ? "bg-gold text-ink" : "bg-secondary")}>
        {post.category}
      </Badge>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium",
          onLight ? "text-white/80" : "text-muted-foreground",
        )}
      >
        <Calendar className="size-3.5" />
        {fmtDate(post.date)}
      </span>
    </div>
  );
}

function RelatedCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:border-brand/40 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset(post.coverImage)}
            alt={post.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-600 to-brand-700" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {post.category}
        </span>
        <h3 className="mt-1 font-heading text-base font-bold leading-snug group-hover:text-brand-700">
          {post.title}
        </h3>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
          Read <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
