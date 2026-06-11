"use client"

import React, { useMemo } from "react"

import { cn } from "@/lib/utils"

interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  className?: string
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) => {
  const meteorStyles = useMemo<Array<React.CSSProperties>>(
    () =>
      [...new Array(number)].map((_, index) => {
        const ratio = (index + 1) / (number + 1);
        const duration = minDuration + ((index * 7) % 10) / 10 * (maxDuration - minDuration);
        const delay = minDelay + ((index * 5) % 10) / 10 * (maxDelay - minDelay);
        return {
          "--angle": -angle + "deg",
          top: "-5%",
          left: `calc(${Math.round(ratio * 100)}% - 24px)`,
          animationDelay: delay + "s",
          animationDuration: duration + "s",
        } as React.CSSProperties;
      }),
    [number, minDelay, maxDelay, minDuration, maxDuration, angle],
  )

  return (
    <>
      {[...meteorStyles].map((style, idx) => (
        // Meteor Head
        <span
          key={idx}
          style={{ ...style }}
          className={cn(
            "animate-meteor pointer-events-none absolute size-0.5 rotate-(--angle) rounded-full bg-zinc-500 shadow-[0_0_0_1px_#ffffff10]",
            className
          )}
        >
          {/* Meteor Tail */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-12.5 -translate-y-1/2 bg-linear-to-r from-zinc-500 to-transparent" />
        </span>
      ))}
    </>
  )
}
