"use client";

/**
 * Overview — ministry-themed statistics cards (adapted from shadcn studio
 * statistics blocks) showing real counts from the data layer, with animated
 * count-ups via the existing NumberTicker.
 */
import {
  Newspaper,
  Images,
  Users,
  Inbox,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

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

export function OverviewSection({ counts }: { counts: OverviewCounts }) {
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const tc = toneClasses[s.tone];
          return (
            <Card key={s.title} className="gap-3">
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
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="font-medium">Portal status</p>
              <p className="text-sm text-muted-foreground">
                {counts.published} of {counts.posts} posts are live to the
                public. {counts.newMessages} message
                {counts.newMessages === 1 ? "" : "s"} awaiting review.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
