"use client";

import { useState } from "react";
import { ExternalLink, LifeBuoy, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Embeds the Ministry's helpdesk web app as a single window (iframe) on the
 * /helpdesk page — no redirect. The app URL comes from NEXT_PUBLIC_HELPDESK_URL
 * so it can be pointed at staging now and production on launch. If the env var
 * is unset, a graceful "launching soon" state is shown instead so the page is
 * never broken.
 */

const HELPDESK_URL =
  process.env.NEXT_PUBLIC_HELPDESK_URL ??
  "https://app.mlgrd.staging.castech.dev/";

/** Set NEXT_PUBLIC_HELPDESK_URL="" to force the "launching soon" state. */
const ENABLED = HELPDESK_URL.trim().length > 0;

export function HelpdeskEmbed() {
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  if (!ENABLED) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand-600">
          <LifeBuoy className="size-7" />
        </span>
        <h3 className="mt-5 font-heading text-xl font-bold">
          Online helpdesk launching soon
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          The Ministry&apos;s digital helpdesk will appear right here as a single
          window. In the meantime, use the contact channels above or the message
          form below.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Window chrome */}
      <div className="flex items-center justify-between gap-3 border-b bg-secondary/40 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-flag-red/70" />
            <span className="size-2.5 rounded-full bg-gold/80" />
            <span className="size-2.5 rounded-full bg-green-500/70" />
          </span>
          <span className="ml-2 flex items-center gap-1.5 truncate text-xs font-medium text-muted-foreground">
            <LifeBuoy className="size-3.5 shrink-0 text-brand-600" />
            Ministry Helpdesk
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLoaded(false);
              setReloadKey((k) => k + 1);
            }}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className="size-3.5" /> Reload
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <a href={HELPDESK_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" /> Open
            </a>
          </Button>
        </div>
      </div>

      {/* Embedded app */}
      <div className="relative h-[78vh] min-h-[560px] w-full bg-background">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-brand-600" />
            <p className="text-sm">Loading the helpdesk…</p>
            <a
              href={HELPDESK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Taking too long? Open it in a new tab
            </a>
          </div>
        )}
        <iframe
          key={reloadKey}
          src={HELPDESK_URL}
          title="Ministry of Local Government & Regional Development Helpdesk"
          onLoad={() => setLoaded(true)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="clipboard-write; fullscreen"
          className="size-full"
        />
      </div>
    </div>
  );
}
