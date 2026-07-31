import { getLocaleContent, getProject } from './content'
import { canonicalRouteEntries, homePath, projectPath } from './route-manifest'
import type { Locale, ProjectId } from './types'

export const FALLBACK_SITE_URL = 'https://mehmetst-com.vercel.app'

export type StaticSeoEntry = Readonly<{
  locale: Locale
  path: string
  title: string
  description: string
  ogLocale: string
  ogImageAlt: string
  alternatePaths: Record<Locale, string>
  robots: string
}>

export function staticSeoEntry(locale: Locale, kind: 'home' | 'project', projectId?: ProjectId): StaticSeoEntry {
  const content = getLocaleContent(locale)
  if (kind === 'project' && projectId) {
    const project = getProject(locale, projectId)
    return {
      locale,
      path: projectPath(locale, projectId),
      title: `${project.shortTitle} | Mehmet Tüysüz`,
      description: project.summary,
      ogLocale: content.seo.ogLocale,
      ogImageAlt: project.alt,
      alternatePaths: { tr: projectPath('tr', projectId), en: projectPath('en', projectId) },
      robots: 'index,follow',
    }
  }
  return {
    locale,
    path: homePath(locale),
    title: content.seo.homeTitle,
    description: content.seo.homeDescription,
    ogLocale: content.seo.ogLocale,
    ogImageAlt: content.seo.ogImageAlt,
    alternatePaths: { tr: homePath('tr'), en: homePath('en') },
    robots: 'index,follow',
  }
}

export function notFoundSeoEntry(locale: Locale): StaticSeoEntry {
  const content = getLocaleContent(locale)
  return {
    locale,
    path: `/${locale}/404`,
    title: content.seo.notFoundTitle,
    description: content.seo.notFoundDescription,
    ogLocale: content.seo.ogLocale,
    ogImageAlt: content.seo.ogImageAlt,
    alternatePaths: { tr: '/tr/404', en: '/en/404' },
    robots: 'noindex,follow',
  }
}

export const staticCanonicalEntries = canonicalRouteEntries.map((entry) =>
  staticSeoEntry(entry.locale, entry.kind, entry.kind === 'project' ? entry.projectId : undefined),
)

function escaped(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export function renderRouteShell(template: string, entry: StaticSeoEntry, siteUrl: string): string {
  const origin = siteUrl.replace(/\/+$/, '')
  const canonical = `${origin}${entry.path}`
  const headLinks = [
    `<link rel="canonical" href="${canonical}" />`,
    `<link rel="alternate" hreflang="tr" href="${origin}${entry.alternatePaths.tr}" />`,
    `<link rel="alternate" hreflang="en" href="${origin}${entry.alternatePaths.en}" />`,
    `<link rel="alternate" hreflang="x-default" href="${origin}${entry.alternatePaths.tr}" />`,
    `<meta name="robots" content="${entry.robots}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${origin}/og-mehmet.png" />`,
    `<meta property="og:image:alt" content="${escaped(entry.ogImageAlt)}" />`,
  ].join('\n    ')

  return template
    .replace(/<html lang="[^"]+"/, `<html lang="${entry.locale}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escaped(entry.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escaped(entry.description)}" />`)
    .replace(/<meta property="og:locale" content="[^"]*" \/>/, `<meta property="og:locale" content="${entry.ogLocale}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escaped(entry.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escaped(entry.description)}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>\s*/, '')
    .replace('</head>', `    ${headLinks}\n  </head>`)
}

export function renderSitemap(siteUrl: string): string {
  const origin = siteUrl.replace(/\/+$/, '')
  const urls = staticCanonicalEntries.map((entry) => `  <url><loc>${origin}${entry.path}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
