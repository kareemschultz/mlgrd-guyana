import Link from "next/link";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/site";

/**
 * Canonical compact ministry mark used anywhere the brand appears small:
 * header, footer, admin chrome, app icons and favicon. The full lettered emblem
 * (`public/emblem.png`) is reserved for large decorative placements only.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset("/logo.png")}
      alt="Ministry of Local Government & Regional Development emblem"
      className={cn("object-contain", className)}
      width={512}
      height={512}
    />
  );
}

/** Primary chrome brand: compact mark + text, matching the footer treatment. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Ministry of Local Government & Regional Development — Home"
      className={cn("group inline-flex shrink-0 items-center gap-3", className)}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-border/70 transition-transform duration-300 group-hover:scale-[1.03]">
        <LogoMark className="size-10" />
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block font-heading text-lg font-extrabold tracking-tight text-foreground">
          MLGRD
        </span>
        <span className="block text-xs font-medium text-muted-foreground">
          Government of Guyana
        </span>
      </span>
    </Link>
  );
}
