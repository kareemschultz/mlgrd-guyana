"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the public site chrome (header/footer) on back-office routes like /admin,
 * which render their own full-screen dashboard shell. Everywhere else it's a
 * transparent pass-through.
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
