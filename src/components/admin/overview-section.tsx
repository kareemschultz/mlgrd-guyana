"use client";

/**
 * Overview — ministry-themed statistics cards (adapted from shadcn studio
 * statistics blocks) showing real counts from the data layer, with animated
 * count-ups via NumberTicker, plus a premium animated "Recent activity" feed
 * (newest posts + inbound messages) built on the AnimatedList primitive.
 */
import {
  Newspaper,
  Images,
  Users,
  Inbox,
  CheckCircle2,
  Clock3,
  Mail,
  FileText,
  type LucideIcon,
} from "lucide-react";

import type { Message, Post } from "@/lib/data/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list";
import { PortalUpdatesSection } from "@/components/site/portal-updates-section";
import { cn } from "@/lib/utils";
import { formatDate } from "@/components/admin/shared";

export type OverviewCounts = {
  posts: number;
  published: number;
  gallery: number;
  ministers: number;
  newMessages: number;
  totalMessages: number;
};

type Stat = {
  icon: LucideIcon;
  title: string;
  value: number;
  badge: string;
  tone: "brand" | "gold" | "ink" | "green";
};

const toneClasses: Record<Stat["tone"], { icon: string; badge: string }> = {
  brand: { icon: "bg-brand/10 text-brand-700", badge: "bg-brand/10 text-brand-700" },
  gold: { icon: "bg-gold/15 text-[#8a6500]", badge: "bg-gold/15 text-[#8a6500]" },
  ink: { icon: "bg-ink/10 text-ink", badge: "bg-ink/10 text-ink" },
  green: {
    icon: "bg-emerald-500/10 text-emerald-700",
    badge: "bg-emerald-500/10 text-emerald-700",
  },
};

type ActivityItem = {
  id: string;
  kind: "post" | "message";
  title: string;
  sub: string;
  date: string;
  badge: string;
  badgeClass: string;
};

function buildActivity(posts: Post[], messages: Message[]): ActivityItem[] {
  const fromPosts: ActivityItem[] = posts.map((p) => ({
    id: `post-${p.id}`,
    kind: "post",
    title: p.title,
    sub: p.category,
    date: p.updatedAt || p.createdAt || p.date,
    badge: p.status === "published" ? "Published" : "Draft",
    badgeClass:
      p.status === "published"
        ? "bg-emerald-500/10 text-emerald-700"
        : "bg-muted text-muted-foreground",
  }));
  const fromMessages: ActivityItem[] = messages.map((m) => ({
    id: `msg-${m.id}`,
    kind: "message",
    title: m.subject || m.category || `Message from ${m.name}`,
    sub: m.name,
    date: m.createdAt,
    badge: m.channel,
    badgeClass: "bg-ink/10 text-ink capitalize",
  }));
  return [...fromPosts, ...fromMessages]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 6);
}

export function OverviewSection({
  counts,
  recentPosts = [],
  recentMessages = [],
}: {
  counts: OverviewCounts;
  recentPosts?: Post[];
  recentMessages?: Message[];
}) {
  const stats: Stat[] = [
    {
      icon: Newspaper,
      title: "News posts",
      value: counts.posts,
      badge: `${counts.published} published`,
      tone: "brand",
    },
    {
      icon: Images,
      title: "Gallery items",
      value: counts.gallery,
      badge: "Media library",
      tone: "gold",
    },
    {
      icon: Users,
      title: "Ministers & officials",
      value: counts.ministers,
      badge: "Minister's desk",
      tone: "ink",
    },
    {
      icon: Inbox,
      title: "New messages",
      value: counts.newMessages,
      badge: `${counts.totalMessages} total`,
      tone: counts.newMessages > 0 ? "green" : "ink",
    },
  ];

  const activity = buildActivity(recentPosts, recentMessages);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of the ministry portal&apos;s content and citizen messages.
        </p>
      </div>

      <AnimatedList
        as="div"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((s) => {
          const Icon = s.icon;
          const tc = toneClasses[s.tone];
          return (
            <Card
              key={s.title}
              className="gap-3 transition-shadow hover:shadow-md"
            >
              <CardHeader className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    tc.icon,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <Badge className={cn("font-medium", tc.badge)}>{s.badge}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <NumberTicker
                  value={s.value}
                  className="font-heading text-3xl font-extrabold text-foreground"
                />
                <span className="text-sm text-muted-foreground">{s.title}</span>
              </CardContent>
            </Card>
          );
        })}
      </AnimatedList>

      <Card className="overflow-hidden border-brand/10 bg-gradient-to-br from-background to-secondary/40">
        <CardContent className="p-5 sm:p-6">
          <PortalUpdatesSection compact limit={1} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand-700">
              <Clock3 className="size-5" />
            </span>
            <div>
              <p className="font-semibold leading-tight">Recent activity</p>
              <p className="text-sm text-muted-foreground">
                Latest posts and inbound messages.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No recent activity yet.
              </p>
            ) : (
              <AnimatedList className="flex flex-col gap-2">
                {activity.map((a) => {
                  const Icon = a.kind === "post" ? FileText : Mail;
                  return (
                    <AnimatedListItem
                      key={a.id}
                      accent={a.kind === "post" ? "brand" : "gold"}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            a.kind === "post"
                              ? "bg-brand/10 text-brand-700"
                              : "bg-gold/15 text-[#8a6500]",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {a.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {a.sub}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge className={cn("text-xs", a.badgeClass)}>
                            {a.badge}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(a.date)}
                          </span>
                        </div>
                    </AnimatedListItem>
                  );
                })}
              </AnimatedList>
            )}
          </CardContent>
        </Card>

        {/* Portal status */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700">
              <CheckCircle2 className="size-5" />
            </span>
            <p className="font-semibold leading-tight">Portal status</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-baseline gap-2">
              <NumberTicker
                value={counts.published}
                className="font-heading text-3xl font-extrabold text-emerald-700"
              />
              <span className="text-sm text-muted-foreground">
                of {counts.posts} posts live
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {counts.newMessages} message
              {counts.newMessages === 1 ? "" : "s"} awaiting review.
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{
                  width: `${
                    counts.posts > 0
                      ? Math.round((counts.published / counts.posts) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
