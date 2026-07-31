import { useEffect, useState } from 'react'

export type AppHistoryState = Readonly<{
  fromHome?: boolean
}>

type AppLocation = Readonly<{
  pathname: string
  state: AppHistoryState | null
}>

export function getNavigationBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

function scrollToHash(hash: string) {
  document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({
    behavior: getNavigationBehavior(),
    block: 'start',
  })
}

function scheduleHashScroll(hash: string) {
  window.requestAnimationFrame(() => scrollToHash(hash))
}

function readLocation(): AppLocation {
  return {
    pathname: window.location.pathname,
    state: window.history.state as AppHistoryState | null,
  }
}

export function useAppLocation(): AppLocation {
  const [location, setLocation] = useState(readLocation)

  useEffect(() => {
    const update = (event: PopStateEvent) => {
      setLocation(readLocation())

      if ('appNavigation' in event) return

      if (window.location.hash) scheduleHashScroll(window.location.hash)
    }
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  return location
}

export function navigate(to: string, state: AppHistoryState | null = null, replace = false) {
  const destination = new URL(to, window.location.origin)
  const current = new URL(window.location.href)
  const sameLocation = current.pathname === destination.pathname && current.hash === destination.hash
  const sameState = Boolean(window.history.state?.fromHome) === Boolean(state?.fromHome)

  if (!sameLocation || !sameState || replace) {
    if (replace) {
      window.history.replaceState(state, '', to)
    } else {
      window.history.pushState(state, '', to)
    }
  }

  const navigationEvent = new PopStateEvent('popstate', { state })
  Object.defineProperty(navigationEvent, 'appNavigation', { value: true })
  window.dispatchEvent(navigationEvent)

  if (state?.fromHome) return
  if (destination.hash) {
    scheduleHashScroll(destination.hash)
  } else if (!sameLocation) {
    window.scrollTo({ top: 0, left: 0, behavior: getNavigationBehavior() })
  }
}

export function goBack() {
  window.history.back()
}
