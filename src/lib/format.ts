import { siteConfig } from "@/config/site"

type PluralForms = {
  one: string
  other: string
}

const pluralRules = new Intl.PluralRules(siteConfig.locale)
const numberFormat = new Intl.NumberFormat(siteConfig.locale)

export function formatCount(count: number, forms: PluralForms) {
  const form = pluralRules.select(count) === "one" ? forms.one : forms.other
  return `${numberFormat.format(count)} ${form}`
}
