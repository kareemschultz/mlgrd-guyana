"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

/** Global client providers. Honours the user's reduced-motion preference. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
    </MotionConfig>
  );
}
