"use client"

import { Fragment, useDeferredValue, useMemo, useState, type CSSProperties } from "react"
import {
  ChevronsDownUpIcon,
  CircleCheckIcon,
  CircleMinusIcon,
  CirclePlusIcon,
} from "lucide-react"

import { ChangeOverview } from "@/components/change-overview"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { content } from "@/config/content"
import { diffConfig, type DiffLayout, type DiffSettings } from "@/config/diff"
import {
  computeDiff,
  type ChangedBlock,
  type DiffBlock,
  type Line,
  type Segment,
} from "@/lib/diff"
import { useChangeMarkers, type ChangeKind } from "@/hooks/use-change-markers"
import { formatCount } from "@/lib/format"
import { cn } from "@/lib/utils"

type Tone = "removed" | "added"

const tones = {
  removed: {
    icon: CircleMinusIcon,
    light: "bg-removed/10",
    strong: "bg-removed/20",
    mark: "bg-removed/25",
  },
  added: {
    icon: CirclePlusIcon,
    light: "bg-added/10",
    strong: "bg-added/20",
    mark: "bg-added/30",
  },
} as const

const columnCounts = {
  split: 4,
  unified: 3,
} as const satisfies Record<DiffLayout, number>

const splitSides = ["original", "changed"] as const

type SplitSideName = (typeof splitSides)[number]

const columnsPerSide = columnCounts.split / splitSides.length

const rowClassName = "h-(--content-line-height) border-0"

type ToneProps = {
  tone?: Tone
  strong?: boolean
}

type BlockListProps = {
  blocks: DiffBlock[]
  hideUnchanged: boolean
  wrapLines: boolean
}

const sideTones = {
  original: "removed",
  changed: "added",
} as const satisfies Record<SplitSideName, Tone>

function toneBackground({ tone, strong }: ToneProps) {
  if (!tone) return undefined
  return strong ? tones[tone].strong : tones[tone].light
}

function isPureChange(block: ChangedBlock) {
  return block.removed.length === 0 || block.added.length === 0
}

function changeKind(removed?: Line, added?: Line): ChangeKind {
  if (removed && added) return "modified"
  return removed ? "removed" : "added"
}

function SideSummary({
  tone,
  label,
  lineCount,
  text,
  target,
}: {
  tone: Tone
  label: string
  lineCount: number
  text: string
  target: string
}) {
  const Icon = tones[tone].icon

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 pr-2 pl-4">
      <Badge variant={tone}>
        <Icon data-icon="inline-start" />
        {label}
      </Badge>
      <span className="ml-auto truncate text-muted-foreground max-sm:hidden">
        {formatCount(lineCount, content.result.lines)}
      </span>
      <CopyButton text={text} target={target} />
    </div>
  )
}

function NumberCell({ value, ...toneProps }: ToneProps & { value?: number }) {
  return (
    <TableCell
      className={cn(
        "py-0 text-right align-top tabular-nums select-none",
        toneProps.tone ? "text-foreground/70" : "text-muted-foreground",
        toneBackground(toneProps)
      )}
    >
      {value}
    </TableCell>
  )
}

function TextCell({
  segments,
  wrap,
  ...toneProps
}: ToneProps & { segments: Segment[]; wrap: boolean }) {
  return (
    <TableCell
      className={cn(
        "py-0 align-top",
        wrap ? "whitespace-pre-wrap wrap-anywhere" : "whitespace-pre",
        toneBackground(toneProps)
      )}
    >
      {toneProps.tone && (
        <span className="sr-only">{content.result.lineStatus[toneProps.tone]} </span>
      )}
      {segments.map((segment, index) =>
        segment.changed && toneProps.tone ? (
          <mark
            key={index}
            className={cn("rounded-sm text-current", tones[toneProps.tone].mark)}
          >
            {segment.text}
          </mark>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        )
      )}
    </TableCell>
  )
}

function SplitSide({
  line,
  wrap,
  fillerRows = 0,
  ...toneProps
}: ToneProps & { line?: Line; wrap: boolean; fillerRows?: number }) {
  if (!line) {
    if (fillerRows === 0) return null
    return <TableCell colSpan={columnsPerSide} rowSpan={fillerRows} className="bg-hatch" />
  }

  return (
    <>
      <NumberCell value={line.number} {...toneProps} />
      <TextCell segments={line.segments} wrap={wrap} {...toneProps} />
    </>
  )
}

function CollapsedRow({ count, columns }: { count: number; columns: number }) {
  return (
    <TableRow className="border-0 bg-muted/50 hover:bg-muted/50">
      <TableCell colSpan={columns} className="py-1 font-sans text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <ChevronsDownUpIcon className="size-3.5" />
          {formatCount(count, content.result.unchangedLines)}
        </span>
      </TableCell>
    </TableRow>
  )
}

function SplitRows({
  blocks,
  hideUnchanged,
  wrapLines,
  sides,
}: BlockListProps & { sides: readonly SplitSideName[] }) {
  const columns = columnsPerSide * sides.length

  return blocks.map((block, blockIndex) => {
    if (block.type === "unchanged") {
      if (hideUnchanged) {
        return <CollapsedRow key={blockIndex} count={block.lines.length} columns={columns} />
      }

      return (
        <Fragment key={blockIndex}>
          {block.lines.map((pair) => (
            <TableRow key={pair.original.number} className={rowClassName}>
              {sides.map((side) => (
                <SplitSide key={side} line={pair[side]} wrap={wrapLines} />
              ))}
            </TableRow>
          ))}
        </Fragment>
      )
    }

    const strong = isPureChange(block)
    const sideLines = { original: block.removed, changed: block.added }
    const rowCount = Math.max(block.removed.length, block.added.length)

    return (
      <Fragment key={blockIndex}>
        {Array.from({ length: rowCount }, (_, row) => (
          <TableRow
            key={row}
            data-change={changeKind(block.removed.at(row), block.added.at(row))}
            className={rowClassName}
          >
            {sides.map((side) => (
              <SplitSide
                key={side}
                line={sideLines[side].at(row)}
                wrap={wrapLines}
                fillerRows={row === sideLines[side].length ? rowCount - sideLines[side].length : 0}
                tone={sideTones[side]}
                strong={strong}
              />
            ))}
          </TableRow>
        ))}
      </Fragment>
    )
  })
}

function UnifiedRow({
  originalNumber,
  changedNumber,
  segments,
  wrap,
  ...toneProps
}: ToneProps & {
  originalNumber?: number
  changedNumber?: number
  segments: Segment[]
  wrap: boolean
}) {
  return (
    <TableRow data-change={toneProps.tone} className={rowClassName}>
      <NumberCell value={originalNumber} {...toneProps} />
      <NumberCell value={changedNumber} {...toneProps} />
      <TextCell segments={segments} wrap={wrap} {...toneProps} />
    </TableRow>
  )
}

function UnifiedRows({ blocks, hideUnchanged, wrapLines }: BlockListProps) {
  return blocks.map((block, blockIndex) => {
    if (block.type === "unchanged") {
      if (hideUnchanged) {
        return (
          <CollapsedRow key={blockIndex} count={block.lines.length} columns={columnCounts.unified} />
        )
      }

      return (
        <Fragment key={blockIndex}>
          {block.lines.map(({ original, changed }) => (
            <UnifiedRow
              key={original.number}
              originalNumber={original.number}
              changedNumber={changed.number}
              segments={changed.segments}
              wrap={wrapLines}
            />
          ))}
        </Fragment>
      )
    }

    const strong = isPureChange(block)

    return (
      <Fragment key={blockIndex}>
        {block.removed.map((line) => (
          <UnifiedRow
            key={`removed-${line.number}`}
            originalNumber={line.number}
            segments={line.segments}
            wrap={wrapLines}
            tone="removed"
            strong={strong}
          />
        ))}
        {block.added.map((line) => (
          <UnifiedRow
            key={`added-${line.number}`}
            changedNumber={line.number}
            segments={line.segments}
            wrap={wrapLines}
            tone="added"
            strong={strong}
          />
        ))}
      </Fragment>
    )
  })
}

function DiffTable({
  layout,
  blocks,
  hideUnchanged,
  wrapLines,
  gutterWidth,
}: BlockListProps & { layout: DiffLayout; gutterWidth: string }) {
  const [table, setTable] = useState<HTMLTableElement | null>(null)
  const markers = useChangeMarkers(table)
  const separatePanes = layout === "split" && !wrapLines
  const tableClassName = cn(
    "font-mono text-(length:--content-font-size) leading-(--content-line-height)",
    wrapLines ? "table-fixed" : "w-max min-w-full"
  )
  const tableStyle = { "--gutter": gutterWidth } as CSSProperties
  const rowProps = { blocks, hideUnchanged, wrapLines }

  function navigate(fraction: number) {
    if (!table) return
    const rect = table.getBoundingClientRect()
    window.scrollTo({ top: window.scrollY + rect.top + rect.height * fraction - window.innerHeight / 2 })
  }

  return (
    <div className="flex gap-2 pr-2">
      {separatePanes ? (
        <div className="grid min-w-0 flex-1 grid-cols-2 divide-x">
          {splitSides.map((side) => (
            <Table
              key={side}
              ref={side === splitSides[0] ? setTable : undefined}
              className={tableClassName}
              style={tableStyle}
            >
              <colgroup>
                <col className="w-(--gutter)" />
                <col />
              </colgroup>
              <TableBody>
                <SplitRows {...rowProps} sides={[side]} />
              </TableBody>
            </Table>
          ))}
        </div>
      ) : (
        <Table ref={setTable} className={tableClassName} style={tableStyle}>
          <colgroup>
            {layout === "split" ? (
              <>
                <col className="w-(--gutter)" />
                <col />
                <col className="w-(--gutter)" />
                <col />
              </>
            ) : (
              <>
                <col className="w-(--gutter)" />
                <col className="w-(--gutter)" />
                <col />
              </>
            )}
          </colgroup>
          <TableBody>
            {layout === "split" ? (
              <SplitRows {...rowProps} sides={splitSides} />
            ) : (
              <UnifiedRows {...rowProps} />
            )}
          </TableBody>
        </Table>
      )}
      <ChangeOverview markers={markers} onNavigate={navigate} />
    </div>
  )
}

type DiffViewerProps = {
  original: string
  changed: string
  settings: DiffSettings
}

export function DiffViewer({ original, changed, settings }: DiffViewerProps) {
  const { layout, hideUnchanged, ignoreWhitespace, wrapLines } = useDeferredValue(settings)
  const result = useMemo(
    () => computeDiff(original, changed, { ignoreWhitespace, timeoutMs: diffConfig.timeoutMs }),
    [original, changed, ignoreWhitespace]
  )
  const isIdentical = result.removals === 0 && result.additions === 0
  const maxLineCount = Math.max(result.originalLineCount, result.changedLineCount)
  const gutterWidth = `${String(maxLineCount).length + diffConfig.lineNumberPaddingCh}ch`

  return (
    <Card className="gap-0 overflow-clip py-0">
      <CardHeader className="grid-cols-2 gap-0 divide-x border-b px-0 [.border-b]:pb-0">
        <SideSummary
          tone="removed"
          label={formatCount(result.removals, content.result.removals)}
          lineCount={result.originalLineCount}
          text={original}
          target={content.editor.original}
        />
        <SideSummary
          tone="added"
          label={formatCount(result.additions, content.result.additions)}
          lineCount={result.changedLineCount}
          text={changed}
          target={content.editor.changed}
        />
      </CardHeader>
      <CardContent className="px-0 py-2">
        {isIdentical ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleCheckIcon />
              </EmptyMedia>
              <EmptyTitle>{content.result.identical.title}</EmptyTitle>
              <EmptyDescription>
                {original === changed
                  ? content.result.identical.description
                  : content.result.identical.equivalentDescription}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <DiffTable
            layout={layout}
            blocks={result.blocks}
            hideUnchanged={hideUnchanged}
            wrapLines={wrapLines}
            gutterWidth={gutterWidth}
          />
        )}
      </CardContent>
    </Card>
  )
}
