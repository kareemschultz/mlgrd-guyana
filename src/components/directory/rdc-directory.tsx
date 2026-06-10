"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink,
  Globe,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Search,
  Share2,
  UserRound,
  X,
} from "lucide-react";
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

type Official = { role: string; name: string };

type Rdc = {
  region: string;
  name: string;
  council: string;
  address?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  website?: string;
  officials: Official[];
};

const ALL = "all";

function regionNumber(region: string): number {
  const m = region.match(/\d+/);
  return m ? Number.parseInt(m[0], 10) : 999;
}

/** Build a https:// URL from a possibly-bare website value. */
function websiteHref(raw: string): string {
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

/** Build a Facebook URL — accepts a full URL or a page name. */
function facebookHref(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("facebook.com")) return `https://${v}`;
  return `https://www.facebook.com/search/top?q=${encodeURIComponent(v)}`;
}

export function RdcDirectory({ rdcs }: { rdcs: Rdc[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>(ALL);

  const ordered = useMemo(
    () =>
      [...rdcs].sort((a, b) => regionNumber(a.region) - regionNumber(b.region)),
    [rdcs],
  );

  const regionOptions = useMemo(
    () =>
      ordered.map((r) => ({ value: r.region, name: r.name })),
    [ordered],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ordered.filter((r) => {
      const matchesRegion = region === ALL || r.region === region;
      if (!matchesRegion) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.council.toLowerCase().includes(q) ||
        r.officials.some(
          (o) =>
            o.name.toLowerCase().includes(q) ||
            o.role.toLowerCase().includes(q),
        )
      );
    });
  }, [ordered, query, region]);

  const hasFilters = query.trim() !== "" || region !== ALL;

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
            <div className="space-y-1.5">
              <Label htmlFor="rdc-search" className="text-sm font-semibold">
                Search councils
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="rdc-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by region, council or official…"
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

            <div className="space-y-1.5">
              <Label htmlFor="rdc-region" className="text-sm font-semibold">
                Filter by region
              </Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger
                  id="rdc-region"
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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
              <span className="font-semibold text-foreground">{ordered.length}</span> councils
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
        <Reveal className="mt-10">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-secondary/30 px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand-600">
              <Search className="size-6" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-bold">No councils found</h3>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              {query.trim()
                ? `We couldn't find any council matching “${query.trim()}”.`
                : "No councils match the selected filters."}
            </p>
            <Button
              onClick={clearFilters}
              className="mt-5 bg-brand-600 text-white hover:bg-brand-700"
            >
              Reset filters
            </Button>
          </div>
        </Reveal>
      ) : (
        <ul className="mt-10 grid gap-6 lg:grid-cols-2">
          {filtered.map((r, i) => (
            <Reveal as="li" key={r.region} delay={(i % 2) * 0.05}>
              <RdcCard rdc={r} />
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}

function RdcCard({ rdc }: { rdc: Rdc }) {
  const fb = rdc.facebook ? facebookHref(rdc.facebook) : null;
  const hasLinks = Boolean(fb || rdc.website);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:border-brand/40 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b bg-secondary/30 p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
            <Landmark className="size-6" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold leading-snug">{rdc.name}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{rdc.council}</p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0 rounded-full">
          {rdc.region}
        </Badge>
      </div>

      {/* Officials */}
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
          Regional officials
        </p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {rdc.officials.map((o) => (
            <li key={`${o.role}-${o.name}`} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <UserRound className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{o.role}</span>
                <span className="block font-medium leading-snug">{o.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div className="mt-auto border-t p-6">
        <dl className="space-y-2.5 text-sm">
          {rdc.address && (
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
              <dd>{rdc.address}</dd>
            </div>
          )}
          {rdc.phone && (
            <div className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand-600" />
              <dd>{rdc.phone}</dd>
            </div>
          )}
          {rdc.email && (
            <div className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-600" />
              <dd className="break-all">
                {rdc.email.split(/\s+/).filter(Boolean).map((addr, idx, arr) => (
                  <span key={addr}>
                    <a
                      href={`mailto:${addr}`}
                      className="text-brand-600 hover:underline"
                    >
                      {addr}
                    </a>
                    {idx < arr.length - 1 ? ", " : ""}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>

        {hasLinks && (
          <div className="mt-4 flex flex-wrap gap-2">
            {fb && (
              <a
                href={fb}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
              >
                <Share2 className="size-3.5 text-brand-600" /> Facebook
              </a>
            )}
            {rdc.website && (
              <a
                href={websiteHref(rdc.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
              >
                <Globe className="size-3.5 text-brand-600" /> Website
                <ExternalLink className="size-3 text-muted-foreground" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
