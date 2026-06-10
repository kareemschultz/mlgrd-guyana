import { MultiStepForm } from "@/components/forms/multi-step-form";
import type { formConfigs } from "@/components/forms/configs";

/** Maps a service slug to its multi-step form id (used by the service detail page). */
const SLOT: Record<string, keyof typeof formConfigs> = {
  "reporting-local-problems": "report-problem",
  "vendor-and-supplier-enquiries": "vendor-enquiry",
};

export function serviceHasForm(slug: string) {
  return slug in SLOT;
}

export function ServiceFormSlot({ slug }: { slug: string }) {
  const id = SLOT[slug];
  if (!id) return null;
  return (
    <div id="form" className="scroll-mt-24">
      <MultiStepForm configId={id} />
    </div>
  );
}
