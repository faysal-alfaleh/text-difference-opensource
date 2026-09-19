import { execSync } from "node:child_process"
import type { NextConfig } from "next"

import packageJson from "./package.json"
import { releaseConfig } from "./src/config/release"
import { securityHeaders } from "./src/config/security"

const isDesktopBuild = Boolean(process.env[releaseConfig.desktopBuildEnvironmentVariable])

function readGitCommit() {
  try {
    return execSync(`git rev-parse --short=${releaseConfig.commitLength} HEAD`, {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim()
  } catch {
    return ""
  }
}

function readEnvironmentCommit() {
  const commit = releaseConfig.commitEnvironmentVariables
    .map((name) => process.env[name])
    .find(Boolean)

  return commit ? commit.slice(0, releaseConfig.commitLength) : ""
}

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  env: {
    APP_VERSION: packageJson.version,
    APP_COMMIT: readGitCommit() || readEnvironmentCommit(),
  },
  ...(isDesktopBuild
    ? { output: "export" as const }
    : {
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }]
        },
      }),
}

export default nextConfig
