import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { FALLBACK_SITE_URL, notFoundSeoEntry, renderRouteShell, renderSitemap, staticCanonicalEntries } from './src/seo-data'

function localizedShells(siteUrl: string): Plugin {
  return {
    name: 'localized-route-shells',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const indexAsset = Object.values(bundle).find(
        (entry): entry is Extract<typeof entry, { type: 'asset' }> => entry.type === 'asset' && entry.fileName === 'index.html',
      )
      if (!indexAsset || typeof indexAsset.source !== 'string') throw new Error('Built index.html was not available for route shells')
      const template = indexAsset.source
      const entries = [...staticCanonicalEntries, notFoundSeoEntry('tr'), notFoundSeoEntry('en')]
      entries.forEach((entry) => this.emitFile({ type: 'asset', fileName: `${entry.path.slice(1)}/index.html`, source: renderRouteShell(template, entry, siteUrl) }))
      this.emitFile({ type: 'asset', fileName: '404.html', source: renderRouteShell(template, notFoundSeoEntry('tr'), siteUrl) })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: renderSitemap(siteUrl) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nSitemap: ${siteUrl.replace(/\/+$/, '')}/sitemap.xml\n` })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const siteUrl = (env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '')
  return {
    plugins: [react(), localizedShells(siteUrl)],
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      sourcemap: false,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: true,
    },
  }
})
