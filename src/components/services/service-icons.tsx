import {
  Hammer,
  ReceiptText,
  FileText,
  HandHelping,
  Megaphone,
  Briefcase,
  Building2,
  type LucideIcon,
} from "lucide-react";

/** Maps each service slug to a representative lucide icon. */
export const serviceIcons: Record<string, LucideIcon> = {
  "building-permits": Hammer,
  "business-licences": ReceiptText,
  "rates-and-taxes-guidance": FileText,
  "community-projects": HandHelping,
  "reporting-local-problems": Megaphone,
  "vendor-and-supplier-enquiries": Briefcase,
};

/** Falls back to a neutral building icon for unknown slugs. */
export function getServiceIcon(slug: string): LucideIcon {
  return serviceIcons[slug] ?? Building2;
}
