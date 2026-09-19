export const siteConfig = {
  name: "Text Diff",
  description:
    "Compare two texts privately. Everything runs in your browser and nothing is ever saved.",
  locale: "en",
  version: process.env.APP_VERSION,
  commit: process.env.APP_COMMIT,
} as const
