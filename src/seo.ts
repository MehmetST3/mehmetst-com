import { useEffect } from 'react'
import { getLocaleContent, getProject } from './content'
import { homePath, projectPath } from './route-manifest'
import type { ParsedRoute } from './router'
import type { Locale } from './types'
import { FALLBACK_SITE_URL } from './seo-data'

function siteUrl(): string {
  return (import.meta.env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '')
}

function absoluteUrl(pathname: string): string {
  return `${siteUrl()}${pathname}`
}

function upsertMeta(selector: string, attributes: Record<string, string>, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value))
    document.head.append(element)
  }
  element.content = content
}

function upsertLink(rel: string, href: string, hrefLang?: string) {
  const selector = hrefLang ? `link[rel="${rel}"][hreflang="${hrefLang}"]` : `link[rel="${rel}"]:not([hreflang])`
  let element = document.head.querySelector<HTMLLinkElement>(selector)
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    if (hrefLang) element.hreflang = hrefLang
    document.head.append(element)
  }
  element.href = href
}

export function routeSeo(route: ParsedRoute): Readonly<{
  title: string
  description: string
  canonicalPath: string
  alternatePaths: Record<Locale, string>
  robots: string
}> {
  const content = getLocaleContent(route.locale)
  if (route.kind === 'project') {
    const project = getProject(route.locale, route.projectId)
    return {
      title: `${project.shortTitle} | Mehmet Tüysüz`,
      description: project.summary,
      canonicalPath: projectPath(route.locale, route.projectId),
      alternatePaths: { tr: projectPath('tr', route.projectId), en: projectPath('en', route.projectId) },
      robots: 'index,follow',
    }
  }
  if (route.kind === 'home') {
    return {
      title: content.seo.homeTitle,
      description: content.seo.homeDescription,
      canonicalPath: homePath(route.locale),
      alternatePaths: { tr: homePath('tr'), en: homePath('en') },
      robots: 'index,follow',
    }
  }
  return {
    title: content.seo.notFoundTitle,
    description: content.seo.notFoundDescription,
    canonicalPath: `/${route.locale}/404`,
    alternatePaths: { tr: '/tr/404', en: '/en/404' },
    robots: 'noindex,follow',
  }
}

export function usePageMetadata(route: ParsedRoute) {
  useEffect(() => {
    const content = getLocaleContent(route.locale)
    const seo = routeSeo(route)
    document.documentElement.lang = route.locale
    document.title = seo.title
    upsertMeta('meta[name="description"]', { name: 'description' }, seo.description)
    upsertMeta('meta[name="robots"]', { name: 'robots' }, seo.robots)
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'website')
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale' }, content.seo.ogLocale)
    upsertMeta('meta[property="og:locale:alternate"]', { property: 'og:locale:alternate' }, route.locale === 'tr' ? 'en_US' : 'tr_TR')
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, seo.title)
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, seo.description)
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, absoluteUrl(seo.canonicalPath))
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, absoluteUrl('/og-mehmet.png'))
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt' }, content.seo.ogImageAlt)
    upsertLink('canonical', absoluteUrl(seo.canonicalPath))
    upsertLink('alternate', absoluteUrl(seo.alternatePaths.tr), 'tr')
    upsertLink('alternate', absoluteUrl(seo.alternatePaths.en), 'en')
    upsertLink('alternate', absoluteUrl(seo.alternatePaths.tr), 'x-default')
  }, [route])
}
