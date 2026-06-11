"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const variants: Variants = {
  // Keep the motion, but never gate readability behind a fully hidden state.
  // Starting at near-visible opacity prevents blank exported/static sections in
  // screenshots, slow browsers, and reduced/blocked IntersectionObserver cases.
  hidden: { opacity: 0.96, y: 14, scale: 0.995, filter: "blur(2px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
};

/**
 * Scroll-reveal wrapper. Renders identically on server and client (no
 * client-only branching) to avoid hydration mismatches. Reduced-motion is
 * honoured globally via <MotionConfig reducedMotion="user"> in Providers,
 * which makes motion skip the animation while still applying the final
 * (visible) state.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
