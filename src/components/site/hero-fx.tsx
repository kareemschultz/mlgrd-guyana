"use client";

import { useEffect, useState } from "react";
import { FloatingMotifs } from "@/components/site/floating-motifs";

/**
 * Purely-decorative floating ministry motifs behind the hero, mounted AFTER
 * first paint so they never block the hero's largest-contentful paint or compete
 * for the main thread during hydration. Tinted charcoal so they read as subtle
 * line-art on the light (#fffaf0) hero; absolutely positioned behind content.
 */
export function HeroFx() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const idle =
      typeof window !== "undefined" &&
      "requestIdleCallback" in window
        ? (window.requestIdleCallback as (cb: () => void) => number)
        : (cb: () => void) => window.setTimeout(cb, 200);
    const id = idle(() => setShow(true));
    return () => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window.cancelIdleCallback as (h: number) => void)(id as number);
      }
    };
  }, []);

  if (!show) return null;
  return <FloatingMotifs preset="hero" className="text-ink/[0.08]" />;
}
