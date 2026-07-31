import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  homePath,
  isLocale,
  legacyProjectId,
  localeRoutes,
  localizedHash,
  projectIdFromSlug,
  projectPath,
  safeDecodeHash,
} from './route-manifest'
import type { Locale, ProjectId } from './types'

export type HomeRoute = Readonly<{
  kind: 'home'
  locale: Locale
  canonicalPath: string
  redirectTo?: string
}>

export type ProjectRoute = Readonly<{
  kind: 'project'
  locale: Locale
  projectId: ProjectId
  canonicalPath: string
  redirectTo?: string
}>

export type NotFoundRoute = Readonly<{
  kind: 'notFound'
  locale: Locale
  canonicalPath: string
}>

export type ParsedRoute = HomeRoute | ProjectRoute | NotFoundRoute

export type ModalBackground = Readonly<{
  pathname: string
  search: string
  hash: string
  scrollX: number
  scrollY: number
  triggerId: string
}>

export type ProjectModalHistoryState = Readonly<{
  version: 1
  kind: 'project-modal'
  locale: Locale
  projectId: ProjectId
  background: ModalBackground
}>

export type AppHistoryState = ProjectModalHistoryState | null

export type AppLocation = Readonly<{
  pathname: string
  search: string
  hash: string
  state: AppHistoryState
  route: ParsedRoute
}>

type NavigateOptions = Readonly<{
  state?: AppHistoryState
  replace?: boolean
  scroll?: 'top' | 'hash' | 'preserve'
}>

let pendingBackgroundRestore: ModalBackground | null = null

function normalizedPathname(pathname: string): string {
  if (pathname === '/') return pathname
  return pathname.replace(/\/+$/, '') || '/'
}

function redirectUrl(pathname: string, url: URL, locale: Locale): string {
  return `${pathname}${url.search}${localizedHash(url.hash, locale)}`
}

export function parseRoute(input: string | URL): ParsedRoute {
  const url = input instanceof URL ? input : new URL(input, window.location.origin)
  const pathname = normalizedPathname(url.pathname)
  const segments = pathname.split('/').filter(Boolean)

  if (pathname === '/') {
    return { kind: 'home', locale: 'tr', canonicalPath: homePath('tr'), redirectTo: redirectUrl(homePath('tr'), url, 'tr') }
  }

  if (segments[0] === 'projeler' && segments.length === 2) {
    const projectId = legacyProjectId(segments[1] ?? '')
    if (projectId) {
      const canonicalPath = projectPath('tr', projectId)
      return { kind: 'project', locale: 'tr', projectId, canonicalPath, redirectTo: `${canonicalPath}${url.search}${url.hash}` }
    }
  }

  const firstSegment = segments[0] ?? ''
  const locale: Locale = isLocale(firstSegment) ? firstSegment : 'tr'
  const config = localeRoutes[locale]

  if (segments.length === 1 && segments[0] === locale) {
    const canonicalPath = homePath(locale)
    const hasTrailingSlash = url.pathname !== canonicalPath
    return {
      kind: 'home',
      locale,
      canonicalPath,
      ...(hasTrailingSlash ? { redirectTo: redirectUrl(canonicalPath, url, locale) } : {}),
    }
  }

  if (segments.length === 3 && segments[0] === locale && segments[1] === config.projectSegment) {
    const projectId = projectIdFromSlug(locale, segments[2] ?? '')
    if (projectId) {
      const canonicalPath = projectPath(locale, projectId)
      const hasTrailingSlash = url.pathname !== canonicalPath
      return {
        kind: 'project',
        locale,
        projectId,
        canonicalPath,
        ...(hasTrailingSlash ? { redirectTo: `${canonicalPath}${url.search}${url.hash}` } : {}),
      }
    }
  }

  return { kind: 'notFound', locale, canonicalPath: pathname }
}

function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export function parseModalState(value: unknown): ProjectModalHistoryState | null {
  if (!value || typeof value !== 'object') return null
  const state = value as Partial<ProjectModalHistoryState>
  const localeCandidate = state.locale ?? ''
  if (state.version !== 1 || state.kind !== 'project-modal' || !isLocale(localeCandidate)) return null
  if (!state.projectId || !Object.hasOwn(localeRoutes[localeCandidate].slugs, state.projectId)) return null
  const background = state.background as Partial<ModalBackground> | undefined
  if (!background) return null
  if (
    typeof background.pathname !== 'string' ||
    typeof background.search !== 'string' ||
    typeof background.hash !== 'string' ||
    typeof background.triggerId !== 'string' ||
    !isFiniteCoordinate(background.scrollX) ||
    !isFiniteCoordinate(background.scrollY)
  ) {
    return null
  }
  const backgroundRoute = parseRoute(new URL(`${background.pathname}${background.search}${background.hash}`, window.location.origin))
  if (backgroundRoute.kind !== 'home' || backgroundRoute.locale !== state.locale) return null
  if (!background.triggerId.startsWith(`project-trigger-${state.projectId}-`)) return null
  return state as ProjectModalHistoryState
}

function readLocation(): AppLocation {
  const url = new URL(window.location.href)
  return {
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    state: parseModalState(window.history.state),
    route: parseRoute(url),
  }
}

export function getNavigationBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

function scrollToHash(hash: string) {
  document.getElementById(safeDecodeHash(hash))?.scrollIntoView({
    behavior: getNavigationBehavior(),
    block: 'start',
  })
}

function scheduleHashScroll(hash: string) {
  window.requestAnimationFrame(() => scrollToHash(hash))
}

export function navigate(to: string, options: NavigateOptions = {}) {
  const destination = new URL(to, window.location.origin)
  const current = new URL(window.location.href)
  const sameLocation = current.pathname === destination.pathname && current.search === destination.search && current.hash === destination.hash
  const state = options.state ?? null

  if (!sameLocation || options.replace || window.history.state !== state) {
    if (options.replace) window.history.replaceState(state, '', to)
    else window.history.pushState(state, '', to)
  }

  const navigationEvent = new PopStateEvent('popstate', { state })
  Object.defineProperty(navigationEvent, 'appNavigation', { value: true })
  window.dispatchEvent(navigationEvent)

  if (options.scroll === 'preserve' || state?.kind === 'project-modal') return
  if ((options.scroll === 'hash' || destination.hash) && destination.hash) {
    scheduleHashScroll(destination.hash)
  } else if (!sameLocation || options.scroll === 'top') {
    window.scrollTo({ top: 0, left: 0, behavior: getNavigationBehavior() })
  }
}

export function useAppLocation(): AppLocation {
  const [location, setLocation] = useState(readLocation)
  const currentRef = useRef(location)

  useEffect(() => {
    const update = (event: PopStateEvent) => {
      const previous = currentRef.current
      let next = readLocation()
      const previousModal = parseModalState(previous.state)

      if (previousModal && !next.state) {
        pendingBackgroundRestore = previousModal.background
        const expectedBackground = `${previousModal.background.pathname}${previousModal.background.search}${previousModal.background.hash}`
        const actualBackground = `${next.pathname}${next.search}${next.hash}`
        if (actualBackground !== expectedBackground) {
          window.history.replaceState(null, '', expectedBackground)
          next = readLocation()
        }
      }

      currentRef.current = next
      setLocation(next)

      if ('appNavigation' in event || previousModal) return
      if (next.hash) scheduleHashScroll(next.hash)
    }
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  return location
}

export function openProjectModal(locale: Locale, projectId: ProjectId, triggerId: string) {
  const currentState = parseModalState(window.history.state)
  if (currentState?.projectId === projectId && currentState.locale === locale) return
  const currentRoute = parseRoute(window.location.href)
  const backgroundPath = currentRoute.kind === 'home' ? window.location.pathname : homePath(locale)
  const state: ProjectModalHistoryState = {
    version: 1,
    kind: 'project-modal',
    locale,
    projectId,
    background: {
      pathname: backgroundPath,
      search: window.location.search,
      hash: window.location.hash,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      triggerId,
    },
  }
  navigate(`${projectPath(locale, projectId)}${window.location.search}${window.location.hash}`, { state, scroll: 'preserve' })
}

export function closeProjectModal() {
  const state = parseModalState(window.history.state)
  if (!state) {
    const route = parseRoute(window.location.href)
    navigate(homePath(route.locale), { replace: true, scroll: 'top' })
    return
  }

  if (window.history.length > 1) {
    window.history.back()
    return
  }

  pendingBackgroundRestore = state.background
  const backgroundUrl = `${state.background.pathname}${state.background.search}${state.background.hash}`
  navigate(backgroundUrl, { replace: true, scroll: 'preserve' })
}

export function useBackgroundRestore(navigationKey: string) {
  useLayoutEffect(() => {
    const restore = pendingBackgroundRestore
    if (!restore) return
    pendingBackgroundRestore = null
    window.scrollTo({ left: restore.scrollX, top: restore.scrollY, behavior: 'auto' })
    window.requestAnimationFrame(() => {
      document.getElementById(restore.triggerId)?.focus({ preventScroll: true })
    })
  }, [navigationKey])
}

function runLocaleTransition(update: () => void) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const transitionDocument = document as Document & {
    startViewTransition?: (callback: () => void) => { finished: Promise<void> }
  }
  if (!reduced && transitionDocument.startViewTransition) {
    transitionDocument.startViewTransition(() => {
      flushSync(update)
    })
    return
  }
  if (!reduced) {
    const root = document.documentElement
    root.classList.remove('locale-transitioning')
    void root.offsetWidth
    root.classList.add('locale-transitioning')
    window.setTimeout(() => root.classList.remove('locale-transitioning'), 180)
  }
  update()
}

export function switchLocale(targetLocale: Locale, location: AppLocation) {
  if (targetLocale === location.route.locale) return
  const modalState = parseModalState(location.state)
  let targetPath: string
  let targetState: AppHistoryState = null

  if (location.route.kind === 'project') {
    targetPath = `${projectPath(targetLocale, location.route.projectId)}${location.search}${localizedHash(location.hash, targetLocale)}`
    if (modalState) {
      const sectionHash = localizedHash(modalState.background.hash, targetLocale)
      targetState = {
        ...modalState,
        locale: targetLocale,
        background: {
          ...modalState.background,
          pathname: homePath(targetLocale),
          hash: sectionHash,
        },
      }
    }
  } else if (location.route.kind === 'home') {
    targetPath = `${homePath(targetLocale)}${location.search}${localizedHash(location.hash, targetLocale)}`
  } else {
    targetPath = `/${targetLocale}/${targetLocale === 'tr' ? 'bulunamadi' : 'not-found'}`
  }

  runLocaleTransition(() => navigate(targetPath, { state: targetState, replace: true, scroll: 'preserve' }))
}

export function analyticsDescriptor(route: ParsedRoute): Readonly<{ route: string; path: string }> {
  if (route.kind === 'project') {
    return {
      route: `/${route.locale}/${localeRoutes[route.locale].projectSegment}/[project]`,
      path: projectPath(route.locale, route.projectId),
    }
  }
  if (route.kind === 'home') return { route: homePath(route.locale), path: homePath(route.locale) }
  return { route: `/${route.locale}/404`, path: `/${route.locale}/404` }
}
