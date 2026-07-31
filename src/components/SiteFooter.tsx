import { LogoMark } from './LogoMark'
import { AppLink } from './AppLink'

function ExternalArrow() {
  return (
    <svg className="footer-external-cue" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" />
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer section-shell section-line" id="iletisim" data-line-reveal data-reveal-key="footer-line">
      <div className="footer-grid reveal" data-reveal data-reveal-key="footer-grid">
        <section className="footer-identity" aria-labelledby="footer-name">
          <div className="footer-brand">
            <LogoMark />
            <h2 id="footer-name">Mehmet Tüysüz</h2>
          </div>
          <p>Ses, görüntü ve donanım sistemleri geliştiriyorum.</p>
        </section>
        <nav className="footer-column" aria-labelledby="footer-pages">
          <h3 id="footer-pages">Sayfalar</h3>
          <AppLink to="/#hakkimda">Hakkımda</AppLink>
          <AppLink to="/#projeler">Projeler</AppLink>
          <AppLink to="/#devam-eden">Devam eden çalışmalar</AppLink>
          <AppLink to="/#iletisim">İletişim</AppLink>
        </nav>
        <nav className="footer-column" aria-labelledby="footer-links-title">
          <h3 id="footer-links-title">Bağlantılar</h3>
          <a className="footer-external-link" href="https://github.com/MehmetST3" target="_blank" rel="noreferrer">GitHub<ExternalArrow /></a>
          <a className="footer-external-link" href="https://www.instagram.com/mehmetstt0/?__pwa=1" target="_blank" rel="noreferrer">Instagram<ExternalArrow /></a>
          <a href="mailto:tuysuzsiretmehmet@gmail.com">E-posta</a>
        </nav>
      </div>
      <p className="footer-copyright">© 2026 Mehmet Tüysüz.</p>
    </footer>
  )
}
