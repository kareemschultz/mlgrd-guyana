"use client";

/**
 * Staff & roles manager (admin only). Add Ministry staff as accounts with a
 * role — admin (full access incl. user management), editor (manage content),
 * or viewer (read-only). Passwords are sent to the API and hashed server-side
 * (PBKDF2); they are never returned or stored client-side.
 */
import * as React from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";

import { data } from "@/lib/data/client";
import type { User, UserRole } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, LoadingState, EmptyState, IconAction } from "@/components/admin/shared";
import { ConfirmDelete } from "@/components/admin/confirm-delete";

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "admin", label: "Admin", desc: "Full access, including managing staff" },
  { value: "editor", label: "Editor", desc: "Manage all content" },
  { value: "viewer", label: "Viewer", desc: "Read-only access" },
];

const roleBadge: Record<UserRole, string> = {
  admin: "border-brand/30 bg-brand/10 text-brand-700",
  editor: "border-gold/30 bg-gold/15 text-gold-700",
  viewer: "border-border bg-secondary text-muted-foreground",
};

type Draft = {
  username: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
  active: boolean;
};

const EMPTY: Draft = { username: "", name: "", email: "", role: "editor", password: "", active: true };

export function UsersSection() {
  const me = data.auth.currentUser();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<User | "new" | null>(null);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);
  const [saving, setSaving] = React.useState(false);
  const [deleteUser, setDeleteUser] = React.useState<User | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await data.users.list());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load staff.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  function openCreate() {
    setDraft(EMPTY);
    setEditing("new");
  }
  function openEdit(u: User) {
    setDraft({ username: u.username, name: u.name, email: u.email ?? "", role: u.role, password: "", active: u.active });
    setEditing(u);
  }

  async function save() {
    if (!draft.name.trim()) return toast.error("Name is required.");
    if (editing === "new") {
      if (!draft.username.trim()) return toast.error("Username is required.");
      if (draft.password.length < 8) return toast.error("Password must be at least 8 characters.");
    }
    if (editing !== "new" && draft.password && draft.password.length < 8) {
      return toast.error("Password must be at least 8 characters.");
    }
    setSaving(true);
    try {
      if (editing === "new") {
        await data.users.create({
          username: draft.username.trim(),
          name: draft.name.trim(),
          email: draft.email.trim() || undefined,
          role: draft.role,
          password: draft.password,
        });
        toast.success("Staff member added.");
      } else if (editing) {
        await data.users.update(editing.id, {
          name: draft.name.trim(),
          email: draft.email.trim() || undefined,
          role: draft.role,
          active: draft.active,
          ...(draft.password ? { password: draft.password } : {}),
        });
        toast.success("Staff member updated.");
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Staff accounts and their roles. {data.mode === "demo" && "(Demo: changes are local; passwords aren't verified.)"}
        </p>
        <Button onClick={openCreate} className="bg-brand-600 hover:bg-brand-700">
          <UserPlus className="size-4" /> Add staff
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Loading staff…" />
      ) : users.length === 0 ? (
        <EmptyState icon={Plus} title="No staff accounts yet" description="Add the first staff member." />
      ) : (
        <ul className="divide-y rounded-xl border">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary font-heading text-sm font-bold text-muted-foreground">
                {(u.name || u.username).slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-medium">
                  {u.name}
                  {!u.active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                  {me?.id === u.id && <span className="text-xs text-muted-foreground">(you)</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">@{u.username}{u.email ? ` · ${u.email}` : ""}</p>
              </div>
              <Badge variant="outline" className={cn("rounded-full", roleBadge[u.role])}>
                {u.role}
              </Badge>
              <IconAction label="Edit staff member" onClick={() => openEdit(u)}>
                <Pencil className="size-4" />
              </IconAction>
              <IconAction
                label={me?.id === u.id ? "You can't remove yourself" : "Remove staff member"}
                onClick={() => setDeleteUser(u)}
                disabled={me?.id === u.id}
                className="text-destructive hover:text-destructive disabled:opacity-30"
              >
                <Trash2 className="size-4" />
              </IconAction>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Add staff member" : "Edit staff member"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Full name" htmlFor="u-name">
              <Input id="u-name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Jane Citizen" />
            </Field>
            <Field label="Username" htmlFor="u-username" hint={editing !== "new" ? "Username can't be changed." : "Lowercase, no spaces."}>
              <Input
                id="u-username"
                value={draft.username}
                onChange={(e) => setDraft((d) => ({ ...d, username: e.target.value }))}
                disabled={editing !== "new"}
                placeholder="jcitizen"
                autoComplete="off"
              />
            </Field>
            <Field label="Email (optional)" htmlFor="u-email">
              <Input id="u-email" type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} placeholder="jane@mlgrd.gov.gy" />
            </Field>
            <Field
              label="Role"
              htmlFor="u-role"
              hint={ROLES.find((r) => r.value === draft.role)?.desc}
            >
              <Select value={draft.role} onValueChange={(v) => setDraft((d) => ({ ...d, role: v as UserRole }))}>
                <SelectTrigger id="u-role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label={editing === "new" ? "Password" : "New password (leave blank to keep)"}
              htmlFor="u-password"
              hint="At least 8 characters."
            >
              <Input
                id="u-password"
                type="password"
                value={draft.password}
                onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
            {editing !== "new" && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
                  className="size-4 rounded border-input"
                />
                Active (can sign in)
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-brand-600 hover:bg-brand-700">
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={deleteUser !== null}
        onOpenChange={(o) => !o && setDeleteUser(null)}
        title={`Remove ${deleteUser?.name ?? "this staff member"}?`}
        description="They will no longer be able to sign in."
        onConfirm={async () => {
          if (deleteUser) {
            try {
              await data.users.remove(deleteUser.id);
              toast.success("Staff member removed.");
              await load();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not remove.");
            }
          }
          setDeleteUser(null);
        }}
      />
    </div>
  );
}
