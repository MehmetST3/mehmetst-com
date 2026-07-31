import { useEffect } from 'react'
import { AppLink } from '../components/AppLink'
import { Header } from '../components/Header'

export function NotFoundPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Sayfa bulunamadı | Mehmet Tüysüz'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#bulunamadi">
        Ana içeriğe geç
      </a>
      <Header />
      <main className="not-found" id="bulunamadi">
        <div className="not-found-inner">
          <p>Sayfa bulunamadı</p>
          <h1>Burada bir sayfa yok.</h1>
          <div className="not-found-copy">
            <p>Bağlantı değişmiş veya yanlış yazılmış olabilir.</p>
            <AppLink className="text-link" to="/">
              Ana sayfaya dön
            </AppLink>
          </div>
        </div>
      </main>
    </>
  )
}
