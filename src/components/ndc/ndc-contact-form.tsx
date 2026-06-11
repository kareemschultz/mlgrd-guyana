"use client";

/**
 * "Contact this NDC" — shown on each NDC detail page. Renders the shared
 * multi-step form engine with a config scoped to this council, so an NDC
 * enquiry looks and behaves like every other form on the site instead of being
 * a one-off. Submissions land in the admin inbox tagged "NDC — <name>
 * (<region>)" and route centrally for now (per the client); per-NDC email
 * routing can be added later in the data layer / API.
 */
import * as React from "react";
import { MessageSquareText } from "lucide-react";

import { MultiStepForm } from "@/components/forms/multi-step-form";
import { makeNdcConfig } from "@/components/forms/configs";

export function NdcContactForm({
  ndcName,
  region,
  regionName,
}: {
  ndcName: string;
  region: string;
  regionName: string;
}) {
  const config = React.useMemo(
    () => makeNdcConfig(ndcName, region, regionName),
    [ndcName, region, regionName],
  );

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand-600">
          <MessageSquareText className="size-5" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-bold">Contact this NDC</h2>
          <p className="text-sm text-muted-foreground">
            Send an enquiry to {ndcName}. It&rsquo;s routed to the Ministry, who
            will respond.
          </p>
        </div>
      </div>
      <MultiStepForm config={config} />
    </div>
  );
}
