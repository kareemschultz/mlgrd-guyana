"use client";

/**
 * REO appointment booking now lives inside the unified Contact hub. This keeps
 * the old `/appointments` URL working by forwarding to
 * `/contact?intent=appointment` (router.replace handles the GitHub Pages base
 * path), with a manual link as a no-JS fallback.
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2 } from "lucide-react";

export function AppointmentsRedirect() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/contact?intent=appointment");
  }, [router]);

  return (
    <div className="container-gov flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand-600">
        <CalendarClock className="size-6" />
      </span>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Taking you to appointment booking…
      </p>
      <Link
        href="/contact?intent=appointment"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        Continue to booking
      </Link>
    </div>
  );
}
