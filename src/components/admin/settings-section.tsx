"use client";

/** Settings — shows the active data mode with explanation and a logout action. */
import { Cloud, HardDrive, LogOut, ShieldCheck } from "lucide-react";

import { data } from "@/lib/data/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SettingsSection({ onLogout }: { onLogout: () => void }) {
  const live = data.mode === "live";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How this admin stores content and your session.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-10 items-center justify-center rounded-lg ${
                live
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-gold/15 text-[#8a6500]"
              }`}
            >
              {live ? (
                <Cloud className="size-5" />
              ) : (
                <HardDrive className="size-5" />
              )}
            </span>
            <CardTitle>Data mode</CardTitle>
          </div>
          <Badge
            className={
              live
                ? "bg-emerald-500/10 text-emerald-700"
                : "bg-gold/15 text-[#8a6500]"
            }
          >
            {live ? "Live" : "Preview"}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          {live ? (
            <p>
              This admin is <strong className="text-foreground">live</strong>.
              Changes you save are published to the website and shared with all
              staff right away.
            </p>
          ) : (
            <p>
              This is a <strong className="text-foreground">preview</strong>.
              Changes are kept on this device only, are not shared with other
              staff, and may reset — use the live site to make official updates.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-ink/10 text-ink">
            <ShieldCheck className="size-5" />
          </span>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <p className="text-sm text-muted-foreground">
            End your admin session on this device.
          </p>
          <Button variant="destructive" onClick={onLogout}>
            <LogOut className="size-4" /> Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
