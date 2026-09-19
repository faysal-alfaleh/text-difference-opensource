export const releaseConfig = {
  desktopBuildEnvironmentVariable: "TAURI_ENV_PLATFORM",
  tagPrefix: "v",
  releaseTagPath: "releases/tag",
  updateCheckMinimumIntervalMs: 15 * 60 * 1000,
} as const
