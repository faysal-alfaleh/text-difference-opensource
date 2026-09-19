export type ReleaseNotesSection = {
  title: string
  items: string[]
}

const lineBreakPattern = /\r?\n/
const headingPattern = /^#{2,6}\s+(.+)$/
const itemPattern = /^[*-]\s+(.+)$/
const commitReferencePattern = /\s*\(\[[0-9a-f]{7,40}\]\([^)]*\)\)\s*$/i
const linkPattern = /\[([^\]]+)\]\([^)]*\)/g
const emphasisPattern = /\*\*|__/g

function toPlainText(markdown: string) {
  return markdown.replace(linkPattern, "$1").replace(emphasisPattern, "").trim()
}

export function parseReleaseNotes(notes: string): ReleaseNotesSection[] {
  const sections: ReleaseNotesSection[] = []

  for (const rawLine of notes.split(lineBreakPattern)) {
    const line = rawLine.trim()
    const heading = headingPattern.exec(line)

    if (heading) {
      sections.push({ title: toPlainText(heading[1]), items: [] })
      continue
    }

    const item = itemPattern.exec(line)
    if (!item) continue

    const text = toPlainText(item[1].replace(commitReferencePattern, ""))
    const current = sections.at(-1)

    if (current) {
      current.items.push(text)
    } else {
      sections.push({ title: "", items: [text] })
    }
  }

  return sections.filter((section) => section.items.length > 0)
}
