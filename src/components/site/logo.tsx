import Link from "next/link";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/site";

/**
 * The official ministry emblem mark — the SAME emblem (public/emblem.png) used
 * in the header, so the logo is consistent everywhere it appears (footer,
 * admin, sign-in). The emblem is portrait, so size it by height (pass an `h-*`)
 * class) and let the width auto-scale. Favicon, app icon, and SEO schema logo
 * are generated from the same official emblem for consistent branding.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset("/emblem.png")}
      alt="Ministry of Local Government & Regional Development"
      className={cn("w-auto object-contain", className)}
      width={49}
      height={71}
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
