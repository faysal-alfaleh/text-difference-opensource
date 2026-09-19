"use client"

import { useId, useRef, useState, type CSSProperties } from "react"
import { flushSync } from "react-dom"
import { ArrowLeftRightIcon, PencilIcon, XIcon } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { DiffViewer } from "@/components/diff-viewer"
import { TextEditor } from "@/components/text-editor"
import { UpdateDialog } from "@/components/update-dialog"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { content } from "@/config/content"
import { diffConfig, type DiffSettings } from "@/config/diff"
import { useAppUpdate } from "@/hooks/use-app-update"

export function DiffChecker() {
  const id = useId()
  const [original, setOriginal] = useState("")
  const [changed, setChanged] = useState("")
  const [isComparing, setIsComparing] = useState(false)
  const [settings, setSettings] = useState<DiffSettings>(diffConfig.defaultSettings)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const appUpdate = useAppUpdate()
  const canCompare = original !== "" || changed !== ""
  const textSize = diffConfig.textSizes[settings.textSize]
  const textSizeStyle = {
    "--content-font-size": textSize.fontSize,
    "--content-line-height": textSize.lineHeight,
  } as CSSProperties

  function showComparison(comparing: boolean) {
    flushSync(() => setIsComparing(comparing))
    window.scrollTo({ top: 0 })
    headingRef.current?.focus()
  }

  function swap() {
    setOriginal(changed)
    setChanged(original)
  }

  function clear() {
    setOriginal("")
    setChanged("")
    showComparison(false)
  }

  return (
    <SidebarProvider>
      <AppSidebar
        settings={settings}
        onSettingsChange={setSettings}
        updateVersion={appUpdate.update?.version}
        onShowUpdate={() => appUpdate.setOpen(true)}
      />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-center" />
          <h1 ref={headingRef} tabIndex={-1} className="truncate text-base font-medium outline-none">
            {isComparing ? content.result.title : content.editor.title}
          </h1>
          {isComparing && (
            <ButtonGroup className="ml-auto">
              <Button variant="outline" onClick={() => showComparison(false)}>
                <PencilIcon />
                <span className="max-sm:sr-only">{content.actions.edit}</span>
              </Button>
              <Button variant="outline" onClick={swap}>
                <ArrowLeftRightIcon />
                <span className="max-sm:sr-only">{content.actions.swap}</span>
              </Button>
              <Button variant="outline" onClick={clear}>
                <XIcon />
                <span className="max-sm:sr-only">{content.actions.clear}</span>
              </Button>
            </ButtonGroup>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4" style={textSizeStyle}>
          {isComparing ? (
            <DiffViewer original={original} changed={changed} settings={settings} />
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <TextEditor
                  id={`${id}-original`}
                  label={content.editor.original}
                  placeholder={content.editor.placeholders.original}
                  value={original}
                  onChange={setOriginal}
                />
                <TextEditor
                  id={`${id}-changed`}
                  label={content.editor.changed}
                  placeholder={content.editor.placeholders.changed}
                  value={changed}
                  onChange={setChanged}
                />
              </div>
              <Button
                size="lg"
                className="self-center"
                disabled={!canCompare}
                onClick={() => showComparison(true)}
              >
                {content.actions.compare}
              </Button>
            </>
          )}
        </div>
      </SidebarInset>
      {appUpdate.update && (
        <UpdateDialog
          update={appUpdate.update}
          open={appUpdate.open}
          onOpenChange={appUpdate.setOpen}
          onInstall={appUpdate.install}
          onOpenRelease={appUpdate.openRelease}
        />
      )}
    </SidebarProvider>
  )
}
