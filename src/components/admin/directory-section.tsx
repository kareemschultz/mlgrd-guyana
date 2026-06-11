"use client";

/**
 * Directories — browse, search AND manage the full local-government directory
 * (NDC / RDC / Municipality / CDC). Filter by kind, region and free text;
 * add / edit / delete councils and their officials. Wired to data.directory.*.
 *
 * Sensitive fields (personal mobile numbers, personal emails, internal notes)
 * are for official use only and are never shown on the public website.
 */
import * as React from "react";
import { toast } from "sonner";
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
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import { data } from "@/lib/data/client";
import { regionSelectOptions, regionNameFor } from "@/lib/site";
import type {
  DirectoryEntry,
  DirectoryKind,
  DirectoryOfficial,
  NewDirectoryEntry,
} from "@/lib/data/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, LoadingState, EmptyState, IconAction } from "@/components/admin/shared";
import { ConfirmDelete } from "@/components/admin/confirm-delete";

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

type Draft = {
  kind: DirectoryKind;
  region: string;
  regionName: string;
  name: string;
  council: string;
  status: string;
  officeAddress: string;
  officePhone: string;
  email: string;
  facebook: string;
  website: string;
  comments: string;
  officials: DirectoryOfficial[];
};

const EMPTY: Draft = {
  kind: "ndc",
  region: "",
  regionName: "",
  name: "",
  council: "",
  status: "",
  officeAddress: "",
  officePhone: "",
  email: "",
  facebook: "",
  website: "",
  comments: "",
  officials: [],
};

function toDraft(e: DirectoryEntry): Draft {
  return {
    kind: e.kind,
    region: e.region ?? "",
    regionName: e.regionName ?? "",
    name: e.name ?? "",
    council: e.council ?? "",
    status: e.status ?? "",
    officeAddress: e.officeAddress ?? "",
    officePhone: e.officePhone ?? "",
    email: e.email ?? "",
    facebook: e.facebook ?? "",
    website: e.website ?? "",
    comments: e.comments ?? "",
    officials: e.officials.map((o) => ({ ...o })),
  };
}

/** Strip blank optional fields/officials into a write-safe payload. */
function toPayload(d: Draft): NewDirectoryEntry {
  const opt = (v: string) => (v.trim() ? v.trim() : undefined);
  return {
    kind: d.kind,
    region: d.region.trim(),
    regionName: opt(d.regionName),
    name: d.name.trim(),
    council: opt(d.council),
    status: opt(d.status),
    officeAddress: opt(d.officeAddress),
    officePhone: opt(d.officePhone),
    email: opt(d.email),
    facebook: opt(d.facebook),
    website: opt(d.website),
    comments: opt(d.comments),
    officials: d.officials
      .filter((o) => o.role.trim() || o.name.trim())
      .map((o) => ({
        role: o.role.trim(),
        name: o.name.trim(),
        officePhone: o.officePhone?.trim() || undefined,
        personalPhone: o.personalPhone?.trim() || undefined,
        email: o.email?.trim() || undefined,
      })),
  };
}

export function DirectorySection() {
  const [entries, setEntries] = React.useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [kind, setKind] = React.useState<"all" | DirectoryKind>("all");
  const [region, setRegion] = React.useState<string>(ALL);
  const [page, setPage] = React.useState(1);

  const [editing, setEditing] = React.useState<DirectoryEntry | "new" | null>(null);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);
  const [saving, setSaving] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<DirectoryEntry | null>(null);

  const load = React.useCallback(async () => {
    try {
      setEntries(await data.directory.list());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load the directory.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

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

  function openCreate() {
    setDraft(EMPTY);
    setEditing("new");
  }
  function openEdit(e: DirectoryEntry) {
    setDraft(toDraft(e));
    setEditing(e);
  }

  // Officials sub-editor helpers.
  const setOfficial = (i: number, patch: Partial<DirectoryOfficial>) =>
    setDraft((d) => ({
      ...d,
      officials: d.officials.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    }));
  const addOfficial = () =>
    setDraft((d) => ({ ...d, officials: [...d.officials, { role: "", name: "" }] }));
  const removeOfficial = (i: number) =>
    setDraft((d) => ({ ...d, officials: d.officials.filter((_, idx) => idx !== i) }));

  async function save() {
    if (!draft.name.trim()) return toast.error("Name is required.");
    if (!draft.region.trim()) return toast.error("Region is required (e.g. Region 4).");
    setSaving(true);
    try {
      const payload = toPayload(draft);
      if (editing === "new") {
        await data.directory.create(payload);
        toast.success("Directory entry added.");
      } else if (editing) {
        await data.directory.update(editing.id, payload);
        toast.success("Directory entry updated.");
      }
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">
            Directories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse, search and manage the local-government directory — councils,
            municipalities and their officials.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-brand-600 hover:bg-brand-700">
          <Plus className="size-4" /> Add entry
        </Button>
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
          description="Add the first council or office."
          action={
            <Button variant="outline" size="sm" onClick={openCreate}>
              <Plus className="size-4" /> Add entry
            </Button>
          }
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
              <EntryCard
                key={e.id}
                entry={e}
                onEdit={() => openEdit(e)}
                onDelete={() => setToDelete(e)}
              />
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

      {/* ── Editor ── */}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing === "new" ? "Add directory entry" : "Edit directory entry"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor="d-kind">
              <Select value={draft.kind} onValueChange={(v) => setDraft((d) => ({ ...d, kind: v as DirectoryKind }))}>
                <SelectTrigger id="d-kind" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ndc">NDC</SelectItem>
                  <SelectItem value="rdc">RDC</SelectItem>
                  <SelectItem value="municipality">Municipality</SelectItem>
                  <SelectItem value="cdc">CDC</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Name" htmlFor="d-name">
              <Input id="d-name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Hyde Park / Mocha" />
            </Field>
            <Field label="Region" htmlFor="d-region">
              <Select
                value={draft.region || undefined}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, region: v, regionName: regionNameFor(v) }))
                }
              >
                <SelectTrigger id="d-region" className="w-full">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {regionSelectOptions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Council (optional)" htmlFor="d-council">
              <Input id="d-council" value={draft.council} onChange={(e) => setDraft((d) => ({ ...d, council: e.target.value }))} />
            </Field>
            {draft.kind === "cdc" && (
              <Field label="Status" htmlFor="d-status">
                <Select
                  value={draft.status || undefined}
                  onValueChange={(v) => setDraft((d) => ({ ...d, status: v }))}
                >
                  <SelectTrigger id="d-status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field label="Office phone (optional)" htmlFor="d-ophone">
              <Input id="d-ophone" value={draft.officePhone} onChange={(e) => setDraft((d) => ({ ...d, officePhone: e.target.value }))} />
            </Field>
            <Field label="Office email (optional)" htmlFor="d-email">
              <Input id="d-email" type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
            </Field>
            <Field label="Office address (optional)" htmlFor="d-addr" className="sm:col-span-2">
              <Input id="d-addr" value={draft.officeAddress} onChange={(e) => setDraft((d) => ({ ...d, officeAddress: e.target.value }))} />
            </Field>
            <Field label="Facebook (optional)" htmlFor="d-fb">
              <Input id="d-fb" value={draft.facebook} onChange={(e) => setDraft((d) => ({ ...d, facebook: e.target.value }))} />
            </Field>
            <Field label="Website (optional)" htmlFor="d-web">
              <Input id="d-web" value={draft.website} onChange={(e) => setDraft((d) => ({ ...d, website: e.target.value }))} />
            </Field>
          </div>

          {/* Officials sub-editor */}
          <div className="mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Officials</p>
              <Button variant="outline" size="sm" onClick={addOfficial}>
                <Plus className="size-3.5" /> Add official
              </Button>
            </div>
            {draft.officials.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                No officials yet. Add the chairperson, overseer, councillors, etc.
              </p>
            ) : (
              <div className="space-y-3">
                {draft.officials.map((o, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Official {i + 1}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeOfficial(i)} aria-label="Remove official" className="size-7 text-destructive hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input value={o.role} onChange={(e) => setOfficial(i, { role: e.target.value })} placeholder="Role (e.g. Chairperson)" />
                      <Input value={o.name} onChange={(e) => setOfficial(i, { name: e.target.value })} placeholder="Full name" />
                      <Input value={o.officePhone ?? ""} onChange={(e) => setOfficial(i, { officePhone: e.target.value })} placeholder="Office phone" />
                      <Input value={o.personalPhone ?? ""} onChange={(e) => setOfficial(i, { personalPhone: e.target.value })} placeholder="Personal mobile (confidential)" />
                      <Input value={o.email ?? ""} onChange={(e) => setOfficial(i, { email: e.target.value })} placeholder="Email (confidential)" className="sm:col-span-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Field label="Internal notes (optional, confidential)" htmlFor="d-comments" className="mt-2">
            <Textarea id="d-comments" value={draft.comments} onChange={(e) => setDraft((d) => ({ ...d, comments: e.target.value }))} rows={2} />
          </Field>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-brand-600 hover:bg-brand-700">
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Delete ${toDelete?.name ?? "this entry"}?`}
        description="This removes the council/office and its officials from the directory."
        onConfirm={async () => {
          if (toDelete) {
            try {
              await data.directory.remove(toDelete.id);
              toast.success("Directory entry deleted.");
              await load();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not delete.");
            }
          }
          setToDelete(null);
        }}
      />
    </div>
  );
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: DirectoryEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
        <div className="flex shrink-0 items-start gap-1">
          <div className="flex flex-col items-end gap-1.5">
            <KindBadge kind={entry.kind} />
            <Badge variant="secondary" className="rounded-full text-xs">
              {entry.region}
            </Badge>
          </div>
          <IconAction label="Edit" onClick={onEdit} className="size-8">
            <Pencil className="size-4" />
          </IconAction>
          <IconAction label="Delete" onClick={onDelete} className="size-8 text-destructive hover:text-destructive">
            <Trash2 className="size-4" />
          </IconAction>
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
