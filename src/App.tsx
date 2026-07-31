import { getCaseStudy } from './content'
import { useAppLocation } from './router'
import { HomePage } from './pages/HomePage'
import { DetailPage } from './pages/DetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProjectDialog } from './components/ProjectDialog'

export function App() {
  const location = useAppLocation()
  const projectSlug = location.pathname.startsWith('/projeler/')
    ? location.pathname.split('/').filter(Boolean).at(-1)
    : undefined
  const study = getCaseStudy(projectSlug)

  if (location.pathname === '/') return <HomePage />
  if (!study) return <NotFoundPage />
  if (location.state?.fromHome) {
    return (
      <>
        <HomePage />
        <ProjectDialog study={study} />
      </>
    )
  }

  return <DetailPage study={study} />
}
