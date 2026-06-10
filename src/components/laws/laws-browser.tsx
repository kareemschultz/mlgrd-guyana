"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, ScrollText, FileText, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

type Law = {
  slug: string;
  title: string;
  chapter: string | null;
  year?: string;
  status: string;
  category: string;
  summary: string;
};

const CATEGORIES = ["All", "Act", "Draft Bill", "Draft Regulations"] as const;

const CATEGORY_ICON: Record<string, typeof ScrollText> = {
  Act: ScrollText,
  "Draft Bill": FileText,
  "Draft Regulations": BookOpen,
};

function StatusBadge({ status }: { status: string }) {
  const inForce = status === "In Force";
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5",
        inForce
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-amber-300 bg-amber-50 text-amber-700"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          inForce ? "bg-emerald-500" : "bg-amber-500"
        )}
      />
      {status}
    </Badge>
  );
}

export function LawsBrowser({ laws }: { laws: Law[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return laws.filter((law) => {
      const matchesQuery = q === "" || law.title.toLowerCase().includes(q);
      const matchesCategory = category === "All" || law.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [laws, query, category]);

  return (
    <div>
      {/* ───── Filter bar ───── */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title…"
              aria-label="Search laws and policies by title"
              className="h-10 pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              aria-label="Filter by category"
              className="h-10 w-full sm:w-56"
            >
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "All" ? "All categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
          {laws.length} {laws.length === 1 ? "entry" : "entries"}
          {category !== "All" && <> in {category}</>}
          {query.trim() !== "" && <> matching “{query.trim()}”</>}.
        </p>
      </div>

      {/* ───── Results ───── */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-secondary/30 p-12 text-center">
          <p className="font-heading text-lg font-semibold">No matching entries</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term or reset the category filter.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {filtered.map((law, i) => {
            const Icon = CATEGORY_ICON[law.category] ?? ScrollText;
            return (
              <Reveal key={law.slug} delay={(i % 2) * 0.05}>
                <Link
                  href={`/laws-policies/${law.slug}`}
                  className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand-600">
                      <Icon className="size-5" />
                    </div>
                    <StatusBadge status={law.status} />
                  </div>

                  <h2 className="mt-4 font-heading text-base font-bold leading-snug">
                    {law.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium text-brand-600">{law.category}</span>
                    {law.chapter && (
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground/50">•</span> Chapter {law.chapter}
                      </span>
                    )}
                    {law.year && (
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground/50">•</span> {law.year}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{law.summary}</p>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                    View entry{" "}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
