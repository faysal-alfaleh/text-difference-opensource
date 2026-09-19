"use client"

import { useMemo } from "react"
import { DownloadIcon, ExternalLinkIcon, ShieldCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Item, ItemContent, ItemDescription, ItemMedia } from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { content } from "@/config/content"
import { siteConfig } from "@/config/site"
import type { AvailableUpdate } from "@/hooks/use-app-update"
import { parseReleaseNotes } from "@/lib/release-notes"

type UpdateDialogProps = {
  update: AvailableUpdate
  open: boolean
  onOpenChange: (open: boolean) => void
  onInstall: () => void
  onOpenRelease: () => void
}

export function UpdateDialog({
  update,
  open,
  onOpenChange,
  onInstall,
  onOpenRelease,
}: UpdateDialogProps) {
  const sections = useMemo(() => parseReleaseNotes(update.notes), [update.notes])
  const isBusy = update.status === "downloading" || update.status === "installing"
  const progressLabel =
    update.status === "installing" ? content.update.installing : content.update.downloading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle>{content.update.title}</DialogTitle>
          <DialogDescription>
            {siteConfig.name} {content.version.prefix}
            {update.version}
          </DialogDescription>
        </DialogHeader>
        {sections.length > 0 && (
          <div className="flex max-h-60 flex-col gap-3 overflow-y-auto">
            <p className="font-medium">{content.update.whatsNew}</p>
            {sections.map((section) => (
              <div key={section.title} className="flex flex-col gap-1">
                {section.title && (
                  <p className="text-xs font-medium text-muted-foreground">{section.title}</p>
                )}
                <ul className="flex list-disc flex-col gap-1 pl-5">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <Item variant="outline" size="sm" className="items-start">
          <ItemMedia variant="icon">
            <ShieldCheckIcon />
          </ItemMedia>
          <ItemContent className="gap-2">
            <ItemDescription className="line-clamp-none">{content.update.trust}</ItemDescription>
            <Button variant="outline" size="sm" className="self-start" onClick={onOpenRelease}>
              <ExternalLinkIcon />
              {content.update.viewOnGitHub}
            </Button>
          </ItemContent>
        </Item>
        {isBusy && (
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">{progressLabel}</p>
            <Progress value={update.progress} />
          </div>
        )}
        {update.status === "failed" && (
          <p className="text-destructive">{content.update.failed}</p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{content.update.later}</Button>
          </DialogClose>
          <Button onClick={onInstall} disabled={isBusy}>
            <DownloadIcon />
            {content.update.install}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
