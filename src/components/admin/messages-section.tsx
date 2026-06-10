"use client";

/**
 * Messages — helpdesk + contact inbox as a studio datatable. Newest first,
 * filter by channel + status, colour-coded status badges, status workflow
 * (new → open → resolved) and delete. Wired to data.messages.*.
 */
import * as React from "react";
import {
  Trash2,
  Inbox,
  MailOpen,
  CheckCircle2,
  RotateCcw,
  Eye,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import type {
  Message,
  MessageChannel,
  MessageStatus,
} from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { LoadingState, EmptyState, formatDate } from "@/components/admin/shared";

const STATUS_STYLES: Record<MessageStatus, string> = {
  new: "bg-flag-red/10 text-[#a30d1d]",
  open: "bg-gold/15 text-[#8a6500]",
  resolved: "bg-emerald-500/10 text-emerald-700",
};

function StatusBadge({ status }: { status: MessageStatus }) {
  return (
    <Badge className={`${STATUS_STYLES[status]} capitalize`}>{status}</Badge>
  );
}

function ChannelBadge({ channel }: { channel: MessageChannel }) {
  return (
    <Badge className="bg-ink/10 text-ink capitalize">{channel}</Badge>
  );
}

export function MessagesSection({
  messages,
  onChange,
  loading,
}: {
  messages: Message[];
  onChange: () => Promise<void> | void;
  loading: boolean;
}) {
  const [channel, setChannel] = React.useState<"all" | MessageChannel>("all");
  const [status, setStatus] = React.useState<"all" | MessageStatus>("all");
  const [view, setView] = React.useState<Message | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Message | null>(null);

  // Backend already returns newest-first; re-sort defensively.
  const filtered = React.useMemo(
    () =>
      [...messages]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .filter((m) => channel === "all" || m.channel === channel)
        .filter((m) => status === "all" || m.status === status),
    [messages, channel, status],
  );

  async function setMessageStatus(id: string, next: MessageStatus) {
    try {
      await data.messages.update(id, { status: next });
      toast.success(`Marked as ${next}.`);
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await data.messages.remove(deleteTarget.id);
      toast.success("Message deleted.");
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete.");
    }
  }

  const columns: ColumnDef<Message, unknown>[] = [
    {
      accessorKey: "name",
      header: "From",
      cell: ({ row }) => (
        <button
          type="button"
          className="flex max-w-[16rem] flex-col text-left"
          onClick={() => setView(row.original)}
        >
          <span className="truncate font-medium text-card-foreground">
            {row.original.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.email}
          </span>
        </button>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <button
          type="button"
          className="flex max-w-[20rem] flex-col text-left"
          onClick={() => setView(row.original)}
        >
          <span className="truncate text-sm">
            {row.original.subject || row.original.category || "—"}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.body}
          </span>
        </button>
      ),
    },
    {
      accessorKey: "channel",
      header: "Channel",
      cell: ({ row }) => <ChannelBadge channel={row.original.channel} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Received",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      size: 150,
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="View message"
              onClick={() => setView(m)}
            >
              <Eye className="size-4" />
            </Button>
            {m.status === "new" && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Mark as open"
                title="Mark as open"
                onClick={() => setMessageStatus(m.id, "open")}
              >
                <MailOpen className="size-4" />
              </Button>
            )}
            {m.status !== "resolved" && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Mark as resolved"
                title="Mark as resolved"
                className="text-emerald-700 hover:text-emerald-700"
                onClick={() => setMessageStatus(m.id, "resolved")}
              >
                <CheckCircle2 className="size-4" />
              </Button>
            )}
            {m.status === "resolved" && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Reopen"
                title="Reopen"
                onClick={() => setMessageStatus(m.id, "open")}
              >
                <RotateCcw className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete message"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(m)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">
            Inbox
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Helpdesk tickets and contact-form messages from citizens.
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={channel}
            onValueChange={(v) => setChannel(v as typeof channel)}
          >
            <SelectTrigger className="w-[150px]" aria-label="Filter by channel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              <SelectItem value="helpdesk">Helpdesk</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as typeof status)}
          >
            <SelectTrigger className="w-[140px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading messages…" />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No messages"
          description="Citizen helpdesk tickets and contact messages will appear here."
        />
      ) : (
        <Card className="py-0">
          <DataTable
            columns={columns}
            data={filtered}
            emptyLabel="No messages match these filters."
          />
        </Card>
      )}

      {/* Read dialog */}
      <Dialog open={view !== null} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          {view && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {view.subject || view.category || "Message"}
                </DialogTitle>
                <DialogDescription>
                  From {view.name} &lt;{view.email}&gt; ·{" "}
                  {formatDate(view.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <ChannelBadge channel={view.channel} />
                <StatusBadge status={view.status} />
                {view.category && (
                  <Badge className="bg-muted text-muted-foreground">
                    {view.category}
                  </Badge>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {view.body}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {view.status !== "open" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void setMessageStatus(view.id, "open");
                      setView(null);
                    }}
                  >
                    <MailOpen className="size-4" /> Mark open
                  </Button>
                )}
                {view.status !== "resolved" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      void setMessageStatus(view.id, "resolved");
                      setView(null);
                    }}
                  >
                    <CheckCircle2 className="size-4" /> Resolve
                  </Button>
                )}
                <a
                  href={`mailto:${view.email}?subject=${encodeURIComponent(
                    `Re: ${view.subject || view.category || "Your message"}`,
                  )}`}
                  className="ml-auto"
                >
                  <Button variant="outline" size="sm">
                    Reply by email
                  </Button>
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this message?"
        description={
          deleteTarget
            ? `The message from ${deleteTarget.name} will be permanently removed.`
            : undefined
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}
