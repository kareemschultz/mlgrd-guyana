"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * On-brand toast.
 *
 * Ministry palette via sonner's per-type CSS vars (leaf-green success,
 * flag-red error, brand info, gold warning) plus a left accent bar, branded
 * radius/shadow and a `font-heading` title. Legibility kept: solid card
 * background, coloured accent + icon rather than coloured fills.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group !rounded-xl !border-l-4 !shadow-lg !shadow-black/5 backdrop-blur-sm",
          title: "font-heading !font-semibold",
          description: "!text-muted-foreground",
          // Tone accents: left border + icon colour per type.
          success:
            "!border-l-[var(--leaf)] [&_[data-icon]]:!text-[var(--leaf)]",
          error:
            "!border-l-[var(--flag-red)] [&_[data-icon]]:!text-[var(--flag-red)]",
          info: "!border-l-[var(--brand)] [&_[data-icon]]:!text-[var(--brand)]",
          warning:
            "!border-l-[var(--gold)] [&_[data-icon]]:!text-[color-mix(in_oklab,var(--gold)_80%,#000)]",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "var(--popover)",
          "--success-text": "var(--popover-foreground)",
          "--error-bg": "var(--popover)",
          "--error-text": "var(--popover-foreground)",
          "--info-bg": "var(--popover)",
          "--info-text": "var(--popover-foreground)",
          "--warning-bg": "var(--popover)",
          "--warning-text": "var(--popover-foreground)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
