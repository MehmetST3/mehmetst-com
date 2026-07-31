import { homePath, sectionHash } from '../route-manifest'
import type { AppLocation } from '../router'
import type { LocaleContent } from '../types'
import { AppLink } from './AppLink'
import { LanguageToggle } from './LanguageToggle'
import { LogoMark } from './LogoMark'

type HeaderProps = Readonly<{
  content: LocaleContent
  location: AppLocation
}>

export function Header({ content, location }: HeaderProps) {
  const locale = content.locale
  return (
    <header className="site-header">
      <div className="header-inner">
        <AppLink className="site-brand" to={homePath(locale)} aria-label={content.aria.homeLink}>
          <LogoMark animate />
          <span>Mehmet Tüysüz</span>
        </AppLink>
        <div className="header-controls">
          <nav aria-label={content.aria.mainNav}>
            <AppLink className="nav-about" to={`${homePath(locale)}${sectionHash(locale, 'about')}`}>{content.nav.about}</AppLink>
            <AppLink to={`${homePath(locale)}${sectionHash(locale, 'projects')}`}>{content.nav.projects}</AppLink>
            <AppLink to={`${homePath(locale)}${sectionHash(locale, 'contact')}`}>{content.nav.contact}</AppLink>
          </nav>
          <LanguageToggle content={content} location={location} />
        </div>
      </div>
    </header>
  )
}
