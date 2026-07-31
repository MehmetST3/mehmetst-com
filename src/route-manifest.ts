import type { Locale, ProjectId, SectionId } from './types'

export const LOCALES = ['tr', 'en'] as const satisfies readonly Locale[]
export const PROJECT_IDS = [
  'xtts-fine-tuning',
  'face-tracking',
  'speech-transcription',
  'gender-classification',
] as const satisfies readonly ProjectId[]

export const localeRoutes = {
  tr: {
    home: '/tr',
    projectSegment: 'projeler',
    hashes: {
      about: 'hakkimda',
      projects: 'projeler',
      ongoing: 'devam-eden',
      contact: 'iletisim',
    },
    slugs: {
      'xtts-fine-tuning': 'xtts-v2-fine-tuning',
      'face-tracking': 'gercek-zamanli-yuz-takibi',
      'speech-transcription': 'ses-tanima-transkripsiyon',
      'gender-classification': 'cinsiyet-siniflandirma-modeli',
    },
  },
  en: {
    home: '/en',
    projectSegment: 'projects',
    hashes: {
      about: 'about',
      projects: 'projects',
      ongoing: 'ongoing',
      contact: 'contact',
    },
    slugs: {
      'xtts-fine-tuning': 'xtts-v2-fine-tuning',
      'face-tracking': 'real-time-face-tracking',
      'speech-transcription': 'speech-recognition-transcription',
      'gender-classification': 'gender-classification-model',
    },
  },
} as const satisfies Record<
  Locale,
  Readonly<{
    home: string
    projectSegment: string
    hashes: Record<SectionId, string>
    slugs: Record<ProjectId, string>
  }>
>

const legacyTurkishSlugs = {
  'xtts-v2-fine-tuning': 'xtts-fine-tuning',
  'gercek-zamanli-yuz-takibi': 'face-tracking',
  'ses-tanima-transkripsiyon': 'speech-transcription',
  'cinsiyet-siniflandirma-modeli': 'gender-classification',
} as const satisfies Record<string, ProjectId>

export const legacyProjectRedirects = Object.entries(legacyTurkishSlugs).map(([slug, projectId]) => ({
  source: `/projeler/${slug}`,
  destination: projectPath('tr', projectId),
}))

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale)
}

export function isProjectId(value: string): value is ProjectId {
  return PROJECT_IDS.includes(value as ProjectId)
}

export function homePath(locale: Locale): string {
  return localeRoutes[locale].home
}

export function projectPath(locale: Locale, projectId: ProjectId): string {
  const config = localeRoutes[locale]
  return `${config.home}/${config.projectSegment}/${config.slugs[projectId]}`
}

export function sectionHash(locale: Locale, section: SectionId): string {
  return `#${localeRoutes[locale].hashes[section]}`
}

export function safeDecodeHash(hash: string): string {
  const value = hash.replace(/^#/, '')
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function sectionFromHash(hash: string): SectionId | undefined {
  const value = safeDecodeHash(hash)
  return (Object.keys(localeRoutes.tr.hashes) as SectionId[]).find(
    (section) => localeRoutes.tr.hashes[section] === value || localeRoutes.en.hashes[section] === value,
  )
}

export function localizedHash(hash: string, locale: Locale): string {
  if (!hash) return ''
  const section = sectionFromHash(hash)
  return section ? sectionHash(locale, section) : hash
}

export function projectIdFromSlug(locale: Locale, slug: string): ProjectId | undefined {
  return PROJECT_IDS.find((projectId) => localeRoutes[locale].slugs[projectId] === slug)
}

export function legacyProjectId(slug: string): ProjectId | undefined {
  return legacyTurkishSlugs[slug as keyof typeof legacyTurkishSlugs]
}

export const canonicalRouteEntries = LOCALES.flatMap((locale) => [
  { locale, kind: 'home' as const, path: homePath(locale) },
  ...PROJECT_IDS.map((projectId) => ({ locale, kind: 'project' as const, projectId, path: projectPath(locale, projectId) })),
])
