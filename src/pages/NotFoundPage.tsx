import { homePath } from '../route-manifest'
import type { AppLocation } from '../router'
import type { LocaleContent } from '../types'
import { AppLink } from '../components/AppLink'
import { Header } from '../components/Header'

export function NotFoundPage({ content, location }: Readonly<{ content: LocaleContent; location: AppLocation }>) {
  return (
    <>
      <a className="skip-link" href="#not-found">{content.aria.skipHome}</a>
      <Header content={content} location={location} />
      <main className="not-found" id="not-found">
        <div className="not-found-inner">
          <p>{content.notFound.eyebrow}</p>
          <h1>{content.notFound.title}</h1>
          <div className="not-found-copy">
            <p>{content.notFound.body}</p>
            <AppLink className="text-link" to={homePath(content.locale)}>{content.notFound.backHome}</AppLink>
          </div>
        </div>
      </main>
    </>
  )
}
