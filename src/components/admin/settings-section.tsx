"use client";

/** Settings — shows the active data mode with explanation and a logout action. */
import { Cloud, HardDrive, LogOut, Info, ShieldCheck } from "lucide-react";

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
            {live ? "Live • Cloudflare" : "Demo • this browser"}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          {live ? (
            <p>
              This admin is connected to the{" "}
              <strong className="text-foreground">Cloudflare D1</strong>{" "}
              database via Pages Functions. Changes are shared across all
              visitors and persist on the server.
            </p>
          ) : (
            <p>
              This admin is running in{" "}
              <strong className="text-foreground">demo mode</strong>. Content is
              stored in this browser&apos;s <code>localStorage</code> only —
              changes are not shared with other devices and reset if you clear
              site data. Deploy on Cloudflare Pages to enable shared, persistent
              storage.
            </p>
          )}
          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
            <Info className="mt-0.5 size-4 shrink-0 text-brand-600" />
            <p>
              The same admin code powers both modes — the backend is selected
              automatically at build time.
            </p>
          </div>
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
