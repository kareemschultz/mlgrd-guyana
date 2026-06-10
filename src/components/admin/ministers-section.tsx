"use client";

/**
 * Ministers — card grid of ministers/officials with add/edit dialog (portrait,
 * current toggle, term dates) and confirm-delete. Wired to data.ministers.*.
 */
import * as React from "react";
import { Plus, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import type { Minister, NewMinister } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import {
  Field,
  ImageUpload,
  LoadingState,
  EmptyState,
} from "@/components/admin/shared";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function emptyDraft(nextOrder: number): NewMinister {
  return {
    name: "",
    title: "",
    portrait: "",
    initials: "",
    bio: "",
    termStart: "",
    termEnd: "",
    current: true,
    order: nextOrder,
  };
}

export function MinistersSection({
  ministers,
  onChange,
  loading,
}: {
  ministers: Minister[];
  onChange: () => Promise<void> | void;
  loading: boolean;
}) {
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Minister | null>(null);
  const [draft, setDraft] = React.useState<NewMinister>(() => emptyDraft(0));
  const [busy, setBusy] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Minister | null>(null);

  function openCreate() {
    setEditing(null);
    setDraft(emptyDraft(ministers.length));
    setEditorOpen(true);
  }

  function openEdit(m: Minister) {
    setEditing(m);
    setDraft({
      name: m.name,
      title: m.title,
      portrait: m.portrait ?? "",
      initials: m.initials ?? "",
      bio: m.bio ?? "",
      termStart: m.termStart ?? "",
      termEnd: m.termEnd ?? "",
      current: m.current,
      order: m.order,
    });
    setEditorOpen(true);
  }

  function patch(p: Partial<NewMinister>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    if (!draft.name.trim()) {
      toast.error("A name is required.");
      return;
    }
    setBusy(true);
    try {
      const payload: NewMinister = {
        ...draft,
        initials: (draft.initials || initialsOf(draft.name)).toUpperCase(),
        portrait: draft.portrait || undefined,
        bio: draft.bio || undefined,
        termStart: draft.termStart || undefined,
        termEnd: draft.termEnd || undefined,
        order: Number(draft.order) || 0,
      };
      if (editing) {
        await data.ministers.update(editing.id, payload);
        toast.success("Profile updated.");
      } else {
        await data.ministers.create(payload);
        toast.success("Profile added.");
      }
      setEditorOpen(false);
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await data.ministers.remove(deleteTarget.id);
      toast.success("Profile deleted.");
      await onChange();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete profile.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">
            Ministers &amp; officials
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the profiles shown on the Minister&apos;s Desk.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="size-4" /> Add profile
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Loading profiles…" />
      ) : ministers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No profiles yet"
          description="Add a minister or senior official profile."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Add profile
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ministers.map((m) => (
            <Card key={m.id} className="gap-4 p-5">
              <div className="flex items-start gap-3">
                <Avatar className="size-14 rounded-xl">
                  {m.portrait && <AvatarImage src={m.portrait} alt={m.name} />}
                  <AvatarFallback className="rounded-xl bg-ink text-base font-semibold text-white">
                    {m.initials || initialsOf(m.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-tight">
                    {m.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {m.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {m.current ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700">
                        Current
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground">
                        Former
                      </Badge>
                    )}
                    {(m.termStart || m.termEnd) && (
                      <span className="text-xs text-muted-foreground">
                        {m.termStart || "?"} – {m.termEnd || "present"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {m.bio && (
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {m.bio}
                </p>
              )}
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit profile"
                  onClick={() => openEdit(m)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete profile"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(m)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit profile" : "Add profile"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this profile."
                : "Add a minister or official profile."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="min-name">
                <Input
                  id="min-name"
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="The Hon. …"
                />
              </Field>
              <Field label="Title" htmlFor="min-title">
                <Input
                  id="min-title"
                  value={draft.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="Minister / Permanent Secretary"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Initials" htmlFor="min-initials" hint="Fallback when no portrait.">
                <Input
                  id="min-initials"
                  value={draft.initials ?? ""}
                  maxLength={3}
                  onChange={(e) =>
                    patch({ initials: e.target.value.toUpperCase() })
                  }
                  placeholder={initialsOf(draft.name) || "HM"}
                />
              </Field>
              <Field label="Term start" htmlFor="min-term-start">
                <Input
                  id="min-term-start"
                  value={draft.termStart ?? ""}
                  onChange={(e) => patch({ termStart: e.target.value })}
                  placeholder="2020"
                />
              </Field>
              <Field label="Term end" htmlFor="min-term-end">
                <Input
                  id="min-term-end"
                  value={draft.termEnd ?? ""}
                  onChange={(e) => patch({ termEnd: e.target.value })}
                  placeholder="present"
                />
              </Field>
            </div>

            <Field label="Biography" htmlFor="min-bio">
              <Textarea
                id="min-bio"
                value={draft.bio ?? ""}
                onChange={(e) => patch({ bio: e.target.value })}
                rows={4}
                placeholder="Short biography."
              />
            </Field>

            <div className="grid items-end gap-4 sm:grid-cols-2">
              <Field label="Order" htmlFor="min-order">
                <Input
                  id="min-order"
                  type="number"
                  value={draft.order}
                  onChange={(e) => patch({ order: Number(e.target.value) })}
                />
              </Field>
              <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-brand-600"
                  checked={draft.current}
                  onChange={(e) => patch({ current: e.target.checked })}
                />
                Currently serving
              </label>
            </div>

            <ImageUpload
              id="min-portrait"
              label="Portrait (optional)"
              value={draft.portrait}
              onChange={(url) => patch({ portrait: url })}
              shape="portrait"
            />
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
              {editing ? "Save changes" : "Add profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this profile?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will be permanently removed.`
            : undefined
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}
