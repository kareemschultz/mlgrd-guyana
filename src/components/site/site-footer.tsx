import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ministry, footerNav, socialLinks } from "@/lib/site";
import { LogoMark } from "@/components/site/logo";

export function SiteFooter() {
  const year = 2026;
  return (
    <footer className="mt-auto bg-ink text-ink-foreground">
      {/* brand accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-brand via-gold to-brand" />

      <div className="container-gov py-14">
        <div className="grid grid-cols-1 gap-y-10 min-[430px]:grid-cols-2 min-[430px]:gap-x-8 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand + contact — brand centered on mobile; readable text blocks align left inside the centered footer column */}
          <div className="mx-auto w-full max-w-sm min-[430px]:col-span-2 lg:col-span-1 lg:mx-0 lg:max-w-none">
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white p-1">
                <LogoMark className="size-10" />
              </span>
              <div className="leading-tight">
                <p className="font-heading text-lg font-extrabold text-white">MLGRD</p>
                <p className="text-xs text-white/60">Government of Guyana</p>
              </div>
            </div>
            <p className="mt-5 text-left text-sm leading-relaxed text-white/70 lg:max-w-xs">{ministry.name}.</p>
            <ul className="mt-5 flex flex-col items-start gap-2.5 text-left text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>{ministry.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-gold" />
                <a href={`tel:${ministry.phone}`} className="hover:text-white">{ministry.phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-gold" />
                <a href={`mailto:${ministry.email}`} className="hover:text-white">{ministry.email}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>{ministry.hours}</span>
              </li>
            </ul>
            <div className="mt-6 flex items-center justify-start gap-3" aria-label="Ministry social media links">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`MLGRD on ${social.label}`}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition-colors hover:border-gold/60 hover:bg-gold/15 hover:text-gold"
                >
                  <SocialIcon name={social.label} className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerNav.map((col) => (
            <div key={col.heading} className="mx-auto w-full max-w-sm text-left lg:mx-0 lg:max-w-none">
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
        <div className="container-gov flex flex-col items-center justify-between gap-4 py-5 text-center text-xs text-white/55 md:flex-row md:text-left">
          <p className="max-w-sm leading-relaxed md:max-w-none">
            © {year} {ministry.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:justify-end">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/accessibility" className="hover:text-white">Accessibility</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

type SocialIconProps = {
  name: string;
  className?: string;
};

function SocialIcon({ name, className }: SocialIconProps) {
  if (name === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.92 3.78-3.92 1.1 0 2.24.2 2.24.2v2.48h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06Z" />
      </svg>
    );
  }

  if (name === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.6 5.82a5.12 5.12 0 0 0 3.01.96v3.1a8.2 8.2 0 0 1-3.02-.58v5.78c0 3.1-2.5 5.62-5.6 5.62a5.6 5.6 0 0 1 0-11.2c.34 0 .67.03.99.09v3.2a2.48 2.48 0 1 0 1.54 2.3V3.3h3.08c.22 1.05.82 1.95 1.66 2.52Z" />
    </svg>
  );
}
