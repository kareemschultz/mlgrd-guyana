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
import { cn } from "@/lib/utils";

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

export function ServiceIcon({ slug, className }: { slug: string; className?: string }) {
  const classes = cn(className);
  switch (slug) {
    case "building-permits":
      return <Hammer className={classes} />;
    case "business-licences":
      return <ReceiptText className={classes} />;
    case "rates-and-taxes-guidance":
      return <FileText className={classes} />;
    case "community-projects":
      return <HandHelping className={classes} />;
    case "reporting-local-problems":
      return <Megaphone className={classes} />;
    case "vendor-and-supplier-enquiries":
      return <Briefcase className={classes} />;
    default:
      return <Building2 className={classes} />;
  }
}
