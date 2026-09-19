export const content = {
  brand: {
    description: "Compare text privately",
  },
  privacy: "Runs entirely in your browser. Nothing is uploaded or saved.",
  version: {
    prefix: "v",
    commit: "Commit",
  },
  theme: {
    toggle: "Toggle theme",
  },
  sidebar: {
    toggle: "Toggle sidebar",
    title: "Sidebar",
    description: "Display settings and theme",
    close: "Close",
  },
  editor: {
    title: "Compare text",
    original: "Original text",
    changed: "Changed text",
    openFile: "Open file",
  },
  actions: {
    compare: "Find difference",
    edit: "Edit input",
    swap: "Swap",
    clear: "Clear",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Copy failed",
  },
  settings: {
    title: "Display",
    layout: "Layout",
    layouts: {
      split: "Split",
      unified: "Unified",
    },
    hideUnchanged: "Hide unchanged lines",
    ignoreWhitespace: "Ignore whitespace",
  },
  result: {
    title: "Differences",
    removals: { one: "removal", other: "removals" },
    additions: { one: "addition", other: "additions" },
    lines: { one: "line", other: "lines" },
    unchangedLines: { one: "unchanged line", other: "unchanged lines" },
    lineStatus: {
      removed: "Removed:",
      added: "Added:",
    },
    identical: {
      title: "No differences",
      description: "The two texts are identical.",
      equivalentDescription: "The texts differ only in whitespace or line endings.",
    },
  },
} as const
