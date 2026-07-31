import { AppLink } from './AppLink'
import { LogoMark } from './LogoMark'

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <AppLink className="site-brand" to="/" aria-label="Mehmet Tüysüz ana sayfa">
          <LogoMark animate />
          <span>Mehmet Tüysüz</span>
        </AppLink>
        <nav aria-label="Ana menü">
          <AppLink className="nav-about" to="/#hakkimda">Hakkımda</AppLink>
          <AppLink to="/#projeler">Projeler</AppLink>
          <AppLink to="/#iletisim">İletişim</AppLink>
        </nav>
      </div>
    </header>
  )
}
