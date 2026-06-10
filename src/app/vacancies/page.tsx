import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase, Inbox, Scale, ClipboardList, Building2, Wrench,
  Calculator, Users, ArrowRight, Mail,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ministry } from "@/lib/site";

export const metadata: Metadata = {
  title: "Job Vacancies",
  description:
    "Career and recruitment information for the Ministry of Local Government & Regional Development, Guyana — current openings, how the Ministry recruits, and how to express your interest.",
};

const recruitmentSteps = [
  {
    icon: ClipboardList,
    title: "Open advertisement",
    desc: "Available positions are advertised publicly, with a clear description of the role, responsibilities and the qualifications sought.",
  },
  {
    icon: Scale,
    title: "Fair assessment",
    desc: "Applications are reviewed against the published criteria. Shortlisted candidates may be invited for interview or further assessment.",
  },
  {
    icon: Users,
    title: "Merit-based selection",
    desc: "Appointments are made on merit through transparent, equal-opportunity processes consistent with public-service standards.",
  },
];

const exampleCategories = [
  { icon: Building2, label: "Administration & governance" },
  { icon: Wrench, label: "Engineering & infrastructure" },
  { icon: Calculator, label: "Finance & accounting" },
  { icon: ClipboardList, label: "Planning & development" },
  { icon: Users, label: "Community & social services" },
  { icon: Briefcase, label: "Corporate & support services" },
];

export default function VacanciesPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Job vacancies"
        lead="Opportunities to serve communities across Guyana through the Ministry and its local democratic organs."
        crumbs={[{ label: "Job Vacancies" }]}
      />

      {/* ───── Empty state ───── */}
      <section className="py-16 sm:py-20">
        <div className="container-gov">
          <Reveal>
            <div className="mx-auto max-w-2xl rounded-2xl border border-dashed bg-secondary/40 px-8 py-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand-600">
                <Inbox className="size-7" />
              </div>
              <h2 className="mt-5 font-heading text-2xl font-extrabold">
                There are no current vacancies posted
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                When positions become available, they will be advertised on this
                page. You are welcome to register your interest with the Ministry
                in the meantime.
              </p>
              <Button asChild className="mt-6 bg-brand-600 text-white hover:bg-brand-700">
                <Link href="/contact">
                  Express your interest <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── How the Ministry recruits ───── */}
      <section className="border-t bg-secondary/40 py-16 sm:py-20">
        <div className="container-gov">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              How we recruit
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl">
              An open, merit-based process
            </h2>
            <p className="mt-3 text-muted-foreground">
              The Ministry is committed to fair and transparent recruitment that
              gives every applicant an equal opportunity.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {recruitmentSteps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border bg-card p-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
                    <s.icon className="size-6" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Equal opportunity statement */}
          <Reveal delay={0.1}>
            <div className="mx-auto mt-10 max-w-3xl rounded-2xl border bg-card p-6 text-center sm:p-8">
              <Badge variant="secondary" className="mb-3">
                Equal opportunity
              </Badge>
              <p className="text-muted-foreground">
                The Ministry of Local Government &amp; Regional Development is an
                equal-opportunity employer. We welcome applications from all
                qualified persons without regard to ethnicity, religion, gender,
                age or disability, and we are committed to a workplace that
                reflects the diversity of the communities we serve.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── Example role categories ───── */}
      <section className="py-16 sm:py-20">
        <div className="container-gov">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
              Areas in which we typically recruit
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              The categories below are illustrative only and do not represent
              live openings.
            </p>
          </Reveal>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exampleCategories.map((c, i) => (
              <Reveal key={c.label} delay={(i % 3) * 0.06}>
                <div className="flex items-center gap-3 rounded-xl border bg-card p-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand-600">
                    <c.icon className="size-5" />
                  </div>
                  <span className="text-sm font-semibold">{c.label}</span>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Contact prompt */}
          <Reveal className="mt-12 text-center">
            <div className="mx-auto inline-flex max-w-full flex-col items-center gap-2 rounded-xl border bg-secondary/40 px-6 py-5 sm:flex-row sm:gap-3">
              <Mail className="size-5 text-brand-600" />
              <span className="text-sm text-muted-foreground">
                To register your interest, email{" "}
                <a
                  href={`mailto:${ministry.email}`}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  {ministry.email}
                </a>{" "}
                or call {ministry.phone}.
              </span>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
