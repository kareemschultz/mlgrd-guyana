import Link from "next/link";
import {
  Building2, Landmark, Users, FileText, ScrollText, HandHelping, UserRoundCog,
  ArrowRight, MapPin, ShieldCheck, ReceiptText, Hammer, Megaphone, Briefcase,
  CalendarClock, ClipboardList, ExternalLink,
} from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { HeroFx } from "@/components/site/hero-fx";
import { HeroEmblemNews } from "@/components/site/latest-news";
import { PortalUpdatesTeaser } from "@/components/site/portal-updates-teaser";
import { ministry } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const stats = [
  { value: 10, label: "Regional Democratic Councils", suffix: "" },
  { value: 10, label: "Municipalities", suffix: "" },
  { value: 70, label: "Neighborhood Democratic Councils", suffix: "" },
  { value: 6, label: "Digital Services", suffix: "" },
];

const services = [
  { icon: Hammer, title: "Building Permits", desc: "Apply for and track approvals for construction and development.", href: "/services/building-permits" },
  { icon: ReceiptText, title: "Business Licences", desc: "Register and renew licences to trade within local authority areas.", href: "/services/business-licences" },
  { icon: FileText, title: "Rates & Taxes", desc: "Understand property rates, valuation and how to pay.", href: "/services/rates-and-taxes-guidance" },
  { icon: Megaphone, title: "Report a Problem", desc: "Flag roads, drainage, sanitation and other community issues.", href: ministry.helpdesk.complaintUrl, external: true },
  { icon: ClipboardList, title: "NDC Services", desc: "Compliance letters, complaints, drains, burial spots, house plans and certificates.", href: "/services/ndc-services" },
  { icon: HandHelping, title: "Community Projects", desc: "Learn about projects and funding supporting local development.", href: "/services/community-projects" },
  { icon: Briefcase, title: "Vendors & Suppliers", desc: "Procurement information and supplier enquiries for the Ministry.", href: "/services/vendor-and-supplier-enquiries" },
];

const directories = [
  { icon: Users, title: "Neighborhood Democratic Councils", desc: "Find your NDC, its leadership and region across the country.", href: "/ndcs", count: "70 councils" },
  { icon: Landmark, title: "Regional Democratic Councils", desc: "The 10 RDCs coordinating development at the regional level.", href: "/rdcs", count: "10 regions" },
  { icon: Building2, title: "Municipalities", desc: "Towns and the city delivering urban local-government services.", href: "/municipalities", count: "10 municipalities" },
  { icon: UserRoundCog, title: "Regional Executive Officers", desc: "Book an appointment with the REO for your region.", href: "/contact?intent=appointment", count: "10 REOs" },
];

const updates = [
  "Draft Integrated Solid Waste Management Bill 2026 now open for consultation",
  "Local Government Commission strengthens regional capacity-building",
  "Citizens can now report local problems online through the Ministry portal",
  "Community development projects expand across hinterland regions",
];

const citizenActions = [
  {
    icon: Megaphone,
    title: "Report an issue",
    desc: "Open the dedicated helpdesk app for complaints, roads, drainage, sanitation and community problems.",
    href: ministry.helpdesk.complaintUrl,
    external: true,
    cta: "Go to helpdesk",
  },
  {
    icon: CalendarClock,
    title: "Book an REO",
    desc: "Request an appointment with the Regional Executive Officer for your region.",
    href: "/contact?intent=appointment",
    external: false,
    cta: "Book appointment",
  },
  {
    icon: ClipboardList,
    title: "NDC services",
    desc: "See common services such as compliance letters, drainage, burial spots, food handler renewals and cash grant registration.",
    href: "/services/ndc-services",
    external: false,
    cta: "View services",
  },
] as const;

const ndcServiceHighlights = [
  "Property compliance letters",
  "Drainage maintenance requests",
  "Burial spot guidance",
  "Food handler certificate renewal",
];

export default function HomePage() {
  return (
    <>
      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden border-b bg-[#fffaf0] text-foreground">
        <div className="pointer-events-none absolute inset-0 bg-dot text-ink/[0.06]" />
        <HeroFx />
        <div className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-gold/25 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-brand/10 blur-[120px]" />

        <div className="container-gov relative grid gap-10 py-16 text-center sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28 lg:text-left">
          <div>
            <AnimatedGradientText className="mx-auto mb-5 max-w-[20rem] justify-center text-balance text-sm font-medium sm:max-w-none lg:mx-0 lg:justify-start">
              🇬🇾 Government of Guyana · Local Government &amp; Regional Development
            </AnimatedGradientText>
            <h1 className="mx-auto max-w-[11ch] font-heading text-4xl font-extrabold leading-[1.05] sm:max-w-none sm:text-5xl md:text-6xl lg:mx-0">
              Strong councils,{" "}
              <span className="text-gradient-brand">thriving communities.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
              The Ministry of Local Government &amp; Regional Development empowers
              Guyana&apos;s regions, towns and neighbourhood councils to deliver
              services, infrastructure and democratic representation to every citizen.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button asChild size="lg" className="bg-brand-600 text-white hover:bg-brand-700">
                <Link href="/ndcs">
                  <MapPin className="size-4" /> Find your council
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-brand/25 bg-white/70 text-brand-700 hover:bg-white hover:text-brand-700">
                <a href={ministry.helpdesk.complaintUrl} target="_blank" rel="noopener noreferrer">
                  Report a problem <ExternalLink className="size-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-gold/50 bg-white/70 text-ink hover:bg-white hover:text-ink">
                <Link href="/contact?intent=appointment">
                  <CalendarClock className="size-4" /> Book an REO
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground lg:justify-start">
              <ShieldCheck className="size-4 text-gold" />
              An official Government of Guyana website
            </div>
          </div>

          {/* Emblem + latest updates */}
          <HeroEmblemNews />
        </div>

        {/* updates marquee */}
        <div className="relative border-t border-ink/10 bg-ink py-3">
          <Marquee pauseOnHover className="[--duration:38s]">
            {updates.map((u) => (
              <span key={u} className="mx-6 flex items-center gap-2 text-sm text-white/80">
                <span className="size-1.5 rounded-full bg-gold" /> {u}
              </span>
            ))}
          </Marquee>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-brand via-gold to-brand" />
      </section>

      {/* ───── Stats ───── */}
      <section className="border-b bg-secondary/40">
        <div className="container-gov grid grid-cols-2 gap-6 py-12 md:grid-cols-4 2xl:max-w-[1540px] 2xl:py-16">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <div className="font-heading text-4xl font-extrabold text-brand-600 sm:text-5xl 2xl:text-6xl">
                <NumberTicker value={s.value} />{s.suffix}
              </div>
              <p className="mt-1 text-sm font-medium text-muted-foreground 2xl:text-base">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <PortalUpdatesTeaser />

      {/* ───── Citizen action board ───── */}
      <section className="border-b bg-white py-12 sm:py-16 2xl:py-20">
        <div className="container-gov 2xl:max-w-[1540px]">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Citizen services</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl 2xl:text-5xl">
              Fast routes for the most common requests
            </h2>
            <p className="mt-3 text-muted-foreground 2xl:text-lg">
              Built for phones, desktops and large public displays: big tap targets,
              plain labels and clear next steps.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-3 2xl:gap-7">
            {citizenActions.map((item, i) => {
              const Icon = item.icon;
              const content = (
                <>
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand-600 2xl:size-16">
                    <Icon className="size-7 2xl:size-8" />
                  </span>
                  <span className="mt-5 block font-heading text-2xl font-bold 2xl:text-3xl">{item.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground 2xl:text-base 2xl:leading-7">{item.desc}</span>
                  <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-brand-700 2xl:text-base">
                    {item.cta} {item.external ? <ExternalLink className="size-4" /> : <ArrowRight className="size-4" />}
                  </span>
                </>
              );
              return (
                <Reveal key={item.title} delay={i * 0.06}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-full min-h-72 flex-col rounded-3xl border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 2xl:min-h-80 2xl:p-9"
                    >
                      {content}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="group flex h-full min-h-72 flex-col rounded-3xl border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 2xl:min-h-80 2xl:p-9"
                    >
                      {content}
                    </Link>
                  )}
                </Reveal>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl border bg-secondary/35 p-5 sm:p-6 2xl:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-heading text-xl font-bold 2xl:text-2xl">NDC services requested by MLGRD</p>
                <p className="mt-1 text-sm text-muted-foreground 2xl:text-base">
                  A quick citizen-friendly service list based on the NDC note shared for review.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[560px]">
                {ndcServiceHighlights.map((item) => (
                  <span key={item} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm 2xl:text-base">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Services ───── */}
      <section className="py-20 2xl:py-24">
        <div className="container-gov 2xl:max-w-[1540px]">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">How can we help?</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl 2xl:text-5xl">Services for citizens &amp; businesses</h2>
            <p className="mt-3 text-muted-foreground 2xl:text-lg">Everything you need to engage with your local authority, in one place.</p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:gap-7">
            {services.map((s, i) => {
              const CardTag = s.external ? "a" : Link;
              return (
                <Reveal key={s.href} delay={(i % 3) * 0.06}>
                  <CardTag
                    href={s.href}
                    {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex h-full min-h-56 flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg 2xl:min-h-64 2xl:p-8"
                  >
                    <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white 2xl:size-14">
                      <s.icon className="size-6 2xl:size-7" />
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-bold 2xl:text-2xl">{s.title}</h3>
                    <p className="mt-1.5 flex-1 text-sm text-muted-foreground 2xl:text-base 2xl:leading-7">{s.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 2xl:text-base">
                      Learn more <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardTag>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Directories ───── */}
      <section className="bg-ink py-20 text-ink-foreground 2xl:py-24">
        <div className="container-gov 2xl:max-w-[1540px]">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Local authorities</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold text-white sm:text-4xl">Find your local authority</h2>
            <p className="mt-3 text-white/70">Browse Guyana&apos;s Neighborhood Democratic Councils, Regional Democratic Councils, Municipalities and REO appointment options.</p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:gap-7">
            {directories.map((d, i) => (
              <Reveal key={d.href} delay={i * 0.08}>
                <Link
                  href={d.href}
                  className="group relative flex h-full min-h-64 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-colors hover:border-gold/40 hover:bg-white/[0.07] 2xl:min-h-72 2xl:p-9"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <d.icon className="size-6 2xl:size-7" />
                  </div>
                  <span className="mt-5 text-xs font-semibold uppercase tracking-wider text-gold/80">{d.count}</span>
                  <h3 className="mt-1 font-heading text-xl font-bold text-white 2xl:text-2xl">{d.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-white/75 2xl:text-base 2xl:leading-7">{d.desc}</p>
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
