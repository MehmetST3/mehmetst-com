import indexHtml from '../index.html?raw'
import { PROJECT_IDS, canonicalRouteEntries, projectPath } from './route-manifest'
import { FALLBACK_SITE_URL, renderRouteShell, renderSitemap, staticCanonicalEntries } from './seo-data'

describe('localized build SEO contract', () => {
  it('keeps ten canonical route shells in exact manifest parity', () => {
    expect(canonicalRouteEntries).toHaveLength(10)
    expect(staticCanonicalEntries).toHaveLength(canonicalRouteEntries.length)
    expect(staticCanonicalEntries.map(({ path }) => path)).toEqual(canonicalRouteEntries.map(({ path }) => path))
    for (const projectId of PROJECT_IDS) {
      expect(staticCanonicalEntries.some(({ path }) => path === projectPath('tr', projectId))).toBe(true)
      expect(staticCanonicalEntries.some(({ path }) => path === projectPath('en', projectId))).toBe(true)
    }
  })

  it('renders localized canonical, hreflang, OG and robots head tags', () => {
    const englishProject = staticCanonicalEntries.find(({ path }) => path === projectPath('en', 'face-tracking'))!
    const shell = renderRouteShell(indexHtml, englishProject, FALLBACK_SITE_URL)
    expect(shell).toContain('<html lang="en"')
    expect(shell).toContain(`<link rel="canonical" href="${FALLBACK_SITE_URL}${englishProject.path}" />`)
    expect(shell).toContain('hreflang="tr"')
    expect(shell).toContain('hreflang="en"')
    expect(shell).toContain('hreflang="x-default"')
    expect(shell).toContain('<meta name="robots" content="index,follow" />')
    expect(shell).toContain(`<meta property="og:image" content="${FALLBACK_SITE_URL}/og-mehmet.png" />`)
    expect(shell).not.toContain('content="/og-mehmet.png"')
    expect(shell).toContain('<meta property="og:image:alt"')
  })

  it('builds a sitemap from canonical routes only', () => {
    const sitemap = renderSitemap(FALLBACK_SITE_URL)
    expect((sitemap.match(/<url>/g) ?? [])).toHaveLength(10)
    expect(sitemap).toContain(`${FALLBACK_SITE_URL}/tr`)
    expect(sitemap).toContain(`${FALLBACK_SITE_URL}/en`)
    expect(sitemap).not.toContain('/404')
  })
})
