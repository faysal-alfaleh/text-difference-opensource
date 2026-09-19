"use client"

import { useEffect, useRef, useState } from "react"
import { CheckIcon, CopyIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { content } from "@/config/content"
import { diffConfig } from "@/config/diff"

type CopyStatus = "idle" | "copied" | "failed"

const statuses = {
  idle: { icon: CopyIcon, label: content.actions.copy },
  copied: { icon: CheckIcon, label: content.actions.copied },
  failed: { icon: XIcon, label: content.actions.copyFailed },
} satisfies Record<CopyStatus, { icon: typeof CopyIcon; label: string }>

type CopyButtonProps = {
  text: string
  target: string
}

export function CopyButton({ text, target }: CopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle")
  const resetTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const { icon: Icon, label } = statuses[status]

  useEffect(() => () => clearTimeout(resetTimeout.current), [])

  async function handleCopy() {
    clearTimeout(resetTimeout.current)
    try {
      await navigator.clipboard.writeText(text)
      setStatus("copied")
    } catch {
      setStatus("failed")
    }
    resetTimeout.current = setTimeout(() => setStatus("idle"), diffConfig.copyFeedbackDurationMs)
  }

  return (
    <Button variant="ghost" onClick={handleCopy}>
      <Icon />
      <span className="max-sm:sr-only">{label}</span>{" "}
      <span className="sr-only">{target}</span>
    </Button>
  )
}
