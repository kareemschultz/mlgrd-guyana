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
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-40 size-14 rounded-full border-2 border-white bg-[#25D366] p-0 font-heading font-bold text-white shadow-xl shadow-emerald-950/25 transition hover:-translate-y-0.5 hover:bg-[#1fb85a] [&_svg]:size-7 sm:bottom-5 sm:right-20 sm:h-12 sm:w-auto sm:px-4 sm:[&_svg]:size-5"
    >
      <span className="hidden sm:inline">WhatsApp Helpdesk</span>
    </StudioMessagesButton>
  );
}
