export const releaseConfig = {
  commitLength: 7,
  commitEnvironmentVariables: ["VERCEL_GIT_COMMIT_SHA", "GITHUB_SHA", "CF_PAGES_COMMIT_SHA"],
} as const
