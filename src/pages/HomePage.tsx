import { aboutContent, caseStudies, ongoingWorkItems } from '../content'
import { useReveal } from '../hooks/useReveal'
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

export function HomePage() {
  useReveal()

  return (
    <>
      <a className="skip-link" href="#ana-icerik">
        Ana içeriğe geç
      </a>
      <Header />
      <main id="ana-icerik">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-inner">
            <h1 className="reveal" id="hero-title" data-reveal data-reveal-key="hero-name">
              Mehmet Tüysüz
            </h1>
            <p className="hero-intro reveal reveal-delay-1" data-reveal data-reveal-key="hero-intro">
              Yapay zekâ, gerçek zamanlı algı ve özel donanım arasında çalışan sistemler geliştiriyorum.
            </p>
            <div className="hero-actions reveal reveal-delay-2" data-reveal data-reveal-key="hero-actions">
              <AppLink className="primary-link" to="/#projeler">
                Projeler
                <DirectionCue />
              </AppLink>
              <a className="secondary-link" href="https://github.com/MehmetST3" target="_blank" rel="noreferrer">
                GitHub
                <DirectionCue external />
              </a>
            </div>
          </div>
        </section>

        <section className="about section-shell section-line" id="hakkimda" aria-labelledby="about-title" data-line-reveal data-reveal-key="about-line">
          <h2 className="section-title reveal" id="about-title" data-reveal data-reveal-key="about-title">
            Hakkımda
          </h2>
          <div className="about-content">
            <div className="about-copy">
              {aboutContent.intro.map((paragraph, index) => (
                <p className="reveal about-paragraph-reveal" data-reveal data-reveal-key={`about-copy-${index}`} key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
            <dl className="about-expertise" aria-label="Çalışma alanları">
              {aboutContent.expertise.map((item, index) => (
                <div className="expertise-reveal" data-reveal data-reveal-key={`about-expertise-${index}`} key={item.title}>
                  <dt><ExpertiseIcon index={index} />{item.title}</dt>
                  <dd>{item.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="projects section-shell section-line" id="projeler" aria-labelledby="projects-title" data-line-reveal data-reveal-key="projects-line">
          <header className="projects-heading reveal" data-reveal data-reveal-key="projects-heading">
            <h2 className="section-title" id="projects-title">
              Seçili projeler
            </h2>
            <p>Ses, görüntü ve donanım katmanlarından dört çalışma.</p>
          </header>

          <div className="project-list">
            {caseStudies.map((study, index) => (
              <article className={`project-row${index % 2 === 1 ? ' project-row--reverse' : ''}`} key={study.slug}>
                <AppLink
                  className="project-media clip-reveal"
                  to={`/projeler/${study.slug}`}
                  state={{ fromHome: true }}
                  aria-label={`${study.shortTitle} detayını aç`}
                  data-clip-reveal
                  data-reveal-key={`project-image-${study.slug}`}
                >
                  <ResponsiveImage
                    base={study.image.base}
                    alt={study.image.alt}
                    width={study.image.width}
                    height={study.image.height}
                    sizes="(max-width: 760px) calc(100vw - 24px), 54vw"
                  />
                </AppLink>
                <div className="project-copy reveal reveal-delay-1" data-reveal data-reveal-key={`project-copy-${study.slug}`}>
                  <div className="project-index" aria-hidden="true">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3>
                    <AppLink to={`/projeler/${study.slug}`} state={{ fromHome: true }}>
                      {study.title}
                    </AppLink>
                  </h3>
                  <p>{study.summary}</p>
                  <AppLink className="text-link" to={`/projeler/${study.slug}`} state={{ fromHome: true }}>
                    İncele
                  </AppLink>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="building section-shell section-line" id="devam-eden" aria-labelledby="building-title" data-line-reveal data-reveal-key="building-line">
          <div className="building-intro">
            <p className="building-label reveal" data-reveal data-reveal-key="building-label">
              Şu anda
            </p>
            <h2 className="reveal reveal-delay-1" id="building-title" data-reveal data-reveal-key="building-title">
              Devam eden çalışmalar
            </h2>
            <p className="building-summary reveal reveal-delay-2" data-reveal data-reveal-key="building-summary">
              Şu anda odağımda olan üç çalışma hattı.
            </p>
          </div>
          <ol className="building-list" aria-label="Devam eden çalışmalar listesi">
            {ongoingWorkItems.map((item, index) => (
              <li className="ongoing-row-reveal" data-reveal data-reveal-key={`building-item-${index}`} key={item}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
