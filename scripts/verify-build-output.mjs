import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export function normalizeOrigin(value) {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Expected an HTTP(S) site origin, received ${value}`)
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`VITE_SITE_URL must be an origin without credentials, path, query or hash: ${value}`)
  }
  return url.origin
}

function valuesFrom(html, expression) {
  return [...html.matchAll(expression)].map((match) => match[1])
}

function expectExactMetadata(html, expression, expected, label, relativePath) {
  const values = valuesFrom(html, expression)
  if (values.length !== 1 || values[0] !== expected) {
    throw new Error(`${relativePath} ${label} must equal ${expected}; received ${values.length === 0 ? 'none' : values.join(', ')}`)
  }
}

function routeShells(canonicalRoutes) {
  return [
    { relativePath: 'index.html', route: '/tr' },
    ...canonicalRoutes.map((route) => ({ relativePath: `${route.slice(1)}/index.html`, route })),
    { relativePath: 'tr/404/index.html', route: '/tr/404' },
    { relativePath: 'en/404/index.html', route: '/en/404' },
    { relativePath: '404.html', route: '/tr/404' },
  ]
}

export async function verifyBuildOutput({ root, expectedOrigin, canonicalRoutes }) {
  const origin = normalizeOrigin(expectedOrigin)
  if (!Array.isArray(canonicalRoutes) || canonicalRoutes.length === 0) throw new Error('No canonical routes were provided')
  if (new Set(canonicalRoutes).size !== canonicalRoutes.length || canonicalRoutes.some((route) => !/^\/[a-z0-9/-]+$/.test(route))) {
    throw new Error('Canonical routes must be unique absolute paths')
  }

  const outputRoot = path.resolve(root)
  const shells = routeShells(canonicalRoutes)
  for (const { relativePath, route } of shells) {
    const file = path.join(outputRoot, relativePath)
    try {
      await access(file)
    } catch {
      throw new Error(`Missing build shell: ${relativePath}`)
    }
    const html = await readFile(file, 'utf8')
    const canonical = `${origin}${route}`
    expectExactMetadata(html, /<link\b[^>]*\brel="canonical"[^>]*\bhref="([^"]+)"[^>]*>/g, canonical, 'canonical URL', relativePath)
    expectExactMetadata(html, /<meta\b[^>]*\bproperty="og:url"[^>]*\bcontent="([^"]+)"[^>]*>/g, canonical, 'og:url', relativePath)
    expectExactMetadata(
      html,
      /<meta\b[^>]*\bproperty="og:image"[^>]*\bcontent="([^"]+)"[^>]*>/g,
      `${origin}/og-mehmet.png`,
      'og:image',
      relativePath,
    )
  }

  const sitemapPath = path.join(outputRoot, 'sitemap.xml')
  const robotsPath = path.join(outputRoot, 'robots.txt')
  await Promise.all([access(sitemapPath), access(robotsPath)])
  const [sitemap, robots] = await Promise.all([readFile(sitemapPath, 'utf8'), readFile(robotsPath, 'utf8')])

  const sitemapUrls = valuesFrom(sitemap, /<loc>([^<]+)<\/loc>/g)
  const expectedSitemapUrls = canonicalRoutes.map((route) => `${origin}${route}`)
  if (sitemapUrls.length !== expectedSitemapUrls.length || sitemapUrls.some((url, index) => url !== expectedSitemapUrls[index])) {
    throw new Error(`sitemap.xml URLs must exactly match ${expectedSitemapUrls.join(', ')}; received ${sitemapUrls.join(', ')}`)
  }

  const expectedRobots = `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
  if (robots !== expectedRobots) {
    throw new Error(`robots.txt must exactly equal ${JSON.stringify(expectedRobots)}`)
  }

  return { htmlShells: shells.length, sitemapRoutes: canonicalRoutes.length, expectedOrigin: origin }
}

export async function loadSeoBuildContract(projectRoot) {
  const originalNodeEnv = process.env.NODE_ENV
  let server
  try {
    const { createServer } = await import('vite')
    server = await createServer({
      root: projectRoot,
      configFile: false,
      logLevel: 'error',
      appType: 'custom',
      optimizeDeps: { noDiscovery: true },
      server: { middlewareMode: true, watch: null },
    })
    const seoData = await server.ssrLoadModule('/src/seo-data.ts')
    return {
      fallbackSiteUrl: seoData.FALLBACK_SITE_URL,
      canonicalRoutes: seoData.staticCanonicalEntries.map(({ path: route }) => route),
    }
  } finally {
    await server?.close()
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = originalNodeEnv
  }
}

export async function runBuildOutputVerification({ projectRoot, outputRoot = path.join(projectRoot, 'dist'), siteUrl = process.env.VITE_SITE_URL }) {
  const contract = await loadSeoBuildContract(projectRoot)
  return verifyBuildOutput({
    root: outputRoot,
    expectedOrigin: siteUrl || contract.fallbackSiteUrl,
    canonicalRoutes: contract.canonicalRoutes,
  })
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
if (isMain) {
  const projectRoot = path.resolve(path.dirname(process.argv[1]), '..')
  try {
    const result = await runBuildOutputVerification({ projectRoot })
    console.log(
      `Verified ${result.htmlShells} HTML shells, ${result.sitemapRoutes} sitemap routes, robots.txt, and exact origin ${result.expectedOrigin}`,
    )
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
