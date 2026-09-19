import { diffArrays, type ArrayChange } from "diff"

export type Segment = {
  text: string
  changed: boolean
}

export type Line = {
  number: number
  segments: Segment[]
}

export type UnchangedBlock = {
  type: "unchanged"
  lines: { original: Line; changed: Line }[]
}

export type ChangedBlock = {
  type: "changed"
  removed: Line[]
  added: Line[]
}

export type DiffBlock = UnchangedBlock | ChangedBlock

export type DiffResult = {
  blocks: DiffBlock[]
  removals: number
  additions: number
  originalLineCount: number
  changedLineCount: number
}

export type DiffOptions = {
  ignoreWhitespace: boolean
  timeoutMs: number
}

type NumberedLine = {
  number: number
  text: string
}

const lineBreakPattern = /\r\n|\r|\n/
const whitespacePattern = /\s+/g
const wordSegmenter = new Intl.Segmenter(undefined, { granularity: "word" })

function splitLines(text: string) {
  return text === "" ? [] : text.split(lineBreakPattern)
}

export function countEditorLines(text: string) {
  return text.split(lineBreakPattern).length
}

function stripWhitespace(text: string) {
  return text.replace(whitespacePattern, "")
}

function tokenize(text: string) {
  return Array.from(wordSegmenter.segment(text), ({ segment }) => segment)
}

function sliceLines(lines: string[], start: number, count: number) {
  return lines
    .slice(start, start + count)
    .map((text, offset): NumberedLine => ({ number: start + offset + 1, text }))
}

function toLine({ number, text }: NumberedLine, changed = false): Line {
  return { number, segments: [{ text, changed }] }
}

function replaceAll(originalLines: string[], changedLines: string[]): ArrayChange<string>[] {
  return [
    { value: originalLines, count: originalLines.length, added: false, removed: true },
    { value: changedLines, count: changedLines.length, added: true, removed: false },
  ]
}

function diffLinePair(
  original: NumberedLine,
  changed: NumberedLine,
  ignoreWhitespace: boolean,
  deadline: number
): [Line, Line] {
  const timeout = deadline - Date.now()
  const parts =
    timeout > 0
      ? diffArrays(tokenize(original.text), tokenize(changed.text), { timeout })
      : undefined

  if (!parts) return [toLine(original, true), toLine(changed, true)]

  const toSegment = (tokens: string[], changed: boolean): Segment => {
    const text = tokens.join("")
    return { text, changed: changed && (!ignoreWhitespace || text.trim() !== "") }
  }

  return [
    {
      number: original.number,
      segments: parts
        .filter((part) => !part.added)
        .map((part) => toSegment(part.value, part.removed)),
    },
    {
      number: changed.number,
      segments: parts
        .filter((part) => !part.removed)
        .map((part) => toSegment(part.value, part.added)),
    },
  ]
}

function buildChangedBlock(
  removed: NumberedLine[],
  added: NumberedLine[],
  ignoreWhitespace: boolean,
  deadline: number
): ChangedBlock {
  const pairCount = Math.min(removed.length, added.length)
  const isModification = pairCount > 0
  const pairs = Array.from({ length: pairCount }, (_, index) =>
    diffLinePair(removed[index], added[index], ignoreWhitespace, deadline)
  )

  return {
    type: "changed",
    removed: pairs
      .map(([line]) => line)
      .concat(removed.slice(pairCount).map((line) => toLine(line, isModification))),
    added: pairs
      .map(([, line]) => line)
      .concat(added.slice(pairCount).map((line) => toLine(line, isModification))),
  }
}

export function computeDiff(
  original: string,
  changed: string,
  { ignoreWhitespace, timeoutMs }: DiffOptions
): DiffResult {
  const deadline = Date.now() + timeoutMs
  const originalLines = splitLines(original)
  const changedLines = splitLines(changed)
  const toKeys = (lines: string[]) => (ignoreWhitespace ? lines.map(stripWhitespace) : lines)
  const changes =
    diffArrays(toKeys(originalLines), toKeys(changedLines), { timeout: timeoutMs }) ??
    replaceAll(originalLines, changedLines)

  const blocks: DiffBlock[] = []
  let removed: NumberedLine[] = []
  let added: NumberedLine[] = []
  let originalIndex = 0
  let changedIndex = 0

  const flushChanges = () => {
    if (removed.length === 0 && added.length === 0) return
    blocks.push(buildChangedBlock(removed, added, ignoreWhitespace, deadline))
    removed = []
    added = []
  }

  for (const change of changes) {
    if (change.removed) {
      removed = removed.concat(sliceLines(originalLines, originalIndex, change.count))
      originalIndex += change.count
    } else if (change.added) {
      added = added.concat(sliceLines(changedLines, changedIndex, change.count))
      changedIndex += change.count
    } else {
      flushChanges()
      const originalSlice = sliceLines(originalLines, originalIndex, change.count)
      const changedSlice = sliceLines(changedLines, changedIndex, change.count)
      blocks.push({
        type: "unchanged",
        lines: originalSlice.map((line, index) => ({
          original: toLine(line),
          changed: toLine(changedSlice[index]),
        })),
      })
      originalIndex += change.count
      changedIndex += change.count
    }
  }

  flushChanges()

  const changedBlocks = blocks.filter((block) => block.type === "changed")

  return {
    blocks,
    removals: changedBlocks.reduce((total, block) => total + block.removed.length, 0),
    additions: changedBlocks.reduce((total, block) => total + block.added.length, 0),
    originalLineCount: originalLines.length,
    changedLineCount: changedLines.length,
  }
}
