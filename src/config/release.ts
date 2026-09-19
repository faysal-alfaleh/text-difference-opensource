export const releaseConfig = {
  commitLength: 7,
  commitEnvironmentVariables: ["VERCEL_GIT_COMMIT_SHA", "GITHUB_SHA", "CF_PAGES_COMMIT_SHA"],
  desktopBuildEnvironmentVariable: "TAURI_ENV_PLATFORM",
  tagPrefix: "v",
  releaseTagPath: "releases/tag",
  updateCheckMinimumIntervalMs: 15 * 60 * 1000,
} as const
