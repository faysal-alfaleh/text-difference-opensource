import type { NextConfig } from "next"

import packageJson from "./package.json"
import { releaseConfig } from "./src/config/release"
import { securityHeaders } from "./src/config/security"

const isDesktopBuild = Boolean(process.env[releaseConfig.desktopBuildEnvironmentVariable])

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  env: {
    APP_VERSION: packageJson.version,
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
