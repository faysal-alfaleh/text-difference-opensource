export const content = {
  brand: {
    description: "Compare text privately",
  },
  privacy: "Runs entirely on your device. Nothing is uploaded or saved.",
  version: {
    prefix: "v",
  },
  theme: {
    toggle: "Toggle theme",
  },
  sidebar: {
    toggle: "Toggle sidebar",
    title: "Sidebar",
    description: "Display settings and theme",
  },
  editor: {
    title: "Compare text",
    original: "Original text",
    changed: "Changed text",
    openFile: "Open file",
    placeholders: {
      original: "Paste or type the original text, or open a file",
      changed: "Paste or type the changed text, or open a file",
    },
  },
  actions: {
    compare: "Find difference",
    edit: "Edit input",
    swap: "Swap",
    clear: "Clear",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Copy failed",
    close: "Close",
  },
  settings: {
    title: "Display",
    layout: "Layout",
    layouts: {
      split: "Split",
      unified: "Unified",
    },
    textSize: "Text size",
    textSizes: {
      extraSmall: "Extra small",
      small: "Small",
      normal: "Normal",
      large: "Large",
    },
    textSizeSample: "A",
    wrapLines: "Wrap lines",
    hideUnchanged: "Hide unchanged lines",
    ignoreWhitespace: "Ignore whitespace",
  },
  update: {
    available: "Update available",
    title: "A new version is ready",
    whatsNew: "What's new",
    install: "Update and restart",
    later: "Later",
    downloading: "Downloading update",
    installing: "Installing update",
    failed: "The update could not be installed. You can download it from GitHub instead.",
    trust:
      "Every update is published openly on GitHub. If you would rather check it first, you can always review and download new releases there yourself.",
    viewOnGitHub: "View release on GitHub",
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
