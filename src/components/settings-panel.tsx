"use client"

import { useId } from "react"

import { Field, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { content } from "@/config/content"
import {
  diffLayouts,
  diffToggles,
  type DiffLayout,
  type DiffSettings,
} from "@/config/diff"

type SettingsPanelProps = {
  settings: DiffSettings
  onChange: (settings: DiffSettings) => void
}

function isDiffLayout(value: string): value is DiffLayout {
  return diffLayouts.some((layout) => layout === value)
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const id = useId()

  function update<Key extends keyof DiffSettings>(key: Key, value: DiffSettings[Key]) {
    onChange({ ...settings, [key]: value })
  }

  return (
    <FieldGroup className="gap-4 px-2">
      <Field orientation="horizontal" className="justify-between">
        <FieldTitle id={`${id}-layout`} className="font-normal">
          {content.settings.layout}
        </FieldTitle>
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          aria-labelledby={`${id}-layout`}
          value={settings.layout}
          onValueChange={(value) => {
            if (isDiffLayout(value)) update("layout", value)
          }}
        >
          {diffLayouts.map((layout) => (
            <ToggleGroupItem key={layout} value={layout}>
              {content.settings.layouts[layout]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>
      {diffToggles.map((key) => (
        <Field key={key} orientation="horizontal" className="justify-between">
          <FieldLabel htmlFor={`${id}-${key}`} className="font-normal">
            {content.settings[key]}
          </FieldLabel>
          <Switch
            id={`${id}-${key}`}
            checked={settings[key]}
            onCheckedChange={(checked) => update(key, checked)}
          />
        </Field>
      ))}
    </FieldGroup>
  )
}
