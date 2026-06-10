"use client";

/**
 * Gallery — responsive card grid of gallery items with add/edit dialog and
 * confirm-delete. Wired to data.gallery.* (real CRUD).
 */
import * as React from "react";
import { Plus, Pencil, Trash2, Images, Loader2, ImageOff } from "lucide-react";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import type { GalleryItem, NewGalleryItem } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  formatDate,
} from "@/components/admin/shared";

function emptyDraft(nextOrder: number): NewGalleryItem {
  return {
    title: "",
    caption: "",
    image: "",
    category: "Events",
    date: new Date().toISOString().slice(0, 10),
    order: nextOrder,
  };
}

const CATEGORIES = ["Events", "Community", "Capacity-building", "Minister"];

export function GallerySection({
  items,
  onChange,
  loading,
}: {
  items: GalleryItem[];
  onChange: () => Promise<void> | void;
  loading: boolean;
}) {
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GalleryItem | null>(null);
  const [draft, setDraft] = React.useState<NewGalleryItem>(() => emptyDraft(0));
  const [busy, setBusy] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<GalleryItem | null>(
    null,
  );

  function openCreate() {
    setEditing(null);
    setDraft(emptyDraft(items.length));
    setEditorOpen(true);
  }

  function openEdit(item: GalleryItem) {
    setEditing(item);
    setDraft({
      title: item.title,
      caption: item.caption ?? "",
      image: item.image,
      category: item.category ?? "Events",
      date: item.date ?? "",
      order: item.order,
    });
    setEditorOpen(true);
  }

  function patch(p: Partial<NewGalleryItem>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    if (!draft.title.trim()) {
      toast.error("A title is required.");
      return;
    }
    setBusy(true);
    try {
      const payload: NewGalleryItem = {
        ...draft,
        caption: draft.caption || undefined,
        category: draft.category || undefined,
        date: draft.date || undefined,
        order: Number(draft.order) || 0,
      };
      if (editing) {
        await data.gallery.update(editing.id, payload);
        toast.success("Gallery item updated.");
      } else {
        await data.gallery.create(payload);
        toast.success("Gallery item added.");
      }
      setEditorOpen(false);
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save item.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await data.gallery.remove(deleteTarget.id);
      toast.success("Gallery item deleted.");
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete item.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">
            Gallery
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the ministry photo gallery shown on the portal.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="size-4" /> Add photo
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Loading gallery…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No gallery items"
          description="Add your first photo to the ministry gallery."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Add photo
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              <div className="relative aspect-[16/10] w-full bg-muted">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <ImageOff className="size-7" />
                  </div>
                )}
                {item.category && (
                  <Badge className="absolute left-2 top-2 bg-ink/80 text-white backdrop-blur">
                    {item.category}
                  </Badge>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <p className="font-medium leading-tight">{item.title}</p>
                {item.caption && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {item.caption}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.date)} · #{item.order}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit item"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete item"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit gallery item" : "Add gallery item"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this photo."
                : "Add a photo to the ministry gallery."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Field label="Title" htmlFor="gal-title">
              <Input
                id="gal-title"
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Photo title"
              />
            </Field>
            <Field label="Caption" htmlFor="gal-caption">
              <Textarea
                id="gal-caption"
                value={draft.caption ?? ""}
                onChange={(e) => patch({ caption: e.target.value })}
                rows={2}
                placeholder="Short description of the photo."
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Category" htmlFor="gal-category" className="sm:col-span-1">
                <Input
                  id="gal-category"
                  list="gal-categories"
                  value={draft.category ?? ""}
                  onChange={(e) => patch({ category: e.target.value })}
                  placeholder="Events"
                />
                <datalist id="gal-categories">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Date" htmlFor="gal-date">
                <Input
                  id="gal-date"
                  type="date"
                  value={draft.date ?? ""}
                  onChange={(e) => patch({ date: e.target.value })}
                />
              </Field>
              <Field label="Order" htmlFor="gal-order">
                <Input
                  id="gal-order"
                  type="number"
                  value={draft.order}
                  onChange={(e) => patch({ order: Number(e.target.value) })}
                />
              </Field>
            </div>
            <ImageUpload
              id="gal-image"
              label="Image"
              value={draft.image}
              onChange={(url) => patch({ image: url })}
              shape="wide"
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
              {editing ? "Save changes" : "Add photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this photo?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed.`
            : undefined
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}
