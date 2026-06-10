"use client";

/**
 * AnimatedList — a lightweight, accessible animated list primitive in the
 * Magic UI tradition, adapted to the MLGRD admin. Children mount with a soft
 * staggered blur-rise on scroll-into-view; `prefers-reduced-motion` collapses
 * the motion to a plain fade (the global MotionConfig also damps it).
 *
 * Unlike the Magic UI marquee-style ticker, this is a *static, ordered* list
 * suitable for real data (posts, messages, officials) — every item is rendered
 * and individually focusable; only the entrance is animated.
 */
import * as React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const itemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

export function AnimatedList({
  children,
  className,
  as = "ul",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "ul" | "ol" | "div";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];
  // Keep the DOM valid: animate <li> children directly inside ul/ol, and use a
  // <div> wrapper inside a div container.
  const ItemTag = as === "div" ? motion.div : motion.li;
  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -4% 0px" }}
    >
      {React.Children.map(children, (child, i) => (
        <ItemTag key={i} variants={reduce ? itemReduced : item}>
          {child}
        </ItemTag>
      ))}
    </MotionTag>
  );
}

/**
 * AnimatedListItem — opt-in row wrapper that adds a gentle hover lift + a
 * gold "rail" accent on the left edge, giving plain rows a premium,
 * studio-list feel. Honours reduced motion.
 */
export function AnimatedListItem({
  children,
  className,
  onClick,
  accent = "gold",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  accent?: "gold" | "brand" | "ink";
}) {
  const reduce = useReducedMotion();
  const railColor =
    accent === "brand"
      ? "before:bg-brand"
      : accent === "ink"
        ? "before:bg-ink"
        : "before:bg-gold";

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-colors",
        "before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:opacity-0 before:transition-opacity",
        "hover:border-gold/40 hover:shadow-md hover:before:opacity-100",
        railColor,
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
