import Link from "next/link";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/site";

/** The ministry emblem image. */
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

/** Emblem + wordmark, links home. */
export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const sub = variant === "light" ? "text-white/70" : "text-muted-foreground";
  const title = variant === "light" ? "text-white" : "text-ink";
  return (
    <Link
      href="/"
      aria-label="Ministry of Local Government & Regional Development — Home"
      className={cn("group flex items-center gap-2.5", className)}
    >
      <LogoMark className="size-11 shrink-0 transition-transform duration-300 group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-heading text-lg font-extrabold tracking-tight", title)}>
          MLGRD
        </span>
        <span className={cn("text-[10px] font-medium uppercase tracking-[0.12em]", sub)}>
          Local Government · Guyana
        </span>
      </span>
    </Link>
  );
}
