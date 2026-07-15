"use client";

/**
 * Account menu — the signed-in staff member's avatar + role with quick actions
 * (view the public site, open settings, log out). Uses the shadcn dropdown
 * menu; shows who is logged in now that the portal supports multiple staff.
 */
import Link from "next/link";
import { ChevronDown, ExternalLink, LogOut, Settings } from "lucide-react";

import { asset } from "@/lib/site";
import type { AuthUser, UserRole } from "@/lib/data/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
  procurement: "Procurement",
};

const ROLE_STYLE: Record<UserRole, string> = {
  admin: "border-brand/30 bg-brand/10 text-brand-700",
  editor: "border-gold/30 bg-gold/15 text-[#8a6500]",
  viewer: "border-border bg-secondary text-muted-foreground",
  procurement: "border-emerald/30 bg-emerald/10 text-emerald-700",
};

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "A"
  );
}

export function AccountMenu({
  user,
  onLogout,
  onOpenSettings,
}: {
  user: AuthUser | null;
  onLogout: () => void;
  onOpenSettings: () => void;
}) {
  const name = user?.name || "Administrator";
  const role = (user?.role || "admin") as UserRole;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          <Avatar className="size-7">
            <AvatarFallback className="bg-brand-600 text-xs font-bold text-white">
              {initialsOf(name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[12ch] truncate text-sm font-medium sm:inline">
            {name}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <span className="font-semibold leading-tight">{name}</span>
            {user?.username && (
              <span className="text-xs text-muted-foreground">@{user.username}</span>
            )}
            <Badge variant="outline" className={cn("mt-1 w-fit rounded-full", ROLE_STYLE[role])}>
              {ROLE_LABEL[role]}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={asset("/")} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" /> View public site
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onOpenSettings}>
          <Settings className="size-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
