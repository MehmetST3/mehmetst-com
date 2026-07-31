import { useState } from 'react'
import type { AppLocation } from '../router'
import { switchLocale } from '../router'
import type { Locale, LocaleContent } from '../types'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

type LanguageToggleProps = Readonly<{
  content: LocaleContent
  location: AppLocation
}>

export function LanguageToggle({ content, location }: LanguageToggleProps) {
  const locale = content.locale
  const [confirmedLocale, setConfirmedLocale] = useState<Locale | null>(null)
  const selectLocale = (value: string) => {
    if (!value || value === locale) {
      setConfirmedLocale(locale)
      return
    }
    setConfirmedLocale(null)
    switchLocale(value as Locale, location)
  }

  return (
    <div className="language-control">
      <ToggleGroup
        className="language-toggle"
        data-locale={locale}
        type="single"
        value={locale}
        onValueChange={selectLocale}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setConfirmedLocale(null)
        }}
        aria-label={content.aria.languageGroup}
        orientation="horizontal"
        rovingFocus
        loop
      >
        <ToggleGroupItem value="tr" aria-label={content.language.tr} lang="tr">TR</ToggleGroupItem>
        <ToggleGroupItem value="en" aria-label={content.language.en} lang="en">EN</ToggleGroupItem>
      </ToggleGroup>
      {confirmedLocale === locale ? <span className="language-confirmation" role="status">{content.language.current}</span> : null}
    </div>
  )
}
