import { GitCompareArrowsIcon, ShieldCheckIcon } from "lucide-react"

import { SettingsPanel } from "@/components/settings-panel"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { content } from "@/config/content"
import type { DiffSettings } from "@/config/diff"
import { siteConfig } from "@/config/site"

type AppSidebarProps = {
  settings: DiffSettings
  onSettingsChange: (settings: DiffSettings) => void
}

export function AppSidebar({ settings, onSettingsChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <Item size="sm" className="px-2">
          <ItemMedia className="size-8 rounded-lg bg-primary text-primary-foreground">
            <GitCompareArrowsIcon className="size-4" />
          </ItemMedia>
          <ItemContent className="min-w-0">
            <ItemTitle>{siteConfig.name}</ItemTitle>
            <ItemDescription className="truncate text-xs">
              {content.brand.description}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ThemeToggle />
          </ItemActions>
        </Item>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{content.settings.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SettingsPanel settings={settings} onChange={onSettingsChange} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Item variant="outline" size="sm">
          <ItemMedia variant="icon">
            <ShieldCheckIcon />
          </ItemMedia>
          <ItemContent>
            <ItemDescription className="text-xs">{content.privacy}</ItemDescription>
          </ItemContent>
        </Item>
        <div className="flex h-4 items-center gap-2 px-2 font-mono text-xs text-muted-foreground">
          <span>
            {content.version.prefix}
            {siteConfig.version}
          </span>
          {siteConfig.commit && (
            <>
              <Separator orientation="vertical" />
              <span>
                <span className="sr-only">{content.version.commit} </span>
                {siteConfig.commit}
              </span>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
