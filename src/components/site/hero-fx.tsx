"use client";

import { useEffect, useState } from "react";
import { Meteors } from "@/components/ui/meteors";
import { FloatingMotifs } from "@/components/site/floating-motifs";

/**
 * Purely-decorative hero animations (meteors + floating ministry motifs),
 * mounted AFTER first paint so they never block the hero's largest-contentful
 * paint or compete for the main thread during hydration. They're absolutely
 * positioned behind the content, so deferring them causes no layout shift.
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
  return (
    <>
      <Meteors number={14} />
      <FloatingMotifs preset="hero" className="text-white/[0.07]" />
    </>
  );
}
