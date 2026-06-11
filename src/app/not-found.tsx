import Link from "next/link";
import {
  Home, Users, LayoutGrid, Mail, ArrowRight, Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meteors } from "@/components/ui/meteors";
import { FloatingMotifs } from "@/components/site/floating-motifs";

const quickLinks = [
  { icon: Home, label: "Home", desc: "Return to the homepage", href: "/" },
  {
    icon: Users,
    label: "Directories",
    desc: "Find your local organ",
    href: "/ndcs",
  },
  {
    icon: LayoutGrid,
    label: "Services",
    desc: "Permits, licences & more",
    href: "/services",
  },
  {
    icon: Mail,
    label: "Contact",
    desc: "Get in touch with us",
    href: "/contact",
  },
];

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-ink py-20 text-ink-foreground">
      {/* decorative layers */}
      <div className="pointer-events-none absolute inset-0 bg-dot text-white/[0.05]" />
      <Meteors number={12} />
      <FloatingMotifs preset="hero" className="text-white/[0.06]" />
      <div className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-brand/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-gold/10 blur-[120px]" />

      <div className="container-gov relative text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/5 text-gold ring-1 ring-white/10">
          <Compass className="size-8" />
        </div>

        <p className="mt-8 font-heading text-7xl font-extrabold leading-none text-gradient-brand sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 font-heading text-3xl font-extrabold text-white sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/70">
          Sorry, the page you are looking for doesn&apos;t exist or may have
          moved. Use the links below to find what you need.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-brand-600 text-white hover:bg-brand-700">
            <Link href="/">
              <Home className="size-4" /> Back to home
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/contact">
              Contact us <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* quick links */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center transition-colors hover:border-gold/40 hover:bg-white/[0.07]"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <l.icon className="size-5" />
              </span>
              <span className="mt-1 font-heading text-sm font-bold text-white">
                {l.label}
              </span>
              <span className="text-xs text-white/55">{l.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* brand base line */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-brand via-gold to-brand" />
    </section>
  );
}
