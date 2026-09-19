"use client"

import { Fragment, useDeferredValue, useMemo, type CSSProperties } from "react"
import {
  ChevronsDownUpIcon,
  CircleCheckIcon,
  CircleMinusIcon,
  CirclePlusIcon,
} from "lucide-react"

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

type ToneProps = {
  tone?: Tone
  strong?: boolean
}

type BlockListProps = {
  blocks: DiffBlock[]
  hideUnchanged: boolean
}

function toneBackground({ tone, strong }: ToneProps) {
  if (!tone) return undefined
  return strong ? tones[tone].strong : tones[tone].light
}

function isPureChange(block: ChangedBlock) {
  return block.removed.length === 0 || block.added.length === 0
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

function TextCell({ segments, ...toneProps }: ToneProps & { segments: Segment[] }) {
  return (
    <TableCell
      className={cn(
        "py-0 align-top whitespace-pre-wrap wrap-anywhere",
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

function SplitSide({ line, ...toneProps }: ToneProps & { line?: Line }) {
  if (!line) return <TableCell colSpan={columnCounts.split / 2} className="bg-hatch" />

  return (
    <>
      <NumberCell value={line.number} {...toneProps} />
      <TextCell segments={line.segments} {...toneProps} />
    </>
  )
}

function CollapsedRow({ count, layout }: { count: number; layout: DiffLayout }) {
  return (
    <TableRow className="bg-muted/50 hover:bg-muted/50">
      <TableCell
        colSpan={columnCounts[layout]}
        className="py-1 font-sans text-xs text-muted-foreground"
      >
        <span className="flex items-center gap-2">
          <ChevronsDownUpIcon className="size-3.5" />
          {formatCount(count, content.result.unchangedLines)}
        </span>
      </TableCell>
    </TableRow>
  )
}

function SplitRows({ blocks, hideUnchanged }: BlockListProps) {
  return blocks.map((block, blockIndex) => {
    if (block.type === "unchanged") {
      if (hideUnchanged) {
        return <CollapsedRow key={blockIndex} count={block.lines.length} layout="split" />
      }

      return (
        <Fragment key={blockIndex}>
          {block.lines.map(({ original, changed }) => (
            <TableRow key={original.number} className="border-0">
              <SplitSide line={original} />
              <SplitSide line={changed} />
            </TableRow>
          ))}
        </Fragment>
      )
    }

    const strong = isPureChange(block)
    const rowCount = Math.max(block.removed.length, block.added.length)

    return (
      <Fragment key={blockIndex}>
        {Array.from({ length: rowCount }, (_, row) => (
          <TableRow key={row} className="border-0">
            <SplitSide line={block.removed.at(row)} tone="removed" strong={strong} />
            <SplitSide line={block.added.at(row)} tone="added" strong={strong} />
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
  ...toneProps
}: ToneProps & {
  originalNumber?: number
  changedNumber?: number
  segments: Segment[]
}) {
  return (
    <TableRow className="border-0">
      <NumberCell value={originalNumber} {...toneProps} />
      <NumberCell value={changedNumber} {...toneProps} />
      <TextCell segments={segments} {...toneProps} />
    </TableRow>
  )
}

function UnifiedRows({ blocks, hideUnchanged }: BlockListProps) {
  return blocks.map((block, blockIndex) => {
    if (block.type === "unchanged") {
      if (hideUnchanged) {
        return <CollapsedRow key={blockIndex} count={block.lines.length} layout="unified" />
      }

      return (
        <Fragment key={blockIndex}>
          {block.lines.map(({ original, changed }) => (
            <UnifiedRow
              key={original.number}
              originalNumber={original.number}
              changedNumber={changed.number}
              segments={changed.segments}
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
            tone="removed"
            strong={strong}
          />
        ))}
        {block.added.map((line) => (
          <UnifiedRow
            key={`added-${line.number}`}
            changedNumber={line.number}
            segments={line.segments}
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
  gutterWidth,
}: BlockListProps & { layout: DiffLayout; gutterWidth: string }) {
  const Rows = layout === "split" ? SplitRows : UnifiedRows

  return (
    <Table
      className="table-fixed font-mono leading-6"
      style={{ "--gutter": gutterWidth } as CSSProperties}
    >
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
        <Rows blocks={blocks} hideUnchanged={hideUnchanged} />
      </TableBody>
    </Table>
  )
}

type DiffViewerProps = {
  original: string
  changed: string
  settings: DiffSettings
}

export function DiffViewer({ original, changed, settings }: DiffViewerProps) {
  const { layout, hideUnchanged, ignoreWhitespace } = useDeferredValue(settings)
  const result = useMemo(
    () => computeDiff(original, changed, { ignoreWhitespace, timeoutMs: diffConfig.timeoutMs }),
    [original, changed, ignoreWhitespace]
  )
  const isIdentical = result.removals === 0 && result.additions === 0
  const maxLineCount = Math.max(result.originalLineCount, result.changedLineCount)
  const gutterWidth = `${String(maxLineCount).length + diffConfig.lineNumberPaddingCh}ch`

  return (
    <Card className="gap-0 py-0">
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
            gutterWidth={gutterWidth}
          />
        )}
      </CardContent>
    </Card>
  )
}
