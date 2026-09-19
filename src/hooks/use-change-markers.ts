import { useEffect, useState } from "react"

export const changeKinds = ["removed", "added", "modified"] as const

export type ChangeKind = (typeof changeKinds)[number]

export type ChangeMarker = {
  kind: ChangeKind
  top: number
  height: number
}

function isChangeKind(value: string | undefined): value is ChangeKind {
  return changeKinds.some((kind) => kind === value)
}

function measureChangeMarkers(table: HTMLTableElement) {
  const tableRect = table.getBoundingClientRect()
  const markers: ChangeMarker[] = []
  if (tableRect.height === 0) return markers

  let previousKind: ChangeKind | undefined

  for (const row of table.rows) {
    const kind = row.dataset.change
    if (!isChangeKind(kind)) {
      previousKind = undefined
      continue
    }

    const rowRect = row.getBoundingClientRect()
    const top = (rowRect.top - tableRect.top) / tableRect.height
    const height = rowRect.height / tableRect.height
    const current = markers.at(-1)

    if (current && previousKind === kind) {
      current.height = top + height - current.top
    } else {
      markers.push({ kind, top, height })
    }

    previousKind = kind
  }

  return markers
}

export function useChangeMarkers(table: HTMLTableElement | null) {
  const [markers, setMarkers] = useState<ChangeMarker[]>([])

  useEffect(() => {
    if (!table) return

    const measure = () => setMarkers(measureChangeMarkers(table))
    const resizeObserver = new ResizeObserver(measure)
    const mutationObserver = new MutationObserver(measure)

    resizeObserver.observe(table)
    mutationObserver.observe(table, { childList: true, subtree: true })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [table])

  return markers
}
