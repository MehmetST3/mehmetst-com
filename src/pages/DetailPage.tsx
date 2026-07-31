import { useEffect } from 'react'
import type { CaseStudy } from '../types'
import { AppLink } from '../components/AppLink'
import { Header } from '../components/Header'
import { ProjectDetail } from '../components/ProjectDetail'

type DetailPageProps = Readonly<{
  study: CaseStudy
}>

export function DetailPage({ study }: DetailPageProps) {

  useEffect(() => {
    document.title = `${study.shortTitle} | Mehmet Tüysüz`
    return () => {
      document.title = 'Mehmet Tüysüz | Yapay zekâ ve sistemler'
    }
  }, [study])

  const backLink = (
    <AppLink className="text-control" to="/#projeler">
      Ana sayfaya dön
    </AppLink>
  )

  return (
    <>
      <a className="skip-link" href="#proje-detayi">
        Proje detayına geç
      </a>
      <Header />
      <main className="detail-page" id="proje-detayi">
        <ProjectDetail study={study} mode="page" closeControl={backLink} />
      </main>
    </>
  )
}
