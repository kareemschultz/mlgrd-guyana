import type { ComponentProps, ReactNode } from "react";
import { MessageCircleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Adapted from Shadcn Studio `@ss-components/button-21`.
 * Original pattern: icon button with a messages badge.
 */
type StudioMessagesButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  href: string;
  children?: ReactNode;
  badge?: string;
  ariaLabel?: string;
};

export function StudioMessagesButton({
  href,
  children = "Messages",
  badge = "",
  ariaLabel,
  ...props
}: StudioMessagesButtonProps) {
  return (
    <Button asChild variant="outline" {...props}>
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
        <MessageCircleIcon />
        {children}
        {badge ? (
          <Badge variant="destructive" className="px-1.5 py-px">
            {badge}
          </Badge>
        ) : null}
      </a>
    </Button>
  );
}

export default StudioMessagesButton;
