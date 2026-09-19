export const diffLayouts = ["split", "unified"] as const

export type DiffLayout = (typeof diffLayouts)[number]

export type DiffSettings = {
  layout: DiffLayout
  hideUnchanged: boolean
  ignoreWhitespace: boolean
}

export const diffToggles = [
  "hideUnchanged",
  "ignoreWhitespace",
] as const satisfies readonly (keyof DiffSettings)[]

export const diffConfig = {
  defaultSettings: {
    layout: "split",
    hideUnchanged: false,
    ignoreWhitespace: false,
  } satisfies DiffSettings,
  timeoutMs: 1500,
  copyFeedbackDurationMs: 1500,
  lineNumberPaddingCh: 2,
} as const
