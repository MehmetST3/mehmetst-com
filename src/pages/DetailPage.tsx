import { homePath, sectionHash } from '../route-manifest'
import type { AppLocation } from '../router'
import type { LocaleContent, LocalizedCaseStudy } from '../types'
import { AppLink } from '../components/AppLink'
import { Header } from '../components/Header'
import { ProjectDetail } from '../components/ProjectDetail'

type DetailPageProps = Readonly<{
  study: LocalizedCaseStudy
  content: LocaleContent
  location: AppLocation
}>

export function DetailPage({ study, content, location }: DetailPageProps) {
  const backLink = (
    <AppLink className="text-control" to={`${homePath(content.locale)}${sectionHash(content.locale, 'projects')}`}>{content.detail.backHome}</AppLink>
  )
  return (
    <>
      <a className="skip-link" href="#project-detail">{content.aria.skipProject}</a>
      <Header content={content} location={location} />
      <main className="detail-page" id="project-detail">
        <ProjectDetail study={study} content={content} mode="page" closeControl={backLink} />
      </main>
    </>
  )
}
