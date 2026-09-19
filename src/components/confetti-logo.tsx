"use client"

import { useState, type CSSProperties } from "react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { content } from "@/config/content"
import { uiConfig } from "@/config/ui"

const { count, distancePx } = uiConfig.confetti

const particles = Array.from({ length: count }, (_, index) => {
  const angle = (index / count) * 2 * Math.PI
  const added = index % 2 === 0
  return {
    symbol: added ? content.brand.confetti.added : content.brand.confetti.removed,
    className: added ? "text-added" : "text-removed",
    style: {
      "--confetti-x": `${Math.cos(angle) * distancePx}px`,
      "--confetti-y": `${Math.sin(angle) * distancePx}px`,
    } as CSSProperties,
  }
})

export function ConfettiLogo() {
  const [burst, setBurst] = useState(0)

  function celebrate() {
    if (!window.matchMedia(uiConfig.reducedMotionQuery).matches) setBurst((value) => value + 1)
  }

  return (
    <Button variant="ghost" size="icon-sm" aria-label={content.brand.celebrate} onClick={celebrate}>
      <Logo />
      {burst > 0 &&
        particles.map((particle, index) => (
          <span
            key={`${burst}-${index}`}
            aria-hidden
            className={`pointer-events-none absolute top-1/2 left-1/2 animate-confetti font-mono font-bold ${particle.className}`}
            style={particle.style}
          >
            {particle.symbol}
          </span>
        ))}
    </Button>
  )
}
