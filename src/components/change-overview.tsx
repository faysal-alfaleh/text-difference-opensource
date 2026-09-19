"use client"

import type { MouseEvent } from "react"

import type { ChangeKind, ChangeMarker } from "@/hooks/use-change-markers"
import { cn } from "@/lib/utils"

const lanes = [
  { kinds: ["removed", "modified"], color: "bg-removed/70" },
  { kinds: ["added", "modified"], color: "bg-added/70" },
] as const satisfies readonly { kinds: readonly ChangeKind[]; color: string }[]

type ChangeOverviewProps = {
  markers: ChangeMarker[]
  onNavigate: (fraction: number) => void
}

export function ChangeOverview({ markers, onNavigate }: ChangeOverviewProps) {
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    onNavigate((event.clientY - rect.top) / rect.height)
  }

  return (
    <div aria-hidden className="relative w-5 shrink-0 max-md:hidden">
      <div className="absolute inset-0">
        <div
          onClick={handleClick}
          className="sticky top-18 grid h-[calc(100svh-5.5rem)] max-h-full cursor-pointer grid-cols-2 gap-0.5 rounded-sm bg-muted p-0.5"
        >
          {lanes.map(({ kinds, color }) => (
            <div key={color} className="relative">
              {markers
                .filter((marker) => kinds.some((kind) => kind === marker.kind))
                .map((marker) => (
                  <div
                    key={marker.top}
                    className={cn("absolute inset-x-0 min-h-1 rounded-full", color)}
                    style={{ top: `${marker.top * 100}%`, height: `${marker.height * 100}%` }}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
