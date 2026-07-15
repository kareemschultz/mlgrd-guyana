"use client";

/**
 * Procurement Notices — tender/bid notices (Invitation for Bids, RFQ, RFP, EOI)
 * posted by the Procurement department. Available to 'admin' and 'procurement'
 * roles only. Open/Closed status is derived from the closing date, not stored.
 */
import * as React from "react";
import { Plus, Pencil, Trash2, FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import type {
  NewProcurementNotice,
  ProcurementNotice,
  ProcurementNoticeType,
} from "@/lib/data/types";
import { Button } from "@/components/ui/button";
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
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import {
  Field,
  DocumentUpload,
  LoadingState,
  EmptyState,
} from "@/components/admin/shared";

const NOTICE_TYPES: { value: ProcurementNoticeType; label: string }[] = [
  { value: "ifb", label: "Invitation for Bids (IFB)" },
  { value: "rfq", label: "Request for Quotations (RFQ)" },
  { value: "rfp", label: "Request for Proposals (RFP)" },
  { value: "eoi", label: "Expression of Interest (EOI)" },
];

function noticeTypeLabel(t: ProcurementNoticeType): string {
  return NOTICE_TYPES.find((n) => n.value === t)?.label ?? t.toUpperCase();
}

function isOpen(closingAt: string): boolean {
  const d = new Date(closingAt);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function emptyDraft(): NewProcurementNotice {
  const closing = new Date();
  closing.setDate(closing.getDate() + 14);
  return {
    title: "",
    refNo: "",
    noticeType: "ifb",
    summary: "",
    closingAt: closing.toISOString().slice(0, 16),
    documentName: "",
    documentDataUrl: "",
  };
}

export function ProcurementSection({
  notices,
  onChange,
  loading,
}: {
  notices: ProcurementNotice[];
  onChange: () => Promise<void> | void;
  loading: boolean;
}) {
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProcurementNotice | null>(null);
  const [draft, setDraft] = React.useState<NewProcurementNotice>(() => emptyDraft());
  const [busy, setBusy] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<ProcurementNotice | null>(null);

  const sorted = React.useMemo(
    () =>
      [...notices].sort((a, b) => {
        const aOpen = isOpen(a.closingAt);
        const bOpen = isOpen(b.closingAt);
        if (aOpen !== bOpen) return aOpen ? -1 : 1;
        return a.closingAt.localeCompare(b.closingAt);
      }),
    [notices],
  );

  function openCreate() {
    setEditing(null);
    setDraft(emptyDraft());
    setEditorOpen(true);
  }

  function openEdit(n: ProcurementNotice) {
    setEditing(n);
    setDraft({
      title: n.title,
      refNo: n.refNo ?? "",
      noticeType: n.noticeType,
      summary: n.summary,
      closingAt: n.closingAt.slice(0, 16),
      documentName: n.documentName ?? "",
      documentDataUrl: n.documentDataUrl ?? "",
    });
    setEditorOpen(true);
  }

  function patch(p: Partial<NewProcurementNotice>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    if (!draft.title.trim()) return toast.error("A title is required.");
    if (!draft.closingAt) return toast.error("A closing date is required.");
    setBusy(true);
    try {
      const payload: NewProcurementNotice = {
        ...draft,
        closingAt: new Date(draft.closingAt).toISOString(),
        refNo: draft.refNo || undefined,
        documentName: draft.documentName || undefined,
        documentDataUrl: draft.documentDataUrl || undefined,
      };
      if (editing) {
        await data.procurementNotices.update(editing.id, payload);
        toast.success("Notice updated.");
      } else {
        await data.procurementNotices.create(payload);
        toast.success("Notice posted.");
      }
      setEditorOpen(false);
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save notice.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await data.procurementNotices.remove(deleteTarget.id);
      toast.success("Notice deleted.");
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete notice.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">
            Procurement Notices
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Post tender and bid notices for the public Procurement Notices page.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0 bg-brand-600 hover:bg-brand-700">
          <Plus className="size-4" /> Post notice
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Loading notices…" />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No procurement notices yet"
          description="Post the first tender or bid notice."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Post notice
            </Button>
          }
        />
      ) : (
        <ul className="divide-y rounded-xl border">
          {sorted.map((n) => {
            const open = isOpen(n.closingAt);
            return (
              <li key={n.id} className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium leading-tight">{n.title}</p>
                    <Badge
                      variant="outline"
                      className={
                        open
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-700"
                          : "border-border bg-secondary text-muted-foreground"
                      }
                    >
                      {open ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {noticeTypeLabel(n.noticeType)}
                    {n.refNo ? ` · ${n.refNo}` : ""} · Closes {formatDateTime(n.closingAt)}
                  </p>
                  {n.summary && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {n.summary}
                    </p>
                  )}
                  {n.documentDataUrl && (
                    <a
                      href={n.documentDataUrl}
                      download={n.documentName || "notice-document"}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline"
                    >
                      <Download className="size-3.5" /> {n.documentName || "Attached document"}
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit notice"
                    onClick={() => openEdit(n)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete notice"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(n)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit notice" : "Post a procurement notice"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this notice."
                : "This will appear on the public Procurement Notices page."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Field label="Title" htmlFor="pn-title">
              <Input
                id="pn-title"
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Supply and Delivery of New Compost Bins"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Notice type" htmlFor="pn-type">
                <Select
                  value={draft.noticeType}
                  onValueChange={(v) => patch({ noticeType: v as ProcurementNoticeType })}
                >
                  <SelectTrigger id="pn-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTICE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Reference number (optional)" htmlFor="pn-ref">
                <Input
                  id="pn-ref"
                  value={draft.refNo ?? ""}
                  onChange={(e) => patch({ refNo: e.target.value })}
                  placeholder="MLGRD/PROC/2026/001"
                />
              </Field>
            </div>
            <Field label="Closing date & time" htmlFor="pn-closing">
              <Input
                id="pn-closing"
                type="datetime-local"
                value={draft.closingAt}
                onChange={(e) => patch({ closingAt: e.target.value })}
              />
            </Field>
            <Field label="Summary" htmlFor="pn-summary">
              <Textarea
                id="pn-summary"
                value={draft.summary}
                onChange={(e) => patch({ summary: e.target.value })}
                rows={3}
                placeholder="Short description of what's being procured."
              />
            </Field>
            <DocumentUpload
              id="pn-document"
              label="Notice document (PDF or Word, up to 5MB)"
              value={draft.documentDataUrl}
              valueName={draft.documentName}
              onChange={(url, name) => patch({ documentDataUrl: url, documentName: name })}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy} className="bg-brand-600 hover:bg-brand-700">
              {busy && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Post notice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this notice?"
        description={
          deleteTarget ? `"${deleteTarget.title}" will be permanently removed.` : undefined
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}
