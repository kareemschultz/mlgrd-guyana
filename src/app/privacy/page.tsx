import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Mail } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { LegalSection } from "@/components/misc/legal-section";
import { ministry } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How the Ministry of Local Government & Regional Development, Guyana collects, uses and protects personal information submitted through this website.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        lead="How we handle the information you share with us through this website, and the rights you have over your personal data."
        crumbs={[{ label: "Privacy" }]}
      />

      <section className="py-16 sm:py-20">
        <div className="container-gov max-w-3xl">
          <Reveal className="mb-10 flex items-center gap-3 rounded-xl border bg-secondary/40 px-5 py-4 text-sm text-muted-foreground">
            <ShieldCheck className="size-5 shrink-0 text-brand-600" />
            <span>
              We collect only the minimum information needed to provide our
              services, and we never sell your personal data.
            </span>
          </Reveal>

          <div className="space-y-10">
            <LegalSection title="Introduction">
              <p>
                The Ministry of Local Government &amp; Regional Development
                (&quot;the Ministry&quot;, &quot;we&quot;, &quot;us&quot;) is
                committed to protecting your privacy. This policy explains what
                information we collect through this website, how we use and store
                it, and the choices available to you. It applies to this website
                only.
              </p>
            </LegalSection>

            <LegalSection title="Information we collect" delay={0.04}>
              <p>
                We collect personal information that you choose to provide through
                forms on this site — for example when you contact us, submit an
                enquiry, or report a local problem. Depending on the form, this
                may include your name, email address, telephone number, the
                location relevant to your request, and the content of your
                message.
              </p>
              <p>
                We do not require you to create an account to browse this website,
                and we do not knowingly collect more information than is necessary
                for the service you are requesting.
              </p>
            </LegalSection>

            <LegalSection title="How we use your information" delay={0.06}>
              <p>We use the information you provide to:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>respond to your enquiries and requests for assistance;</li>
                <li>
                  route reported problems to the responsible local authority;
                </li>
                <li>process applications and provide the services you request;</li>
                <li>
                  improve the quality and accessibility of our services and this
                  website.
                </li>
              </ul>
              <p>
                We use your information only for the purposes for which it was
                provided, unless we are required to do otherwise by law.
              </p>
            </LegalSection>

            <LegalSection title="How we store and protect your information" delay={0.08}>
              <p>
                We take reasonable administrative and technical measures to
                protect personal information against loss, misuse and unauthorised
                access. Information is retained only for as long as needed to
                fulfil the purpose for which it was collected, or as required by
                applicable law and public-records obligations.
              </p>
            </LegalSection>

            <LegalSection title="Sharing of information" delay={0.1}>
              <p>
                We do not sell, rent or trade your personal information. We may
                share information with the relevant local democratic organ or
                government body where this is necessary to deliver the service you
                have requested, or where we are required to do so by law.
              </p>
            </LegalSection>

            <LegalSection title="Cookies and tracking" delay={0.12}>
              <p>
                This website is designed to use minimal or no tracking. We do not
                use cookies to build advertising profiles of visitors. Any cookies
                that may be used are limited to those necessary for the site to
                function correctly. You can control cookies through your browser
                settings at any time.
              </p>
            </LegalSection>

            <LegalSection title="Your rights and data requests" delay={0.14}>
              <p>
                You may ask us what personal information we hold about you, request
                that it be corrected, or ask that it be deleted where there is no
                legal requirement to retain it. To make such a request, please
                contact us using the details below.
              </p>
            </LegalSection>

            <LegalSection title="Changes to this policy" delay={0.16}>
              <p>
                We may update this policy from time to time to reflect changes in
                our services or legal obligations. Any updates will be published on
                this page.
              </p>
            </LegalSection>

            <LegalSection title="Contact us" delay={0.18}>
              <p>
                If you have questions about this policy or wish to make a data
                request, please contact the Ministry:
              </p>
              <div className="mt-2 rounded-xl border bg-card p-5 text-sm not-italic text-foreground">
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
