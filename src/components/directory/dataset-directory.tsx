"use client";

/**
 * Generic public directory — renders any registry dataset as a searchable,
 * region-filterable, paginated list of cards with expandable detail. Driven
 * entirely by the dataset's registry definition, so every dataset (schools,
 * health centres, villages, tenders, …) reuses this one component.
 *
 * Seeds from the committed public JSON and overlays live edits from the data
 * layer (admin → D1 in live mode, localStorage in demo).
 */
import * as React from "react";
import { ChevronDown, ExternalLink, Search, SlidersHorizontal, X } from "lucide-react";

import type { DatasetDef } from "@/lib/data/datasets";
import { tableColumns, publicColumns } from "@/lib/data/datasets";
import type { DatasetRecord } from "@/data/datasets";
import { data } from "@/lib/data/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 24;
const ALL = "__all__";

function val(rec: DatasetRecord, key: string): string {
  const v = rec[key];
  if (v === undefined || v === null || v === "") return "";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

export function DatasetDirectory({
  def,
  initial,
}: {
  def: DatasetDef;
  initial: DatasetRecord[];
}) {
  const [records, setRecords] = React.useState<DatasetRecord[]>(initial);
  const [query, setQueryRaw] = React.useState("");
  const [region, setRegionRaw] = React.useState<string>(ALL);
  const [page, setPage] = React.useState(0);
  const [openId, setOpenId] = React.useState<string | null>(null);

  // Changing a filter always returns to the first page.
  const setQuery = (v: string) => {
    setQueryRaw(v);
    setPage(0);
  };
  const setRegion = (v: string) => {
    setRegionRaw(v);
    setPage(0);
  };

  // In live mode, overlay admin-edited records from D1. In demo, the committed
  // `initial` seed already matches localStorage, so we skip the fetch to keep
  // the (potentially large) dataset chunk out of the public page.
  React.useEffect(() => {
    if (data.mode !== "live") return;
    let alive = true;
    data.datasets
      .list(def.key)
      .then((live) => {
        if (alive && Array.isArray(live) && live.length) setRecords(live as DatasetRecord[]);
      })
      .catch(() => {
        /* keep committed seed */
      });
    return () => {
      alive = false;
    };
  }, [def.key]);

  const primary = def.columns.find((c) => c.primary) ?? def.columns[0];
  const searchKeys = def.columns.filter((c) => c.searchable).map((c) => c.key);
  const cols = tableColumns(def).filter((c) => !c.primary);
  const detailCols = publicColumns(def).filter((c) => c.detail);

  const regions = React.useMemo(() => {
    if (!def.regionField) return [];
    const set = new Set<string>();
    for (const r of records) {
      const v = val(r, def.regionField);
      if (v) set.add(v);
    }
    return [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }, [records, def.regionField]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (region !== ALL && def.regionField && val(r, def.regionField) !== region)
        return false;
      if (!q) return true;
      return searchKeys.some((k) => val(r, k).toLowerCase().includes(q));
    });
  }, [records, query, region, def.regionField, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const shown = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${def.label.toLowerCase()}…`}
            className="pl-9"
            aria-label={`Search ${def.label}`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {def.regionField && regions.length > 1 && (
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-full sm:w-56" aria-label="Filter by region">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All regions</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {filtered.length.toLocaleString()} {filtered.length === 1 ? def.singular.toLowerCase() : def.label.toLowerCase()}
        {query || region !== ALL ? " match your filters" : " in total"}.
      </p>

      {/* List */}
      <ul className="mt-5 grid gap-3">
        {shown.map((rec) => {
          const open = openId === rec.id;
          const hasDetail = detailCols.some((c) => val(rec, c.key));
          return (
            <li
              key={rec.id}
              className="overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:border-brand/30"
            >
              <button
                type="button"
                onClick={() => hasDetail && setOpenId(open ? null : rec.id)}
                aria-expanded={hasDetail ? open : undefined}
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-left",
                  hasDetail && "cursor-pointer",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading font-bold leading-tight">
                      {val(rec, primary.key) || "—"}
                    </span>
                    {cols
                      .filter((c) => c.badge && val(rec, c.key))
                      .map((c) => (
                        <Badge
                          key={c.key}
                          variant="outline"
                          className="rounded-full border-brand/20 bg-brand/5 text-xs text-brand-700"
                        >
                          {val(rec, c.key)}
                        </Badge>
                      ))}
                  </div>
                  <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                    {cols
                      .filter((c) => !c.badge && val(rec, c.key))
                      .map((c) => (
                        <div key={c.key} className="flex gap-1.5">
                          <dt className="shrink-0 text-muted-foreground">{c.label}:</dt>
                          <dd className="min-w-0 truncate font-medium">{val(rec, c.key)}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
                {hasDetail && (
                  <ChevronDown
                    className={cn(
                      "mt-1 size-4 shrink-0 text-muted-foreground transition-transform",
                      open && "rotate-180",
                    )}
                  />
                )}
              </button>

              {open && hasDetail && (
                <div className="border-t bg-muted/30 px-4 py-3">
                  <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    {detailCols
                      .filter((c) => val(rec, c.key))
                      .map((c) => (
                        <div key={c.key} className="flex flex-col gap-0.5">
                          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {c.label}
                          </dt>
                          <dd>
                            {c.type === "url" ? (
                              <a
                                href={val(rec, c.key)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline"
                              >
                                {c.linkLabel ?? "Open"} <ExternalLink className="size-3.5" />
                              </a>
                            ) : (
                              <span className="whitespace-pre-wrap">{val(rec, c.key)}</span>
                            )}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
          No {def.label.toLowerCase()} match your search.
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {current + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={current >= pageCount - 1}
            className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
