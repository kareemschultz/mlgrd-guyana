"use client";

import { useMemo, useState } from "react";
import { MapPin, Search, Users, UserRound, X } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Cdc = {
  region: string;
  regionName: string;
  name: string;
  chairman: string;
};

const ALL = "all";

/** Sort "Region 4" style strings by their numeric part. */
function regionNumber(region: string): number {
  const m = region.match(/\d+/);
  return m ? Number.parseInt(m[0], 10) : 999;
}

export function CdcDirectory({ cdcs }: { cdcs: Cdc[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>(ALL);

  // Drop spreadsheet "header" rows (region separators) that carry no chairman
  // and read as section titles rather than real councils.
  const records = useMemo(
    () =>
      cdcs.filter(
        (c) => c.name.trim() !== "" && c.chairman.trim() !== "",
      ),
    [cdcs],
  );

  // Distinct regions that actually have CDCs, ordered by region number.
  const regionOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of records) map.set(c.region, c.regionName);
    return [...map.entries()]
      .map(([value, name]) => ({ value, name }))
      .sort((a, b) => regionNumber(a.value) - regionNumber(b.value));
  }, [records]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((c) => {
      const matchesRegion = region === ALL || c.region === region;
      if (!matchesRegion) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.chairman.toLowerCase().includes(q) ||
        c.regionName.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
      );
    });
  }, [records, query, region]);

  // Group filtered results by region (used when showing all regions).
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { region: string; regionName: string; items: Cdc[] }
    >();
    for (const c of filtered) {
      if (!map.has(c.region)) {
        map.set(c.region, { region: c.region, regionName: c.regionName, items: [] });
      }
      map.get(c.region)!.items.push(c);
    }
    return [...map.values()].sort(
      (a, b) => regionNumber(a.region) - regionNumber(b.region),
    );
  }, [filtered]);

  const hasFilters = query.trim() !== "" || region !== ALL;
  const showGrouped = region === ALL;

  function clearFilters() {
    setQuery("");
    setRegion(ALL);
  }

  return (
    <div className="container-gov py-14 sm:py-16">
      {/* ───── Filter toolbar ───── */}
      <Reveal>
        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            {/* Search */}
            <div className="space-y-1.5">
              <Label htmlFor="cdc-search" className="text-sm font-semibold">
                Search councils
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="cdc-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by council, chairman or region…"
                  className="h-11 pl-9 pr-9"
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Region filter */}
            <div className="space-y-1.5">
              <Label htmlFor="cdc-region" className="text-sm font-semibold">
                Filter by region
              </Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger
                  id="cdc-region"
                  className="h-11 w-full min-w-[15rem] data-[size=default]:h-11"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-brand-600" />
                    <SelectValue placeholder="All regions" />
                  </span>
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value={ALL}>All regions</SelectItem>
                  {regionOptions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.value} — {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Result count + clear */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
              <span className="font-semibold text-foreground">{records.length}</span> councils
              {region !== ALL && (
                <>
                  {" "}in{" "}
                  <span className="font-semibold text-brand-600">{region}</span>
                </>
              )}
            </p>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-brand-600 hover:bg-brand/10 hover:text-brand-700"
              >
                <X className="size-3.5" /> Clear filters
              </Button>
            )}
          </div>
        </div>
      </Reveal>

      {/* ───── Results ───── */}
      {filtered.length === 0 ? (
        <EmptyState onReset={clearFilters} query={query} />
      ) : showGrouped ? (
        <div className="mt-10 space-y-12">
          {grouped.map((group) => (
            <section key={group.region}>
              <div className="sticky top-16 z-10 -mx-2 mb-5 flex items-center gap-3 bg-background/85 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/70">
                <h2 className="font-heading text-xl font-bold">{group.regionName}</h2>
                <Badge variant="secondary" className="rounded-full">
                  {group.region}
                </Badge>
                <span className="ml-auto text-sm text-muted-foreground">
                  {group.items.length} {group.items.length === 1 ? "council" : "councils"}
                </span>
              </div>
              <CardGrid items={group.items} />
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <CardGrid items={filtered} />
        </div>
      )}
    </div>
  );
}

function CardGrid({ items }: { items: Cdc[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c, i) => (
        <Reveal as="li" key={`${c.region}-${c.name}-${i}`} delay={(i % 3) * 0.05}>
          <div className="group flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Users className="size-5" />
              </span>
              <Badge variant="secondary" className="shrink-0 rounded-full">
                {c.region}
              </Badge>
            </div>
            <h3 className="mt-4 font-heading text-lg font-bold leading-snug">
              {c.name}
            </h3>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <UserRound className="size-4" />
              </span>
              <span>
                <span className="block text-xs text-muted-foreground">Chairman</span>
                <span className="font-medium">{c.chairman}</span>
              </span>
            </div>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

function EmptyState({ onReset, query }: { onReset: () => void; query: string }) {
  return (
    <Reveal className="mt-10">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-secondary/30 px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand-600">
          <Search className="size-6" />
        </span>
        <h3 className="mt-4 font-heading text-lg font-bold">No councils found</h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {query.trim()
            ? `We couldn't find any council matching “${query.trim()}”. Try a different name or region.`
            : "No councils match the selected filters."}
        </p>
        <Button
          onClick={onReset}
          className="mt-5 bg-brand-600 text-white hover:bg-brand-700"
        >
          Reset filters
        </Button>
      </div>
    </Reveal>
  );
}
