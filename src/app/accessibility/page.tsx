import type { Metadata } from "next";
import Link from "next/link";
import {
  Accessibility as AccessibilityIcon, Code2, Keyboard, Eye, Activity, Mail,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { LegalSection } from "@/components/misc/legal-section";
import { ministry } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "Our commitment to making this Ministry of Local Government & Regional Development website accessible to everyone, targeting WCAG 2.1 AA, and how to report accessibility issues.",
};

const measures = [
  {
    icon: Code2,
    title: "Semantic HTML",
    desc: "Pages are built with meaningful, structured markup and proper headings so assistive technologies can interpret content reliably.",
  },
  {
    icon: Keyboard,
    title: "Keyboard navigation",
    desc: "All interactive elements can be reached and operated using a keyboard, with a visible skip-to-content link and clear focus states.",
  },
  {
    icon: Eye,
    title: "Colour contrast",
    desc: "Text and interface colours are chosen to meet contrast guidelines, supporting readability for users with low vision.",
  },
  {
    icon: Activity,
    title: "Reduced motion",
    desc: "Animations respect the operating-system 'reduce motion' preference, minimising movement for users who are sensitive to it.",
  },
];

export default function AccessibilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Accessibility statement"
        lead="We are committed to ensuring this website is usable by everyone, including people with disabilities."
        crumbs={[{ label: "Accessibility" }]}
      />

      <section className="py-16 sm:py-20">
        <div className="container-gov max-w-3xl">
          <Reveal className="mb-10 flex items-center gap-3 rounded-xl border bg-secondary/40 px-5 py-4 text-sm text-muted-foreground">
            <AccessibilityIcon className="size-5 shrink-0 text-brand-600" />
            <span>
              This site aims to conform with the Web Content Accessibility
              Guidelines (WCAG) 2.1 at Level AA.
            </span>
          </Reveal>

          <div className="space-y-10">
            <LegalSection title="Our commitment">
              <p>
                The Ministry of Local Government &amp; Regional Development is
                committed to providing a website that is accessible to the widest
                possible audience, regardless of ability or technology. We aim to
                meet the Web Content Accessibility Guidelines (WCAG) 2.1 at Level
                AA and to continually improve the experience for all users.
              </p>
            </LegalSection>
          </div>

          {/* Measures taken */}
          <Reveal className="mt-12">
            <h2 className="font-heading text-xl font-extrabold sm:text-2xl">
              Measures we have taken
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {measures.map((m, i) => (
              <Reveal key={m.title} delay={(i % 2) * 0.06}>
                <div className="flex h-full flex-col rounded-2xl border bg-card p-6">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-brand/10 text-brand-600">
                    <m.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-base font-bold">
                    {m.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {m.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 space-y-10">
            <LegalSection title="Ongoing improvement" delay={0.04}>
              <p>
                Accessibility is an ongoing effort. We routinely review our pages,
                test with assistive technologies and keyboard navigation, and
                refine our design system to address any barriers we identify.
                Some content may not yet fully meet our target standard, and we
                are working to resolve such issues as we find them.
              </p>
            </LegalSection>

            <LegalSection title="Reporting accessibility issues" delay={0.06}>
              <p>
                We welcome your feedback. If you encounter a barrier on this
                website, or need information in an alternative format, please let
                us know. Where possible, include the page address and a
                description of the problem so we can investigate and respond.
              </p>
              <div className="mt-2 rounded-xl border bg-card p-5 text-sm text-foreground">
                <p className="font-heading font-bold">{ministry.name}</p>
                <p className="mt-1 text-muted-foreground">{ministry.address}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                  <span>Tel: {ministry.phone}</span>
                  <a
                    href={`mailto:${ministry.email}`}
                    className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
                  >
                    <Mail className="size-4" /> {ministry.email}
                  </a>
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline"
                >
                  Visit our contact page →
                </Link>
              </div>
            </LegalSection>
          </div>
        </div>
      </section>
    </>
  );
}
