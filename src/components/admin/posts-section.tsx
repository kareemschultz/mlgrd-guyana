"use client";

/**
 * Posts — studio datatable listing news posts with create/edit via a studio
 * dialog and confirm-delete. Wired to data.posts.* (real CRUD, no demo data).
 */
import * as React from "react";
import { Plus, Pencil, Trash2, Newspaper, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import type { NewPost, Post, PostStatus } from "@/lib/data/types";
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
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import {
  Field,
  ImageUpload,
  LoadingState,
  EmptyState,
  formatDate,
  slugify,
} from "@/components/admin/shared";

const CATEGORIES = [
  "Legislation",
  "Capacity-building",
  "Digital services",
  "Community development",
  "Announcements",
  "Events",
];

function emptyDraft(): NewPost {
  return {
    slug: "",
    title: "",
    excerpt: "",
    body: "",
    category: CATEGORIES[0],
    coverImage: "",
    status: "draft",
    date: new Date().toISOString().slice(0, 10),
  };
}

export function PostsSection({
  posts,
  onChange,
  loading,
}: {
  posts: Post[];
  onChange: () => Promise<void> | void;
  loading: boolean;
}) {
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Post | null>(null);
  const [draft, setDraft] = React.useState<NewPost>(emptyDraft);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Post | null>(null);

  function openCreate() {
    setEditing(null);
    setDraft(emptyDraft());
    setSlugTouched(false);
    setEditorOpen(true);
  }

  function openEdit(post: Post) {
    setEditing(post);
    setDraft({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      category: post.category,
      coverImage: post.coverImage ?? "",
      status: post.status,
      date: post.date,
    });
    setSlugTouched(true);
    setEditorOpen(true);
  }

  function patch(p: Partial<NewPost>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function onTitleChange(title: string) {
    patch({ title, ...(slugTouched ? {} : { slug: slugify(title) }) });
  }

  async function save() {
    if (!draft.title.trim()) {
      toast.error("A title is required.");
      return;
    }
    setBusy(true);
    try {
      const payload: NewPost = {
        ...draft,
        slug: draft.slug.trim() || slugify(draft.title),
        coverImage: draft.coverImage || undefined,
      };
      if (editing) {
        await data.posts.update(editing.id, payload);
        toast.success("Post updated.");
      } else {
        await data.posts.create(payload);
        toast.success("Post created.");
      }
      setEditorOpen(false);
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save post.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await data.posts.remove(deleteTarget.id);
      toast.success("Post deleted.");
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete post.");
    }
  }

  const columns: ColumnDef<Post, unknown>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="flex max-w-[28rem] flex-col">
          <span className="truncate font-medium text-card-foreground">
            {row.original.title}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            /{row.original.slug}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge className="bg-gold/15 text-[#8a6500]">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(row.original.date)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      size: 96,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Edit post"
            onClick={() => openEdit(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Delete post"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">
            News posts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish announcements and updates to the public portal.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="size-4" /> New post
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Loading posts…" />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No posts yet"
          description="Create your first news post to publish it to the portal."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" /> New post
            </Button>
          }
        />
      ) : (
        <Card className="py-0">
          <DataTable columns={columns} data={posts} emptyLabel="No posts." />
        </Card>
      )}

      {/* Editor dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit post" : "New post"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this news post."
                : "Add a news post to the portal."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Field label="Title" htmlFor="post-title">
              <Input
                id="post-title"
                value={draft.title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Headline of the announcement"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug" htmlFor="post-slug" hint="Used in the URL.">
                <Input
                  id="post-slug"
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    patch({ slug: e.target.value });
                  }}
                  placeholder="auto-generated-from-title"
                />
              </Field>
              <Field label="Date" htmlFor="post-date">
                <Input
                  id="post-date"
                  type="date"
                  value={draft.date}
                  onChange={(e) => patch({ date: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" htmlFor="post-category">
                <Select
                  value={draft.category}
                  onValueChange={(v) => patch({ category: v })}
                >
                  <SelectTrigger id="post-category" className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status" htmlFor="post-status">
                <Select
                  value={draft.status}
                  onValueChange={(v) => patch({ status: v as PostStatus })}
                >
                  <SelectTrigger id="post-status" className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Excerpt" htmlFor="post-excerpt" hint="Short summary shown in listings.">
              <Textarea
                id="post-excerpt"
                value={draft.excerpt}
                onChange={(e) => patch({ excerpt: e.target.value })}
                rows={2}
                placeholder="One or two sentence summary."
              />
            </Field>

            <Field label="Body" htmlFor="post-body" hint="Blank lines separate paragraphs.">
              <Textarea
                id="post-body"
                value={draft.body}
                onChange={(e) => patch({ body: e.target.value })}
                rows={6}
                placeholder="Full content of the post."
              />
            </Field>

            <ImageUpload
              id="post-cover"
              label="Cover image (optional)"
              value={draft.coverImage}
              onChange={(url) => patch({ coverImage: url })}
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
              {editing ? "Save changes" : "Create post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this post?"
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

function StatusBadge({ status }: { status: PostStatus }) {
  return status === "published" ? (
    <Badge className="bg-emerald-500/10 text-emerald-700">Published</Badge>
  ) : (
    <Badge className="bg-muted text-muted-foreground">Draft</Badge>
  );
}
