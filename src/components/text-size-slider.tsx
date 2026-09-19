"use client"

import type { MouseEvent } from "react"

import { Slider } from "@/components/ui/slider"
import { content } from "@/config/content"
import { diffConfig, textSizes, type TextSize } from "@/config/diff"
import { cn } from "@/lib/utils"

type TextSizeSliderProps = {
  labelId: string
  value: TextSize
  onChange: (value: TextSize) => void
}

const lastStep = textSizes.length - 1

function stepPosition(step: number) {
  return `${(step / lastStep) * 100}%`
}

export function TextSizeSlider({ labelId, value, onChange }: TextSizeSliderProps) {
  const selectedStep = textSizes.indexOf(value)

  function handleLabelClick(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const fraction = (event.clientX - rect.left) / rect.width
    const step = Math.min(Math.max(Math.round(fraction * lastStep), 0), lastStep)
    onChange(textSizes[step])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Slider
          min={0}
          max={lastStep}
          step={1}
          value={[selectedStep]}
          onValueChange={([step]) => onChange(textSizes[step])}
          aria-labelledby={labelId}
          aria-valuetext={content.settings.textSizes[value]}
          className="cursor-pointer px-2 py-1.5"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-2 top-1/2">
          {textSizes.map((size, step) => (
            <span
              key={size}
              className={cn(
                "absolute size-2.5 -translate-1/2 rounded-full",
                step <= selectedStep ? "bg-primary" : "bg-muted-foreground/50"
              )}
              style={{ left: stepPosition(step) }}
            />
          ))}
        </div>
      </div>
      <div aria-hidden onClick={handleLabelClick} className="relative mx-2 h-6 cursor-pointer">
        {textSizes.map((size, step) => (
          <span
            key={size}
            className={cn(
              "absolute bottom-0 -translate-x-1/2 leading-none transition-colors hover:text-foreground",
              step === selectedStep ? "text-foreground" : "text-muted-foreground"
            )}
            style={{ left: stepPosition(step), fontSize: diffConfig.textSizes[size].fontSize }}
          >
            {content.settings.textSizeSample}
          </span>
        ))}
      </div>
    </div>
  )
}
