import type { CaseStudy } from '../types'
import { ResponsiveImage } from './ResponsiveImage'

type ProjectDetailProps = Readonly<{
  study: CaseStudy
  mode: 'dialog' | 'page'
  closeControl: React.ReactNode
}>

export function ProjectDetail({ study, mode, closeControl }: ProjectDetailProps) {
  return (
    <article className={`project-detail project-detail--${mode}`}>
      <header className="detail-header">
        <div className="detail-heading-row">
          <p className="detail-context">Seçili çalışma</p>
          {closeControl}
        </div>
        <h1 id={`detail-title-${study.slug}`}>{study.title}</h1>
      </header>

      <figure className="detail-media">
        <ResponsiveImage
          base={study.image.base}
          alt={study.image.alt}
          width={study.image.width}
          height={study.image.height}
          eager
          sizes={mode === 'dialog' ? '(max-width: 780px) 100vw, 1080px' : '(max-width: 780px) 100vw, 1200px'}
        />
      </figure>

      <div className="detail-sections" id={`detail-description-${study.slug}`}>
        <section>
          <h2>Ne yaptım</h2>
          <p>{study.what}</p>
        </section>
        <section>
          <h2>Neden yaptım</h2>
          <p>{study.why}</p>
        </section>
        <section>
          <h2>Sonuç</h2>
          <p>{study.result}</p>
        </section>
      </div>

      <footer className="detail-footer">{closeControl}</footer>
    </article>
  )
}
