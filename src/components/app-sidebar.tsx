import { ArrowDownCircleIcon, ShieldCheckIcon } from "lucide-react"

import { Logo } from "@/components/logo"
import { SettingsPanel } from "@/components/settings-panel"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
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
  updateVersion?: string
  onShowUpdate: () => void
}

export function AppSidebar({
  settings,
  onSettingsChange,
  updateVersion,
  onShowUpdate,
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <Item size="sm" className="px-2">
          <ItemMedia>
            <Logo />
          </ItemMedia>
          <ItemContent className="min-w-0">
            <ItemTitle className="text-base font-semibold tracking-tight">{siteConfig.name}</ItemTitle>
            <ItemDescription className="truncate">
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
          <SidebarGroupLabel className="text-sm">{content.settings.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SettingsPanel settings={settings} onChange={onSettingsChange} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {updateVersion && (
          <Button variant="secondary" className="justify-start" onClick={onShowUpdate}>
            <ArrowDownCircleIcon />
            {content.update.available}
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {content.version.prefix}
              {updateVersion}
            </span>
          </Button>
        )}
        <Item variant="outline" size="sm">
          <ItemMedia variant="icon">
            <ShieldCheckIcon />
          </ItemMedia>
          <ItemContent>
            <ItemDescription className="line-clamp-none">{content.privacy}</ItemDescription>
          </ItemContent>
        </Item>
        <p className="px-2 font-mono text-xs text-muted-foreground">
          {content.version.prefix}
          {siteConfig.version}
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
