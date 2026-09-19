"use client"

import { useRef, type ChangeEvent, type UIEvent } from "react"
import { UploadIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { content } from "@/config/content"
import { countEditorLines } from "@/lib/diff"

type TextEditorProps = {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function TextEditor({ id, label, placeholder, value, onChange }: TextEditorProps) {
  const gutterRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const latestRead = useRef(0)
  const lineNumbers = Array.from(
    { length: countEditorLines(value) },
    (_, index) => index + 1
  ).join("\n")

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    const read = ++latestRead.current
    const text = await file.text().catch(() => null)
    if (text !== null && read === latestRead.current) onChange(text)
  }

  function handleScroll(event: UIEvent<HTMLTextAreaElement>) {
    if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop
  }

  return (
    <div className="min-w-0">
      <InputGroup className="overflow-hidden">
        <InputGroupAddon align="block-start" className="border-b">
          <Label htmlFor={id} className="text-foreground">
            {label}
          </Label>
          <InputGroupButton size="sm" className="ml-auto" onClick={() => fileInputRef.current?.click()}>
            <UploadIcon />
            {content.editor.openFile}{" "}
            <span className="sr-only">{label}</span>
          </InputGroupButton>
        </InputGroupAddon>
        <div className="flex h-[65svh] min-h-80 w-full">
          <div
            ref={gutterRef}
            aria-hidden
            className="shrink-0 overflow-hidden border-r bg-muted/50 px-3 pt-2 pb-8 text-right font-mono text-xs leading-(--content-line-height) whitespace-pre text-muted-foreground tabular-nums select-none"
          >
            {lineNumbers}
          </div>
          <InputGroupTextarea
            id={id}
            value={value}
            placeholder={placeholder}
            wrap="off"
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => onChange(event.target.value)}
            onScroll={handleScroll}
            className="field-sizing-fixed h-full min-h-0 px-3 font-mono text-base leading-(--content-line-height) whitespace-pre placeholder:font-sans md:text-(length:--content-font-size)"
          />
        </div>
      </InputGroup>
      <Input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
    </div>
  )
}
