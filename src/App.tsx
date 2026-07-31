import { useLayoutEffect } from 'react'
import { CanonicalAnalytics } from './analytics'
import { getLocaleContent, getProject } from './content'
import { navigate, parseModalState, useAppLocation } from './router'
import { usePageMetadata } from './seo'
import { HomePage } from './pages/HomePage'
import { DetailPage } from './pages/DetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProjectDialog } from './components/ProjectDialog'

export function App() {
  const location = useAppLocation()
  const route = location.route
  const content = getLocaleContent(route.locale)
  usePageMetadata(route)

  useLayoutEffect(() => {
    const redirectTo = 'redirectTo' in route ? route.redirectTo : undefined
    if (!redirectTo) return
    navigate(redirectTo, {
      replace: true,
      scroll: redirectTo.includes('#') ? 'hash' : 'preserve',
    })
  }, [route])

  let page: React.ReactNode
  if (route.kind === 'home') {
    page = <HomePage content={content} location={location} />
  } else if (route.kind === 'project') {
    const study = getProject(route.locale, route.projectId)
    const modalState = parseModalState(location.state)
    if (modalState && modalState.locale === route.locale && modalState.projectId === route.projectId) {
      page = (
        <>
          <HomePage content={content} location={location} />
          <ProjectDialog study={study} content={content} location={location} />
        </>
      )
    } else {
      page = <DetailPage study={study} content={content} location={location} />
    }
  } else {
    page = <NotFoundPage content={content} location={location} />
  }

  return <>{page}<CanonicalAnalytics route={route} /></>
}
