import { getProjects } from '../content'
import { useReveal } from '../hooks/useReveal'
import { homePath, localeRoutes, projectPath, sectionHash } from '../route-manifest'
import { openProjectModal, useBackgroundRestore } from '../router'
import type { AppLocation } from '../router'
import type { LocaleContent } from '../types'
import { AppLink } from '../components/AppLink'
import { Header } from '../components/Header'
import { ResponsiveImage } from '../components/ResponsiveImage'
import { SiteFooter } from '../components/SiteFooter'

function DirectionCue({ external = false }: Readonly<{ external?: boolean }>) {
  return (
    <svg className={`direction-cue${external ? ' direction-cue--external' : ' direction-cue--internal'}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {external ? <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" /> : <path d="m4.5 4.5 7 7m0-5.5v5.5H6" />}
    </svg>
  )
}

function ExpertiseIcon({ index }: Readonly<{ index: number }>) {
  const paths = [
    <g key="vision"><rect x="4" y="4" width="12" height="12" /><path d="M2.5 8v8.5H11" /></g>,
    <g key="model"><path d="m3.5 7 3-3m-3 3 3 3m11-3-3-3m3 3-3 3M8 15c1.6-4 2.4-8 3-12" /></g>,
    <g key="agent"><circle cx="4" cy="10" r="2" /><circle cx="16" cy="5" r="2" /><circle cx="16" cy="15" r="2" /><path d="M6 9.4 14 5.7M6 10.6l8 3.7" /></g>,
  ]
  return <svg className={`expertise-icon${index === 0 ? ' expertise-icon--vision' : ''}`} viewBox="0 0 20 20" aria-hidden="true" focusable="false">{paths[index]}</svg>
}

type HomePageProps = Readonly<{
  content: LocaleContent
  location: AppLocation
}>

export function HomePage({ content, location }: HomePageProps) {
  useReveal()
  useBackgroundRestore(`${location.pathname}${location.hash}${location.state?.kind ?? 'home'}`)
  const locale = content.locale
  const hashes = localeRoutes[locale].hashes
  const projects = getProjects(locale)

  return (
    <>
      <a className="skip-link" href="#main-content">{content.aria.skipHome}</a>
      <Header content={content} location={location} />
      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-inner">
            <h1 className="reveal" id="hero-title" data-reveal data-reveal-key="hero-name">{content.hero.title}</h1>
            <p className="hero-intro reveal reveal-delay-1" data-reveal data-reveal-key="hero-intro">{content.hero.intro}</p>
            <div className="hero-actions reveal reveal-delay-2" data-reveal data-reveal-key="hero-actions">
              <AppLink className="primary-link" to={`${homePath(locale)}${sectionHash(locale, 'projects')}`}>
                {content.hero.projectsCta}<DirectionCue />
              </AppLink>
              <a className="secondary-link" href="https://github.com/MehmetST3" target="_blank" rel="noreferrer">
                GitHub<DirectionCue external />
              </a>
            </div>
          </div>
        </section>

        <section className="about section-shell section-line" id={hashes.about} aria-labelledby="about-title" data-line-reveal data-reveal-key="about-line">
          <h2 className="section-title reveal" id="about-title" data-reveal data-reveal-key="about-title">{content.about.title}</h2>
          <div className="about-content">
            <div className="about-copy">
              {content.about.intro.map((paragraph, index) => (
                <p className="reveal about-paragraph-reveal" data-reveal data-reveal-key={`about-copy-${index}`} key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <dl className="about-expertise" aria-label={content.aria.expertiseList}>
              {content.about.expertise.map((item, index) => (
                <div className="expertise-reveal" data-reveal data-reveal-key={`about-expertise-${index}`} key={item.title}>
                  <dt><ExpertiseIcon index={index} />{item.title}</dt>
                  <dd>{item.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="projects section-shell section-line" id={hashes.projects} aria-labelledby="projects-title" data-line-reveal data-reveal-key="projects-line">
          <header className="projects-heading reveal" data-reveal data-reveal-key="projects-heading">
            <h2 className="section-title" id="projects-title">{content.projectsSection.title}</h2>
            <p>{content.projectsSection.intro}</p>
          </header>

          <div className="project-list">
            {projects.map((study, index) => {
              const to = projectPath(locale, study.id)
              const openFrom = (triggerId: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                event.preventDefault()
                openProjectModal(locale, study.id, triggerId)
              }
              const mediaTrigger = `project-trigger-${study.id}-media`
              const titleTrigger = `project-trigger-${study.id}-title`
              const ctaTrigger = `project-trigger-${study.id}-cta`
              return (
                <article className={`project-row${index % 2 === 1 ? ' project-row--reverse' : ''}`} data-project={study.id} key={study.id}>
                  <AppLink
                    id={mediaTrigger}
                    className="project-media clip-reveal"
                    to={to}
                    onClick={openFrom(mediaTrigger)}
                    aria-label={content.aria.openProject(study.shortTitle)}
                    data-clip-reveal
                    data-reveal-key={`project-image-${study.id}`}
                  >
                    <ResponsiveImage base={study.base} alt={study.alt} width={study.width} height={study.height} sizes="(max-width: 760px) calc(100vw - 24px), 54vw" />
                  </AppLink>
                  <div className="project-copy reveal reveal-delay-1" data-reveal data-reveal-key={`project-copy-${study.id}`}>
                    <div className="project-index" aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span></div>
                    <h3><AppLink id={titleTrigger} to={to} onClick={openFrom(titleTrigger)}>{study.title}</AppLink></h3>
                    <p>{study.summary}</p>
                    <AppLink id={ctaTrigger} className="text-link" to={to} onClick={openFrom(ctaTrigger)}>{content.projectsSection.inspect}</AppLink>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="building section-shell section-line" id={hashes.ongoing} aria-labelledby="building-title" data-line-reveal data-reveal-key="building-line">
          <div className="building-intro">
            <p className="building-label reveal" data-reveal data-reveal-key="building-label">{content.ongoing.eyebrow}</p>
            <h2 className="reveal reveal-delay-1" id="building-title" data-reveal data-reveal-key="building-title">{content.ongoing.title}</h2>
            <p className="building-summary reveal reveal-delay-2" data-reveal data-reveal-key="building-summary">{content.ongoing.intro}</p>
          </div>
          <ol className="building-list" aria-label={content.aria.ongoingList}>
            {content.ongoing.items.map((item, index) => (
              <li className="ongoing-row-reveal" data-reveal data-reveal-key={`building-item-${index}`} key={item}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p>{item}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <SiteFooter content={content} />
    </>
  )
}
