"use client";

/**
 * Portal Updates ("What's New at the Ministry") — full CRUD on data.updates.*.
 *
 * Entries render in a shadcn studio animated list; create/edit happens in a
 * studio dialog with a repeatable "sections" editor (each section has a tone,
 * a title and a multiline items list). The `icon` field is a lucide icon NAME
 * picked from the known set (resolved to a component on the public site via
 * updateIcon()). Wired to the data layer, so admin edits reflect publicly.
 */
import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Megaphone,
  Loader2,
  GripVertical,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import type {
  NewPortalUpdate,
  PortalUpdate,
  PortalUpdateSection,
  PortalUpdateTone,
} from "@/lib/data/types";
import {
  UpdateIcon,
  updateIconNames,
  updateToneClasses,
  updateToneLabels,
} from "@/data/portal-updates";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatedList } from "@/components/ui/animated-list";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Field, LoadingState, EmptyState } from "@/components/admin/shared";

const TONES: PortalUpdateTone[] = ["new", "improved", "notice", "fixed"];

/** Sections are edited with items as a newline-joined string for ergonomics. */
type DraftSection = {
  type: PortalUpdateTone;
  title: string;
  itemsText: string;
};

type Draft = {
  version: string;
  date: string;
  title: string;
  summary: string;
  icon: string;
  order: number;
  sections: DraftSection[];
};

function emptyDraft(order: number): Draft {
  return {
    version: "",
    date: "",
    title: "",
    summary: "",
    icon: updateIconNames[0] ?? "Megaphone",
    order,
    sections: [{ type: "new", title: "", itemsText: "" }],
  };
}

function toDraft(u: PortalUpdate): Draft {
  return {
    version: u.version,
    date: u.date,
    title: u.title,
    summary: u.summary,
    icon: u.icon,
    order: u.order,
    sections: (u.sections.length
      ? u.sections
      : ([{ type: "new", title: "", items: [] }] as PortalUpdateSection[])
    ).map((s) => ({ type: s.type, title: s.title, itemsText: s.items.join("\n") })),
  };
}

function toPayload(draft: Draft): NewPortalUpdate {
  const sections: PortalUpdateSection[] = draft.sections
    .map((s) => ({
      type: s.type,
      title: s.title.trim(),
      items: s.itemsText
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean),
    }))
    .filter((s) => s.title || s.items.length);
  return {
    version: draft.version.trim(),
    date: draft.date.trim(),
    title: draft.title.trim(),
    summary: draft.summary.trim(),
    icon: draft.icon,
    order: Number.isFinite(draft.order) ? draft.order : 0,
    sections,
  };
}

export function UpdatesSection() {
  const [updates, setUpdates] = React.useState<PortalUpdate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PortalUpdate | null>(null);
  const [draft, setDraft] = React.useState<Draft>(() => emptyDraft(0));
  const [busy, setBusy] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<PortalUpdate | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const list = await data.updates.list();
      setUpdates(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load updates.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // One-time load on mount; refresh() owns its own loading/state updates.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  function openCreate() {
    setEditing(null);
    const nextOrder = updates.length
      ? Math.max(...updates.map((u) => u.order)) + 1
      : 0;
    setDraft(emptyDraft(nextOrder));
    setEditorOpen(true);
  }

  function openEdit(u: PortalUpdate) {
    setEditing(u);
    setDraft(toDraft(u));
    setEditorOpen(true);
  }

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function patchSection(index: number, p: Partial<DraftSection>) {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === index ? { ...s, ...p } : s)),
    }));
  }

  function addSection() {
    setDraft((d) => ({
      ...d,
      sections: [...d.sections, { type: "improved", title: "", itemsText: "" }],
    }));
  }

  function removeSection(index: number) {
    setDraft((d) => ({
      ...d,
      sections: d.sections.filter((_, i) => i !== index),
    }));
  }

  async function save() {
    if (!draft.title.trim()) {
      toast.error("A title is required.");
      return;
    }
    if (!draft.version.trim() || !draft.date.trim()) {
      toast.error("Version and date are required.");
      return;
    }
    setBusy(true);
    try {
      const payload = toPayload(draft);
      if (editing) {
        await data.updates.update(editing.id, payload);
        toast.success("Update saved.");
      } else {
        await data.updates.create(payload);
        toast.success("Update created.");
      }
      setEditorOpen(false);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save update.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await data.updates.remove(deleteTarget.id);
      toast.success("Update deleted.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete update.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">
            Portal updates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the public &ldquo;What&apos;s New at the Ministry&rdquo;
            changelog. Edits reflect on the portal&apos;s Updates page.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="size-4" /> New update
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Loading updates…" />
      ) : updates.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No updates yet"
          description="Create your first portal update to publish it to the public Updates page."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" /> New update
            </Button>
          }
        />
      ) : (
        <AnimatedList className="flex flex-col gap-3">
          {updates.map((u) => (
            <UpdateRow
              key={u.id}
              update={u}
              onEdit={() => openEdit(u)}
              onDelete={() => setDeleteTarget(u)}
            />
          ))}
        </AnimatedList>
      )}

      {/* Editor dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit update" : "New update"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this portal changelog entry."
                : "Add a portal changelog entry shown on the public Updates page."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Field label="Title" htmlFor="update-title">
              <Input
                id="update-title"
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Headline of the update"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Version" htmlFor="update-version" hint="e.g. 2026.2">
                <Input
                  id="update-version"
                  value={draft.version}
                  onChange={(e) => patch({ version: e.target.value })}
                  placeholder="2026.2"
                />
              </Field>
              <Field label="Date" htmlFor="update-date" hint="Display text, e.g. June 2026">
                <Input
                  id="update-date"
                  value={draft.date}
                  onChange={(e) => patch({ date: e.target.value })}
                  placeholder="June 2026"
                />
              </Field>
              <Field label="Order" htmlFor="update-order" hint="Lower shows first.">
                <Input
                  id="update-order"
                  type="number"
                  value={draft.order}
                  onChange={(e) => patch({ order: Number(e.target.value) })}
                />
              </Field>
            </div>

            <Field label="Icon" htmlFor="update-icon" hint="Lucide icon shown beside the title.">
              <Select value={draft.icon} onValueChange={(v) => patch({ icon: v })}>
                <SelectTrigger id="update-icon" className="w-full">
                  <SelectValue placeholder="Icon" />
                </SelectTrigger>
                <SelectContent>
                  {updateIconNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      <span className="flex items-center gap-2">
                        <UpdateIcon name={name} className="size-4" />
                        {name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Summary" htmlFor="update-summary" hint="One or two sentences shown under the title.">
              <Textarea
                id="update-summary"
                value={draft.summary}
                onChange={(e) => patch({ summary: e.target.value })}
                rows={2}
                placeholder="Short summary of what changed."
              />
            </Field>

            {/* Repeatable sections editor */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Sections</p>
                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                  <Plus className="size-3.5" /> Add section
                </Button>
              </div>

              {draft.sections.length === 0 && (
                <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-4 text-center text-sm text-muted-foreground">
                  No sections yet. Add one to group bullet points by tone.
                </p>
              )}

              {draft.sections.map((section, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex size-6 items-center justify-center text-muted-foreground">
                      <GripVertical className="size-4" />
                    </span>
                    <Select
                      value={section.type}
                      onValueChange={(v) =>
                        patchSection(index, { type: v as PortalUpdateTone })
                      }
                    >
                      <SelectTrigger className="w-[140px]" aria-label="Section tone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {updateToneLabels[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Badge
                      className={cn(
                        "h-6 rounded-sm border font-medium",
                        updateToneClasses[section.type],
                      )}
                    >
                      {updateToneLabels[section.type]}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove section"
                      className="ml-auto text-destructive hover:text-destructive"
                      onClick={() => removeSection(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <Field label="Section title" htmlFor={`section-title-${index}`}>
                    <Input
                      id={`section-title-${index}`}
                      value={section.title}
                      onChange={(e) => patchSection(index, { title: e.target.value })}
                      placeholder="e.g. Public service journey"
                    />
                  </Field>

                  <Field
                    label="Items"
                    htmlFor={`section-items-${index}`}
                    hint="One bullet per line."
                  >
                    <Textarea
                      id={`section-items-${index}`}
                      value={section.itemsText}
                      onChange={(e) =>
                        patchSection(index, { itemsText: e.target.value })
                      }
                      rows={4}
                      placeholder={"First improvement…\nSecond improvement…"}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditorOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Create update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this update?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" (${deleteTarget.version}) will be permanently removed.`
            : undefined
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function UpdateRow({
  update,
  onEdit,
  onDelete,
}: {
  update: PortalUpdate;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex items-start gap-4 p-4 transition-shadow hover:border-gold/40 hover:shadow-md">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-700 ring-1 ring-brand/10">
        <UpdateIcon name={update.icon} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-sm bg-brand-600 text-white hover:bg-brand-600">
            {update.version}
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">
            {update.date}
          </span>
        </div>
        <h3 className="mt-1.5 truncate font-heading text-base font-bold leading-snug">
          {update.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {update.summary}
        </p>
        {update.sections.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {update.sections.map((s, i) => (
              <Badge
                key={`${s.title}-${i}`}
                className={cn(
                  "h-5 rounded-sm border text-[11px] font-medium",
                  updateToneClasses[s.type],
                )}
              >
                {updateToneLabels[s.type]} · {s.items.length}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Edit update"
          onClick={onEdit}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete update"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </Card>
  );
}
