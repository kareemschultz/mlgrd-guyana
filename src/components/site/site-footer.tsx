import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ministry, footerNav } from "@/lib/site";
import { LogoMark } from "@/components/site/logo";

export function SiteFooter() {
  const year = 2026;
  return (
    <footer className="mt-auto bg-ink text-ink-foreground">
      {/* brand accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-brand via-gold to-brand" />

      <div className="container-gov py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand + contact */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white p-1">
                <LogoMark className="size-10" />
              </span>
              <div className="leading-tight">
                <p className="font-heading text-lg font-extrabold text-white">MLGRD</p>
                <p className="text-xs text-white/60">Government of Guyana</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/70">{ministry.name}.</p>
            <ul className="mt-5 space-y-2.5 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" /> {ministry.address}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-gold" />
                <a href={`tel:${ministry.phone}`} className="hover:text-white">{ministry.phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-gold" />
                <a href={`mailto:${ministry.email}`} className="hover:text-white">{ministry.email}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-gold" /> {ministry.hours}
              </li>
            </ul>
          </div>

          {/* Link columns */}
          {footerNav.map((col) => (
            <div key={col.heading}>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/70 transition-colors hover:text-gold">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-gov flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/55 sm:flex-row">
          <p>© {year} {ministry.name}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/accessibility" className="hover:text-white">Accessibility</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
