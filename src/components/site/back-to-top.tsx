"use client";

/**
 * Floating "back to top" button — appears once the visitor scrolls down a
 * screenful, scrolls smoothly to the top on click. Hidden on /admin (the admin
 * renders its own chrome) and respects prefers-reduced-motion.
 */
import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
          }
          aria-label="Back to top"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
          whileHover={reduce ? undefined : { y: -2 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-5 z-40 flex size-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-900/20 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 sm:bottom-5"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
