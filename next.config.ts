import { execSync } from "node:child_process"
import type { NextConfig } from "next"

import packageJson from "./package.json"
import { releaseConfig } from "./src/config/release"
import { securityHeaders } from "./src/config/security"

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

function resolveCommit() {
  const fromEnvironment = releaseConfig.commitEnvironmentVariables
    .map((name) => process.env[name])
    .find(Boolean)

  return fromEnvironment ? fromEnvironment.slice(0, releaseConfig.commitLength) : readGitCommit()
}

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  env: {
    APP_VERSION: packageJson.version,
    APP_COMMIT: resolveCommit(),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
