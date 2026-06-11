import Link from "next/link";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/site";

/**
 * The compact ministry mark (circular crest) — used in small placements
 * (header, footer, favicon, sign-in) where the full emblem's lettering would be
 * illegible. The full lettered emblem (public/emblem.png) is used large in the
 * hero and the admin sign-in panel.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset("/logo.png")}
      alt="Ministry of Local Government & Regional Development emblem"
      className={cn("object-contain", className)}
      width={48}
      height={48}
    />
  );
}

/**
 * The official ministry logo — the full emblem (crest + lettering + Guyana map),
 * links home. No separate wordmark: the emblem already carries the ministry name.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Ministry of Local Government & Regional Development — Home"
      className={cn("group inline-flex shrink-0 items-center", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/emblem.png")}
        alt="Ministry of Local Government & Regional Development"
        className="h-14 w-auto transition-transform duration-300 group-hover:scale-[1.03] sm:h-16"
        width={48}
        height={71}
      />
    </Link>
  );
}
