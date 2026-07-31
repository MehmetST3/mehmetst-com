import type { LocaleContent, LocalizedCaseStudy } from '../types'
import { ResponsiveImage } from './ResponsiveImage'

type ProjectDetailProps = Readonly<{
  study: LocalizedCaseStudy
  content: LocaleContent
  mode: 'dialog' | 'page'
  closeControl: React.ReactNode
  headerExtra?: React.ReactNode
}>

export function ProjectDetail({ study, content, mode, closeControl, headerExtra }: ProjectDetailProps) {
  return (
    <article className={`project-detail project-detail--${mode}`}>
      <header className="detail-header">
        <div className="detail-heading-row">
          <p className="detail-context">{content.detail.context}</p>
          <div className="detail-heading-controls">{headerExtra}{closeControl}</div>
        </div>
        <h1 id={`detail-title-${study.id}`}>{study.title}</h1>
      </header>
      <figure className="detail-media">
        <ResponsiveImage base={study.base} alt={study.alt} width={study.width} height={study.height} eager sizes={mode === 'dialog' ? '(max-width: 780px) 100vw, 1080px' : '(max-width: 780px) 100vw, 1200px'} />
      </figure>
      <div className="detail-sections" id={`detail-description-${study.id}`}>
        <section><h2>{content.detail.what}</h2><p>{study.what}</p></section>
        <section><h2>{content.detail.why}</h2><p>{study.why}</p></section>
        <section><h2>{content.detail.result}</h2><p>{study.result}</p></section>
      </div>
      <footer className="detail-footer">{closeControl}</footer>
    </article>
  )
}
