"use client";

import * as React from "react";
import { Download, FileText } from "lucide-react";

import { data } from "@/lib/data/client";
import type { ProcurementNotice, ProcurementNoticeType } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const NOTICE_TYPE_LABEL: Record<ProcurementNoticeType, string> = {
  ifb: "Invitation for Bids",
  rfq: "Request for Quotations",
  rfp: "Request for Proposals",
  eoi: "Expression of Interest",
};

function isOpen(closingAt: string): boolean {
  const d = new Date(closingAt);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProcurementList() {
  const [notices, setNotices] = React.useState<ProcurementNotice[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    data.procurementNotices
      .list()
      .then((live) => {
        if (alive) setNotices(live);
      })
      .catch(() => {
        /* fall back to the empty state below */
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const sorted = React.useMemo(
    () =>
      [...notices].sort((a, b) => {
        const aOpen = isOpen(a.closingAt);
        const bOpen = isOpen(b.closingAt);
        if (aOpen !== bOpen) return aOpen ? -1 : 1;
        return a.closingAt.localeCompare(b.closingAt);
      }),
    [notices],
  );

  if (loaded && sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
        <FileText className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 font-medium">No procurement notices right now</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back soon, or contact the Ministry&apos;s Procurement department directly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sorted.map((n) => {
        const open = isOpen(n.closingAt);
        return (
          <Card key={n.id} className={open ? "border-brand/15" : "opacity-70"}>
            <CardContent className="flex flex-col gap-2 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    open
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-700"
                      : "border-border bg-secondary text-muted-foreground"
                  }
                >
                  {open ? "Open" : "Closed"}
                </Badge>
                <Badge variant="outline" className="border-gold/30 bg-gold/10 text-[#8a6500]">
                  {NOTICE_TYPE_LABEL[n.noticeType]}
                </Badge>
                {n.refNo && <span className="text-xs text-muted-foreground">{n.refNo}</span>}
              </div>
              <h3 className="font-heading text-lg font-bold">{n.title}</h3>
              {n.summary && <p className="text-sm text-muted-foreground">{n.summary}</p>}
              <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Closes {formatDateTime(n.closingAt)}
                </span>
                {n.documentDataUrl && (
                  <a
                    href={n.documentDataUrl}
                    download={n.documentName || "notice-document"}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
                  >
                    <Download className="size-4" /> {n.documentName || "Download document"}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
