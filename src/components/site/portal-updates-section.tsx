"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateIcon, updateToneClasses, updateToneLabels, type PortalUpdate } from "@/data/portal-updates";
import { data } from "@/lib/data/client";
import { seedUpdates } from "@/lib/data/seed-updates";
import { cn } from "@/lib/utils";

type PortalUpdatesSectionProps = {
  compact?: boolean;
  standalone?: boolean;
  limit?: number;
  className?: string;
};

function UpdateEntry({ update, index, total, compact = false }: { update: PortalUpdate; index: number; total: number; compact?: boolean }) {
  const Icon = updateIcon(update.icon);

  return (
    <article id={`update-${update.version}`} className="relative flex scroll-mt-24 justify-end gap-2">
      <div className="sticky top-24 hidden w-32 flex-col items-end gap-2 self-start pb-4 md:flex">
        <Badge className="rounded-sm bg-brand-600 text-sm font-medium text-white hover:bg-brand-600">
          {update.version}
        </Badge>
        <div className="text-right text-sm font-medium text-muted-foreground">{update.date}</div>
      </div>

      <div className="flex flex-col items-center" aria-hidden="true">
        <div className="sticky top-24 flex size-7 items-center justify-center max-sm:top-5">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/20">
            <span className="size-3 rounded-full bg-brand" />
          </span>
        </div>
        <span className={cn("-mt-3 w-px flex-1 border-l", index === total - 1 && "border-transparent")} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 pb-10 pl-3 md:pl-6 lg:pl-9">
        <div className="flex flex-col gap-2 md:hidden">
          <Badge className="w-fit rounded-sm bg-brand-600 font-medium text-white hover:bg-brand-600">{update.version}</Badge>
          <div className="text-sm font-medium text-muted-foreground">{update.date}</div>
        </div>

        <Card className="group relative gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-gold to-brand opacity-90" />
          <div className={cn("space-y-4 p-5 sm:p-6", compact && "p-4 sm:p-5")}>
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-700 ring-1 ring-brand/10 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className={cn("font-heading text-xl font-bold leading-tight", compact && "text-lg")}>{update.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{update.summary}</p>
              </div>
            </div>

            <Accordion type="multiple" defaultValue={[`${update.version}-0`]} className="w-full">
              {update.sections.map((section, sectionIndex) => (
                <AccordionItem key={section.title} value={`${update.version}-${sectionIndex}`} className="border-border/70">
                  <AccordionTrigger className="py-3 hover:no-underline [&>svg]:size-5">
                    <Badge className={cn("h-6 rounded-sm border font-medium", updateToneClasses[section.type])}>
                      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                      {updateToneLabels[section.type]}
                    </Badge>
                    <span className="sr-only">: {section.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="mb-3 text-sm font-medium text-foreground">{section.title}</p>
                    <ul className="ml-4 list-disc space-y-2 text-sm leading-6 text-muted-foreground">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Card>
      </div>
    </article>
  );
}

export function PortalUpdatesSection({ compact = false, standalone = false, limit, className }: PortalUpdatesSectionProps) {
  const [all, setAll] = useState<PortalUpdate[]>(() => seedUpdates);

  useEffect(() => {
    let alive = true;
    data.updates
      .list()
      .then((live) => {
        if (alive && Array.isArray(live) && live.length) setAll(live);
      })
      .catch(() => {
        /* keep seed fallback */
      });
    return () => {
      alive = false;
    };
  }, []);

  const updates = typeof limit === "number" ? all.slice(0, limit) : all;
  const headingId = compact ? "portal-updates-compact-heading" : "portal-updates-heading";

  return (
    <section
      className={cn(compact ? "py-0" : standalone ? "py-16 sm:py-20" : "bg-secondary/30 py-20", className)}
      aria-labelledby={headingId}
    >
      <div className={cn(!compact && "container-gov")}>
        <div className={cn("mb-10 flex flex-col gap-4", compact ? "mb-5" : "text-center md:mb-12")}>
          <div className={cn("flex items-center gap-2", !compact && "justify-center")}>
            <Badge variant="outline" className="gap-1.5 rounded-full border-brand/20 bg-brand/10 text-brand-700">
              <Megaphone className="size-3.5" />
              Ministry updates
            </Badge>
          </div>
          <div className={cn(!compact && "mx-auto max-w-2xl")}>
            <h2 id={headingId} className={cn("font-heading font-extrabold tracking-tight", compact ? "text-xl" : "text-3xl sm:text-4xl")}>
              What&apos;s New at the Ministry
            </h2>
            <p className={cn("mt-3 text-muted-foreground", compact ? "text-sm" : "text-base")}>
              Plain-language updates on online services, council information, and improvements that help citizens get things done.
            </p>
          </div>
          {!compact && (
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/news">
                  Read ministry news <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/services">Browse services</Link>
              </Button>
            </div>
          )}
        </div>

        <div className={cn("mx-auto", compact ? "max-w-none" : "max-w-4xl")}>
          {updates.map((update, index) => (
            <UpdateEntry key={update.id} update={update} index={index} total={updates.length} compact={compact} />
          ))}
        </div>
      </div>
    </section>
  );
}
