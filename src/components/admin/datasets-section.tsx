"use client";

/**
 * Generic admin manager for every registry dataset (schools, health centres,
 * villages, tenders, …). Pick a dataset, search/paginate its rows, and
 * create / edit / delete — all driven by the dataset registry, so no per-
 * dataset admin code is needed. Writes go through `data.datasets.*`
 * (localStorage in demo, D1 in live).
 */
import * as React from "react";
import { toast } from "sonner";
import { Database, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { datasets, getDataset } from "@/lib/data/datasets";
import type { DatasetColumn } from "@/lib/data/datasets";
import { regions } from "@/lib/site";
import { data } from "@/lib/data/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Field, LoadingState, EmptyState } from "@/components/admin/shared";
import { ConfirmDelete } from "@/components/admin/confirm-delete";

type Row = Record<string, unknown> & { id: string };
const PAGE = 12;
const REGION_NAMES = regions.map((r) => r.name);

function str(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

export function DatasetsSection() {
  const [kind, setKind] = React.useState<string>(datasets[0].key);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [editing, setEditing] = React.useState<Row | "new" | null>(null);
  const [draft, setDraft] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const def = getDataset(kind)!;
  const searchKeys = def.columns.filter((c) => c.searchable).map((c) => c.key);
  const primary = def.columns.find((c) => c.primary) ?? def.columns[0];

  const load = React.useCallback(async (k: string) => {
    setLoading(true);
    try {
      const list = (await data.datasets.list(k)) as Row[];
      setRows(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load records.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(kind);
  }, [kind, load]);

  function selectKind(k: string) {
    setKind(k);
    setPage(0);
    setQuery("");
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? rows.filter((r) => searchKeys.some((k) => str(r[k]).toLowerCase().includes(q)))
    : rows;

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pageCount - 1);
  const shown = filtered.slice(current * PAGE, current * PAGE + PAGE);

  function openCreate() {
    const d: Record<string, string> = {};
    for (const c of def.columns) d[c.key] = "";
    setDraft(d);
    setEditing("new");
  }
  function openEdit(row: Row) {
    const d: Record<string, string> = {};
    for (const c of def.columns) d[c.key] = str(row[c.key]);
    setDraft(d);
    setEditing(row);
  }

  async function save() {
    if (!draft[primary.key]?.trim()) {
      toast.error(`${primary.label} is required.`);
      return;
    }
    setSaving(true);
    try {
      // Coerce number columns; drop empty strings so blanks stay unset.
      const payload: Record<string, unknown> = {};
      for (const c of def.columns) {
        const v = draft[c.key];
        if (v === undefined || v === "") continue;
        payload[c.key] = c.type === "number" ? Number(v) : v;
      }
      if (editing === "new") {
        await data.datasets.create(kind, payload);
        toast.success(`${def.singular} added.`);
      } else if (editing) {
        await data.datasets.update(kind, editing.id, payload);
        toast.success(`${def.singular} updated.`);
      }
      setEditing(null);
      await load(kind);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await data.datasets.remove(kind, id);
    toast.success(`${def.singular} deleted.`);
    await load(kind);
  }

  return (
    <div className="space-y-5">
      {/* Dataset picker + add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Field label="Dataset" htmlFor="ds-kind">
            <Select value={kind} onValueChange={selectKind}>
              <SelectTrigger id="ds-kind" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((d) => (
                  <SelectItem key={d.key} value={d.key}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Button onClick={openCreate} className="bg-brand-600 hover:bg-brand-700">
          <Plus className="size-4" /> Add {def.singular.toLowerCase()}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder={`Search ${def.label.toLowerCase()}…`}
          className="pl-9"
        />
      </div>

      {loading ? (
        <LoadingState label={`Loading ${def.label.toLowerCase()}…`} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Database} title={`No ${def.label.toLowerCase()} yet`} description="Add the first record to get started." />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length.toLocaleString()} {filtered.length === 1 ? def.singular.toLowerCase() : def.label.toLowerCase()}
          </p>
          <ul className="divide-y rounded-xl border">
            {shown.map((row) => (
              <li key={row.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{str(row[primary.key]) || "—"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {def.columns
                      .filter((c) => !c.primary && str(row[c.key]))
                      .slice(0, 3)
                      .map((c) => str(row[c.key]))
                      .join(" · ")}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(row.id)}
                  aria-label="Delete"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>

          {pageCount > 1 && (
            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {current + 1} of {pageCount}
              </span>
              <Button variant="outline" size="sm" disabled={current >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Editor */}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing === "new" ? `Add ${def.singular.toLowerCase()}` : `Edit ${def.singular.toLowerCase()}`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {def.columns.map((c) => (
              <DatasetField
                key={c.key}
                col={c}
                value={draft[c.key] ?? ""}
                onChange={(v) => setDraft((d) => ({ ...d, [c.key]: v }))}
                options={c.key === def.regionField ? REGION_NAMES : undefined}
              />
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="bg-brand-600 hover:bg-brand-700">
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title={`Delete this ${def.singular.toLowerCase()}?`}
        onConfirm={async () => {
          if (deleteId) await remove(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}

function DatasetField({
  col,
  value,
  onChange,
  options,
}: {
  col: DatasetColumn;
  value: string;
  onChange: (v: string) => void;
  /** When present, the field is a strict dropdown (e.g. region). */
  options?: string[];
}) {
  const id = `ds-f-${col.key}`;
  const span = col.type === "textarea" ? "sm:col-span-2" : "";
  return (
    <Field
      label={col.sensitive ? `${col.label} (sensitive)` : col.label}
      htmlFor={id}
      className={span}
      hint={col.sensitive ? "Personal/sensitive — live mode only; never in public data." : undefined}
    >
      {options ? (
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder={`Select ${col.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : col.type === "textarea" ? (
        <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <Input
          id={id}
          type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}
