import vercelConfig from '../vercel.json'
import { legacyProjectRedirects } from './route-manifest'

describe('Vercel canonical route contract', () => {
  it('permanently redirects the root and every legacy Turkish project URL', () => {
    const redirectRoutes = vercelConfig.routes.filter((route) => route.status === 308)
    expect(redirectRoutes).toContainEqual({ src: '/', status: 308, headers: { Location: '/tr' } })
    for (const redirect of legacyProjectRedirects) {
      expect(redirectRoutes).toContainEqual({ src: redirect.source, status: 308, headers: { Location: redirect.destination } })
    }
  })

  it('serves existing files first and returns localized 404 status for unknown routes', () => {
    expect(vercelConfig.routes).toContainEqual({ handle: 'filesystem' })
    expect(vercelConfig.routes).toContainEqual({ src: '/en(?:/.*)?', dest: '/en/404/index.html', status: 404 })
    expect(vercelConfig.routes).toContainEqual({ src: '/tr(?:/.*)?', dest: '/tr/404/index.html', status: 404 })
  })
})
