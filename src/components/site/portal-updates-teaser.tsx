"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Megaphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateToneClasses, updateToneLabels } from "@/data/portal-updates";
import { data } from "@/lib/data/client";
import { seedUpdates } from "@/lib/data/seed-updates";
import type { PortalUpdate } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function PortalUpdatesTeaser() {
  const [updates, setUpdates] = useState<PortalUpdate[]>(() => seedUpdates);

  useEffect(() => {
    let alive = true;
    data.updates
      .list()
      .then((live) => {
        if (alive && Array.isArray(live) && live.length) setUpdates(live);
      })
      .catch(() => {
        /* keep seed fallback */
      });
    return () => {
      alive = false;
    };
  }, []);

  const latest = updates[0];
  const visibleSections = latest.sections.slice(0, 2);

  return (
    <section className="bg-secondary/30 py-14 sm:py-16" aria-labelledby="portal-updates-teaser-heading">
      <div className="container-gov">
        <Card className="overflow-hidden border-brand/10 bg-card shadow-sm">
          <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <Badge variant="outline" className="gap-1.5 rounded-full border-brand/20 bg-brand/10 text-brand-700">
                <Megaphone className="size-3.5" />
                Ministry updates
              </Badge>
              <h2 id="portal-updates-teaser-heading" className="mt-4 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
                What&apos;s New at the Ministry
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                See recent improvements to online services, council information, notices, and citizen support in one place.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="bg-brand-600 hover:bg-brand-700">
                  <Link href="/updates">
                    View all updates <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/news">Read Ministry News</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border bg-background/80 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4 text-brand-600" />
                <span className="font-medium text-foreground">{latest.date}</span>
                <span aria-hidden="true">·</span>
                <span>{latest.version}</span>
              </div>
              <h3 className="mt-3 font-heading text-lg font-bold">{latest.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{latest.summary}</p>
              <div className="mt-4 grid gap-2">
                {visibleSections.map((section) => (
                  <div key={section.title} className="flex items-start gap-3 rounded-xl bg-secondary/70 p-3">
                    <Badge className={cn("h-6 shrink-0 rounded-sm border font-medium", updateToneClasses[section.type])}>
                      {updateToneLabels[section.type]}
                    </Badge>
                    <p className="text-sm font-medium leading-6">{section.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
