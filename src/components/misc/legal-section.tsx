import type { ReactNode } from "react";
import { Reveal } from "@/components/site/reveal";

/**
 * A single titled block within a legal/policy page (Privacy, Accessibility).
 * Server-friendly wrapper around Reveal for consistent spacing and headings.
 */
export function LegalSection({
  id,
  title,
  children,
  delay = 0,
}: {
  id?: string;
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <Reveal as="section" delay={delay} className="scroll-mt-24">
      {id && <span id={id} className="sr-only" />}
      <h2 className="font-heading text-xl font-extrabold sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
        {children}
      </div>
    </Reveal>
  );
}
