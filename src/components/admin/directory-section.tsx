"use client";

/**
 * Directories — read-only browse/search across the full local-government
 * directory (NDC / RDC / Municipality / CDC, ~440 records). Filter by kind,
 * region and free text. Wired to data.directory.list().
 *
 * Sensitive fields (personal mobile numbers, personal emails, internal
 * comments) only exist in LIVE (Cloudflare) mode; the committed local seed is
 * the public-safe subset.
 */
import * as React from "react";
import {
  Network,
  Search,
  Info,
  MapPin,
  Mail,
  Phone,
  UserRound,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { data } from "@/lib/data/client";
import type { DirectoryEntry, DirectoryKind } from "@/lib/data/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState, EmptyState } from "@/components/admin/shared";

const ALL = "all";
const PAGE_SIZE = 24;

const KIND_LABELS: Record<DirectoryKind, string> = {
  ndc: "NDC",
  rdc: "RDC",
  municipality: "Municipality",
  cdc: "CDC",
};

const KIND_STYLES: Record<DirectoryKind, string> = {
  ndc: "bg-brand/10 text-brand-700",
  rdc: "bg-ink/10 text-ink",
  municipality: "bg-gold/15 text-[#8a6500]",
  cdc: "bg-emerald-500/10 text-emerald-700",
};

function regionNumber(region: string): number {
  const m = region.match(/\d+/);
  return m ? Number.parseInt(m[0], 10) : 999;
}

function KindBadge({ kind }: { kind: DirectoryKind }) {
  return <Badge className={KIND_STYLES[kind]}>{KIND_LABELS[kind]}</Badge>;
}

export function DirectorySection() {
  const [entries, setEntries] = React.useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [kind, setKind] = React.useState<"all" | DirectoryKind>("all");
  const [region, setRegion] = React.useState<string>(ALL);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await data.directory.list();
        if (active) setEntries(list);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Filter changes reset to the first page (handlers, not an effect).
  const onQuery = (v: string) => { setQuery(v); setPage(1); };
  const onKind = (v: "all" | DirectoryKind) => { setKind(v); setPage(1); };
  const onRegion = (v: string) => { setRegion(v); setPage(1); };

  const regionOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const e of entries) {
      if (!map.has(e.region)) map.set(e.region, e.regionName || e.region);
    }
    return [...map.entries()]
      .map(([value, name]) => ({ value, name }))
      .sort((a, b) => regionNumber(a.value) - regionNumber(b.value));
  }, [entries]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter((e) => kind === "all" || e.kind === kind)
      .filter((e) => region === ALL || e.region === region)
      .filter((e) => {
        if (!q) return true;
        return (
          e.name.toLowerCase().includes(q) ||
          (e.council?.toLowerCase().includes(q) ?? false) ||
          (e.regionName?.toLowerCase().includes(q) ?? false) ||
          e.region.toLowerCase().includes(q) ||
          e.officials.some(
            (o) =>
              o.name.toLowerCase().includes(q) ||
              o.role.toLowerCase().includes(q),
          )
        );
      })
      .sort(
        (a, b) =>
          regionNumber(a.region) - regionNumber(b.region) ||
          a.name.localeCompare(b.name),
      );
  }, [entries, kind, region, query]);

  const hasFilters = query.trim() !== "" || kind !== "all" || region !== ALL;

  function clearFilters() {
    setQuery("");
    setKind("all");
    setRegion(ALL);
    setPage(1);
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">
            Directories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and search the full local-government directory — councils,
            municipalities and their officials.
          </p>
        </div>
      </div>

      {/* Confidentiality note */}
      <div className="flex items-start gap-2.5 rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-brand-600" />
        <p>
          Personal contact numbers, personal emails and internal notes shown here
          are for{" "}
          <span className="font-medium text-foreground">official use only</span> and
          are never published on the public website.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search by name, region or official…"
            className="pl-9 pr-9"
            autoComplete="off"
            aria-label="Search directory"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Select value={kind} onValueChange={(v) => onKind(v as typeof kind)}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="ndc">NDCs</SelectItem>
            <SelectItem value="rdc">RDCs</SelectItem>
            <SelectItem value="municipality">Municipalities</SelectItem>
            <SelectItem value="cdc">CDCs</SelectItem>
          </SelectContent>
        </Select>
        <Select value={region} onValueChange={onRegion}>
          <SelectTrigger className="w-[200px]" aria-label="Filter by region">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-brand-600" />
              <SelectValue placeholder="All regions" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All regions</SelectItem>
            {regionOptions.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.value} — {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-3.5" /> Clear
          </Button>
        )}
      </div>

      {!loading && (
        <p className="-mt-2 text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
          <span className="font-semibold text-foreground">{entries.length}</span>{" "}
          records
        </p>
      )}

      {loading ? (
        <LoadingState label="Loading directory…" />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Network}
          title="No directory records"
          description="Local-government directory records will appear here."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description="No records match the current filters."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {pageItems.map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page <span className="font-semibold text-foreground">{safePage}</span> of{" "}
                <span className="font-semibold text-foreground">{pageCount}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage >= pageCount}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EntryCard({ entry }: { entry: DirectoryEntry }) {
  const contacts = entry.officeAddress || entry.officePhone || entry.email;

  return (
    <Card className="flex h-full flex-col gap-4 p-5 transition-shadow hover:border-gold/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-bold leading-snug">
              {entry.name}
            </h3>
            {entry.kind === "cdc" && entry.status && (
              <Badge variant="secondary" className="capitalize">
                {entry.status}
              </Badge>
            )}
          </div>
          {entry.council && (
            <p className="mt-0.5 text-sm text-muted-foreground">{entry.council}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <KindBadge kind={entry.kind} />
          <Badge variant="secondary" className="rounded-full text-xs">
            {entry.region}
          </Badge>
        </div>
      </div>

      {entry.officials.length > 0 && (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {entry.officials.map((o, i) => (
            <li key={`${o.role}-${o.name}-${i}`} className="flex items-start gap-2">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <UserRound className="size-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{o.role}</span>
                <span className="block text-sm font-medium leading-snug">
                  {o.name}
                </span>
                {/* Sensitive fields only present in live mode. */}
                {(o.personalPhone || o.email) && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {[o.personalPhone, o.email].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {contacts && (
        <dl className="space-y-1.5 border-t pt-3 text-sm text-muted-foreground">
          {entry.officeAddress && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
              <dd>{entry.officeAddress}</dd>
            </div>
          )}
          {entry.officePhone && (
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
              <dd>{entry.officePhone}</dd>
            </div>
          )}
          {entry.email && (
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
              <dd className="break-all">{entry.email}</dd>
            </div>
          )}
        </dl>
      )}

      {entry.comments && (
        <p className="rounded-md bg-gold/10 px-3 py-2 text-xs text-[#8a6500]">
          <span className="font-medium">Internal note:</span> {entry.comments}
        </p>
      )}
    </Card>
  );
}
