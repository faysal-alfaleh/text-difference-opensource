import { useEffect, useRef, useState } from "react"
import { isTauri } from "@tauri-apps/api/core"
import type { DownloadEvent, Update } from "@tauri-apps/plugin-updater"

import { releaseConfig } from "@/config/release"
import { releaseUrl } from "@/lib/releases"

export type UpdateStatus = "available" | "downloading" | "installing" | "failed"

export type AvailableUpdate = {
  version: string
  notes: string
  status: UpdateStatus
  progress: number | undefined
}

export function useAppUpdate() {
  const [update, setUpdate] = useState<Update | null>(null)
  const [status, setStatus] = useState<UpdateStatus>("available")
  const [progress, setProgress] = useState<number | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const updateRef = useRef<Update | null>(null)
  const busyRef = useRef(false)

  useEffect(() => {
    if (!isTauri()) return

    let active = true
    let lastCheck = Number.NEGATIVE_INFINITY

    async function checkForUpdate() {
      const now = Date.now()
      if (busyRef.current || now - lastCheck < releaseConfig.updateCheckMinimumIntervalMs) return
      lastCheck = now

      const { check } = await import("@tauri-apps/plugin-updater")
      const found = await check().catch(() => null)
      if (!active || !found || found.version === updateRef.current?.version) return

      await updateRef.current?.close().catch(() => undefined)
      updateRef.current = found
      setUpdate(found)
      setStatus("available")
      setProgress(undefined)
      setOpen(true)
    }

    function handleFocus() {
      void checkForUpdate()
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void checkForUpdate()
    }

    void checkForUpdate()
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      active = false
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  async function install() {
    if (!update) return

    busyRef.current = true
    setStatus("downloading")
    setProgress(0)

    let total = 0
    let received = 0

    function handleEvent(event: DownloadEvent) {
      if (event.event === "Started") {
        total = event.data.contentLength ?? 0
      } else if (event.event === "Progress") {
        received += event.data.chunkLength
        setProgress(total > 0 ? Math.min((received / total) * 100, 100) : undefined)
      } else {
        setStatus("installing")
      }
    }

    try {
      await update.downloadAndInstall(handleEvent)
      const { relaunch } = await import("@tauri-apps/plugin-process")
      await relaunch()
    } catch {
      busyRef.current = false
      setStatus("failed")
    }
  }

  async function openRelease() {
    if (!update) return
    const { openUrl } = await import("@tauri-apps/plugin-opener")
    await openUrl(releaseUrl(update.version)).catch(() => undefined)
  }

  const available: AvailableUpdate | null = update
    ? { version: update.version, notes: update.body ?? "", status, progress }
    : null

  return { update: available, open, setOpen, install, openRelease }
}
