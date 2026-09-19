export const diffLayouts = ["split", "unified"] as const

export type DiffLayout = (typeof diffLayouts)[number]

export const textSizes = ["extraSmall", "small", "normal", "large"] as const

export type TextSize = (typeof textSizes)[number]

export type DiffSettings = {
  layout: DiffLayout
  textSize: TextSize
  wrapLines: boolean
  hideUnchanged: boolean
  ignoreWhitespace: boolean
}

export const diffToggles = [
  "wrapLines",
  "hideUnchanged",
  "ignoreWhitespace",
] as const satisfies readonly (keyof DiffSettings)[]

export const diffConfig = {
  defaultSettings: {
    layout: "split",
    textSize: "normal",
    wrapLines: false,
    hideUnchanged: false,
    ignoreWhitespace: false,
  } satisfies DiffSettings,
  textSizes: {
    extraSmall: { fontSize: "0.75rem", lineHeight: "1.25rem" },
    small: { fontSize: "0.8125rem", lineHeight: "1.375rem" },
    normal: { fontSize: "0.875rem", lineHeight: "1.5rem" },
    large: { fontSize: "1rem", lineHeight: "1.75rem" },
  } satisfies Record<TextSize, { fontSize: string; lineHeight: string }>,
  timeoutMs: 1500,
  copyFeedbackDurationMs: 1500,
  lineNumberPaddingCh: 2,
} as const
