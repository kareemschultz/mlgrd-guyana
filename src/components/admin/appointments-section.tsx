"use client";

/**
 * Appointments — the REO booking inbox as a studio datatable. Newest first,
 * filter by region + status, colour-coded status badges, a status workflow
 * (requested → confirmed / declined → completed) and delete-with-confirm.
 * Wired to data.appointments.*. Mirrors messages-section.tsx.
 */
import * as React from "react";
import {
  Trash2,
  CalendarClock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  Flag,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import type { Appointment, AppointmentStatus } from "@/lib/data/types";
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

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  requested: "bg-gold/15 text-[#8a6500]",
  confirmed: "bg-emerald-500/10 text-emerald-700",
  declined: "bg-flag-red/10 text-[#a30d1d]",
  completed: "bg-ink/10 text-ink",
};

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge className={`${STATUS_STYLES[status]} capitalize`}>{status}</Badge>
  );
}

/** Preferred date + optional slot, formatted for the table/dialog. */
function whenLabel(a: Appointment): string {
  const date = formatDate(a.date);
  return a.time ? `${date} · ${a.time}` : date;
}

export function AppointmentsSection({
  appointments,
  onChange,
  loading,
}: {
  appointments: Appointment[];
  onChange: () => Promise<void> | void;
  loading: boolean;
}) {
  const [region, setRegion] = React.useState<string>("all");
  const [status, setStatus] = React.useState<"all" | AppointmentStatus>("all");
  const [view, setView] = React.useState<Appointment | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Appointment | null>(
    null,
  );

  const regions = React.useMemo(() => {
    const set = new Set(appointments.map((a) => a.region).filter(Boolean));
    return [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }, [appointments]);

  // Backend already returns newest-first; re-sort defensively.
  const filtered = React.useMemo(
    () =>
      [...appointments]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .filter((a) => region === "all" || a.region === region)
        .filter((a) => status === "all" || a.status === status),
    [appointments, region, status],
  );

  async function setStatusFor(id: string, next: AppointmentStatus) {
    try {
      await data.appointments.update(id, { status: next });
      toast.success(`Marked as ${next}.`);
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await data.appointments.remove(deleteTarget.id);
      toast.success("Appointment deleted.");
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete.");
    }
  }

  const columns: ColumnDef<Appointment, unknown>[] = [
    {
      accessorKey: "name",
      header: "Citizen",
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
      id: "region",
      header: "Region / REO",
      cell: ({ row }) => (
        <button
          type="button"
          className="flex max-w-[14rem] flex-col text-left"
          onClick={() => setView(row.original)}
        >
          <span className="truncate text-sm font-medium">
            {row.original.region}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.reoName}
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
          className="flex max-w-[18rem] flex-col text-left"
          onClick={() => setView(row.original)}
        >
          <span className="truncate text-sm">{row.original.subject}</span>
          {row.original.notes && (
            <span className="truncate text-xs text-muted-foreground">
              {row.original.notes}
            </span>
          )}
        </button>
      ),
    },
    {
      accessorKey: "date",
      header: "Requested for",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {whenLabel(row.original)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      size: 170,
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="View appointment"
              onClick={() => setView(a)}
            >
              <Eye className="size-4" />
            </Button>
            {(a.status === "requested" || a.status === "declined") && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Confirm appointment"
                title="Confirm"
                className="text-emerald-700 hover:text-emerald-700"
                onClick={() => setStatusFor(a.id, "confirmed")}
              >
                <CheckCircle2 className="size-4" />
              </Button>
            )}
            {a.status === "requested" && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Decline appointment"
                title="Decline"
                className="text-[#a30d1d] hover:text-[#a30d1d]"
                onClick={() => setStatusFor(a.id, "declined")}
              >
                <XCircle className="size-4" />
              </Button>
            )}
            {a.status === "confirmed" && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Mark completed"
                title="Mark completed"
                onClick={() => setStatusFor(a.id, "completed")}
              >
                <Flag className="size-4" />
              </Button>
            )}
            {a.status === "completed" && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Reopen as confirmed"
                title="Reopen"
                onClick={() => setStatusFor(a.id, "confirmed")}
              >
                <RotateCcw className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete appointment"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(a)}
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
            Appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Citizen requests to meet a Regional Executive Officer.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[150px]" aria-label="Filter by region">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as typeof status)}
          >
            <SelectTrigger className="w-[150px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading appointments…" />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No appointments"
          description="Citizen requests to meet a Regional Executive Officer will appear here."
        />
      ) : (
        <Card className="py-0">
          <DataTable
            columns={columns}
            data={filtered}
            emptyLabel="No appointments match these filters."
          />
        </Card>
      )}

      {/* Read dialog */}
      <Dialog open={view !== null} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          {view && (
            <>
              <DialogHeader>
                <DialogTitle>{view.subject}</DialogTitle>
                <DialogDescription>
                  From {view.name} &lt;{view.email}&gt; · requested{" "}
                  {formatDate(view.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={view.status} />
                <Badge className="bg-muted text-muted-foreground">
                  {view.region}
                </Badge>
              </div>

              <dl className="grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="size-3.5" /> Region / REO
                  </dt>
                  <dd className="mt-0.5 font-medium">
                    {view.region}
                    {view.regionName ? ` — ${view.regionName}` : ""} ·{" "}
                    {view.reoName}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <CalendarClock className="size-3.5" /> Preferred
                  </dt>
                  <dd className="mt-0.5 font-medium">{whenLabel(view)}</dd>
                </div>
                {view.phone && (
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Phone className="size-3.5" /> Phone
                    </dt>
                    <dd className="mt-0.5 font-medium">{view.phone}</dd>
                  </div>
                )}
              </dl>

              {view.notes && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {view.notes}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {(view.status === "requested" ||
                  view.status === "declined") && (
                  <Button
                    size="sm"
                    onClick={() => {
                      void setStatusFor(view.id, "confirmed");
                      setView(null);
                    }}
                  >
                    <CheckCircle2 className="size-4" /> Confirm
                  </Button>
                )}
                {view.status === "requested" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void setStatusFor(view.id, "declined");
                      setView(null);
                    }}
                  >
                    <XCircle className="size-4" /> Decline
                  </Button>
                )}
                {view.status === "confirmed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void setStatusFor(view.id, "completed");
                      setView(null);
                    }}
                  >
                    <Flag className="size-4" /> Mark completed
                  </Button>
                )}
                <a
                  href={`mailto:${view.email}?subject=${encodeURIComponent(
                    `Re: ${view.subject} — appointment with ${view.reoName}`,
                  )}`}
                  className="ml-auto"
                >
                  <Button variant="outline" size="sm">
                    <Mail className="size-4" /> Reply by email
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
        title="Delete this appointment?"
        description={
          deleteTarget
            ? `The request from ${deleteTarget.name} will be permanently removed.`
            : undefined
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}
