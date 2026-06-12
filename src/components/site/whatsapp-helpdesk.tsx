"use client";

import { usePathname } from "next/navigation";
import { StudioMessagesButton } from "@/components/shadcn-studio/button/button-21";
import { ministry } from "@/lib/site";

/**
 * Persistent WhatsApp chatbot shortcut for citizens who need help quickly.
 * The Ministry uses this WhatsApp Business number as the public chatbot/helpdesk
 * entry point, so keep it available across public pages but out of admin chrome.
 */
export function WhatsAppHelpdesk() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <StudioMessagesButton
      href={ministry.whatsapp.url}
      badge="Help"
      ariaLabel="Message the Ministry helpdesk on WhatsApp"
      className="fixed bottom-20 right-5 z-40 h-12 rounded-full bg-[#25D366] px-4 font-heading font-bold text-white shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-[#1fb85a] sm:bottom-5 sm:right-20"
    >
      <span className="hidden sm:inline">WhatsApp Helpdesk</span>
    </StudioMessagesButton>
  );
}
