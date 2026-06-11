import Link from "next/link";
import {
  Building2, Landmark, Users, FileText, ScrollText, HandHelping,
  ArrowRight, MapPin, ShieldCheck, ReceiptText, Hammer, Megaphone, Briefcase,
} from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { HeroFx } from "@/components/site/hero-fx";
import { HeroEmblemNews } from "@/components/site/latest-news";
import { PortalUpdatesTeaser } from "@/components/site/portal-updates-teaser";
import ndcs from "@/data/ndcs.json";

const stats = [
  { value: 10, label: "Administrative Regions", suffix: "" },
  { value: ndcs.length, label: "Neighbourhood Councils", suffix: "" },
  { value: 10, label: "Regional Democratic Councils", suffix: "" },
  { value: 6, label: "Digital Services", suffix: "" },
];

const services = [
  { icon: Hammer, title: "Building Permits", desc: "Apply for and track approvals for construction and development.", href: "/services/building-permits" },
  { icon: ReceiptText, title: "Business Licences", desc: "Register and renew licences to trade within local authority areas.", href: "/services/business-licences" },
  { icon: FileText, title: "Rates & Taxes", desc: "Understand property rates, valuation and how to pay.", href: "/services/rates-and-taxes-guidance" },
  { icon: Megaphone, title: "Report a Problem", desc: "Flag roads, drainage, sanitation and other community issues.", href: "/services/reporting-local-problems" },
  { icon: HandHelping, title: "Community Projects", desc: "Learn about projects and funding supporting local development.", href: "/services/community-projects" },
  { icon: Briefcase, title: "Vendors & Suppliers", desc: "Procurement information and supplier enquiries for the Ministry.", href: "/services/vendor-and-supplier-enquiries" },
];

const directories = [
  { icon: Users, title: "Neighbourhood Democratic Councils", desc: "Find your NDC, its leadership and region across the country.", href: "/ndcs", count: `${ndcs.length} councils` },
  { icon: Landmark, title: "Regional Democratic Councils", desc: "The ten RDCs coordinating development at the regional level.", href: "/rdcs", count: "10 regions" },
  { icon: Building2, title: "Municipalities", desc: "Towns and the city delivering urban local-government services.", href: "/municipalities", count: "10 towns" },
];

const updates = [
  "Draft Integrated Solid Waste Management Bill 2026 now open for consultation",
  "Local Government Commission strengthens regional capacity-building",
  "Citizens can now report local problems online through the Ministry portal",
  "Community development projects expand across hinterland regions",
];

export default function HomePage() {
  return (
    <>
      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="pointer-events-none absolute inset-0 bg-dot text-white/[0.05]" />
        <HeroFx />
        <div className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-brand/25 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-gold/10 blur-[120px]" />

        <div className="container-gov relative grid gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <AnimatedGradientText className="mb-5 text-sm font-medium">
              🇬🇾 Government of Guyana · Local Government &amp; Regional Development
            </AnimatedGradientText>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl">
              Strong councils,{" "}
              <span className="text-gradient-brand">thriving communities.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              The Ministry of Local Government &amp; Regional Development empowers
              Guyana&apos;s regions, towns and neighbourhood councils to deliver
              services, infrastructure and democratic representation to every citizen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-brand-600 text-white hover:bg-brand-700">
                <Link href="/ndcs">
                  <MapPin className="size-4" /> Find your council
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/services/reporting-local-problems">
                  Report a problem <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-white/55">
              <ShieldCheck className="size-4 text-gold" />
              An official Government of Guyana service
            </div>
          </div>

          {/* Emblem + latest updates */}
          <HeroEmblemNews />
        </div>

        {/* updates marquee */}
        <div className="relative border-t border-white/10 bg-black/20 py-3">
          <Marquee pauseOnHover className="[--duration:38s]">
            {updates.map((u) => (
              <span key={u} className="mx-6 flex items-center gap-2 text-sm text-white/70">
                <span className="size-1.5 rounded-full bg-gold" /> {u}
              </span>
            ))}
          </Marquee>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-brand via-gold to-brand" />
      </section>

      {/* ───── Stats ───── */}
      <section className="border-b bg-secondary/40">
        <div className="container-gov grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <div className="font-heading text-4xl font-extrabold text-brand-600 sm:text-5xl">
                <NumberTicker value={s.value} />{s.suffix}
              </div>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <PortalUpdatesTeaser />

      {/* ───── Services ───── */}
      <section className="py-20">
        <div className="container-gov">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">How can we help?</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl">Services for citizens &amp; businesses</h2>
            <p className="mt-3 text-muted-foreground">Everything you need to engage with your local authority, in one place.</p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.href} delay={(i % 3) * 0.06}>
                <Link
                  href={s.href}
                  className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <s.icon className="size-6" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold">{s.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{s.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                    Learn more <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Directories ───── */}
      <section className="bg-ink py-20 text-ink-foreground">
        <div className="container-gov">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Local authorities</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold text-white sm:text-4xl">Find your local council</h2>
            <p className="mt-3 text-white/70">Browse Guyana&apos;s neighbourhood, regional and municipal councils.</p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {directories.map((d, i) => (
              <Reveal key={d.href} delay={i * 0.08}>
                <Link
                  href={d.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-colors hover:border-gold/40 hover:bg-white/[0.07]"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <d.icon className="size-6" />
                  </div>
                  <span className="mt-5 text-xs font-semibold uppercase tracking-wider text-gold/80">{d.count}</span>
                  <h3 className="mt-1 font-heading text-xl font-bold text-white">{d.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-white/65">{d.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-white">
                    Open directory <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="py-20">
        <div className="container-gov">
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-14 text-center text-white">
            <div className="pointer-events-none absolute inset-0 bg-dot text-white/10" />
            <ScrollText className="mx-auto size-10 text-gold" />
            <h2 className="mt-4 font-heading text-3xl font-extrabold sm:text-4xl">Have a question for the Ministry?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Reach our helpdesk, browse frequently asked questions, or contact your local authority directly.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-white text-brand-700 hover:bg-white/90">
                <Link href="/contact">Contact us</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/faq">Visit the FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
