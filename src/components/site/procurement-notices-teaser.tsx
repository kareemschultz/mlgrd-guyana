"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { data } from "@/lib/data/client";
import type { ProcurementNotice } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";

function isOpen(closingAt: string): boolean {
  const d = new Date(closingAt);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function ProcurementNoticesTeaser() {
  const [notices, setNotices] = React.useState<ProcurementNotice[]>([]);

  React.useEffect(() => {
    let alive = true;
    data.procurementNotices
      .list()
      .then((live) => {
        if (alive && Array.isArray(live)) setNotices(live);
      })
      .catch(() => {
        /* keep empty state */
      });
    return () => {
      alive = false;
    };
  }, []);

  const open = React.useMemo(
    () =>
      notices
        .filter((n) => isOpen(n.closingAt))
        .sort((a, b) => a.closingAt.localeCompare(b.closingAt))
        .slice(0, 2),
    [notices],
  );

  return (
    <div className="mt-8 rounded-2xl border border-brand/10 bg-white/70 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
        <FileText className="size-4" />
        Procurement Notices
      </div>
      {open.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No open procurement notices right now.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {open.map((n) => (
            <li key={n.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="line-clamp-1 font-medium">{n.title}</span>
              <Badge variant="outline" className="shrink-0 border-gold/30 bg-gold/10 text-[#8a6500]">
                Closes {formatDate(n.closingAt)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/procurement"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        View all procurement notices <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
