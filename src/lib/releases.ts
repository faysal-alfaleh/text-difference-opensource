import { releaseConfig } from "@/config/release"
import { siteConfig } from "@/config/site"

export function releaseUrl(version: string) {
  return `${siteConfig.repositoryUrl}/${releaseConfig.releaseTagPath}/${releaseConfig.tagPrefix}${version}`
}
