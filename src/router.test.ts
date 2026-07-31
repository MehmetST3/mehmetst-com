import { waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { homePath, localizedHash, projectPath, safeDecodeHash, sectionHash } from './route-manifest'
import {
  getNavigationBehavior,
  closeProjectModal,
  navigate,
  openProjectModal,
  parseModalState,
  parseRoute,
  switchLocale,
  type AppLocation,
} from './router'

describe('typed localized routing', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/tr')
    vi.mocked(window.scrollTo).mockClear()
    vi.mocked(HTMLElement.prototype.scrollIntoView).mockClear()
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  it('parses canonical homes and all eight canonical project routes', () => {
    expect(parseRoute('/tr')).toMatchObject({ kind: 'home', locale: 'tr', canonicalPath: '/tr' })
    expect(parseRoute('/en')).toMatchObject({ kind: 'home', locale: 'en', canonicalPath: '/en' })
    expect(parseRoute(projectPath('tr', 'face-tracking'))).toMatchObject({ kind: 'project', locale: 'tr', projectId: 'face-tracking' })
    expect(parseRoute(projectPath('en', 'gender-classification'))).toMatchObject({ kind: 'project', locale: 'en', projectId: 'gender-classification' })
  })

  it('normalizes legacy routes and localizes unknown routes', () => {
    expect(parseRoute('/')).toMatchObject({ kind: 'home', locale: 'tr', redirectTo: '/tr' })
    expect(parseRoute('/projeler/xtts-v2-fine-tuning')).toMatchObject({
      kind: 'project',
      locale: 'tr',
      projectId: 'xtts-fine-tuning',
      redirectTo: '/tr/projeler/xtts-v2-fine-tuning',
    })
    expect(parseRoute('/en/missing')).toMatchObject({ kind: 'notFound', locale: 'en' })
    expect(parseRoute('/tr/eksik')).toMatchObject({ kind: 'notFound', locale: 'tr' })
  })

  it.each([
    ['xtts-v2-fine-tuning', 'xtts-fine-tuning'],
    ['gercek-zamanli-yuz-takibi', 'face-tracking'],
    ['ses-tanima-transkripsiyon', 'speech-transcription'],
    ['cinsiyet-siniflandirma-modeli', 'gender-classification'],
  ] as const)('normalizes legacy slug %s while preserving query and hash', (slug, projectId) => {
    const route = parseRoute(`/projeler/${slug}?from=legacy#kept`)
    expect(route).toMatchObject({
      kind: 'project',
      locale: 'tr',
      projectId,
      redirectTo: `${projectPath('tr', projectId)}?from=legacy#kept`,
    })
  })

  it('preserves query and hash when removing a canonical project trailing slash', () => {
    expect(parseRoute('/en/projects/real-time-face-tracking/?source=mail#details')).toMatchObject({
      kind: 'project',
      locale: 'en',
      projectId: 'face-tracking',
      redirectTo: '/en/projects/real-time-face-tracking?source=mail#details',
    })
  })

  it.each(['#%', '#%E0%A4%A'])(`survives malformed percent hash %s`, (hash) => {
    expect(() => safeDecodeHash(hash)).not.toThrow()
    expect(localizedHash(hash, 'en')).toBe(hash)
    expect(() => parseRoute(`/${hash}`)).not.toThrow()
    expect(() => navigate(`/tr${hash}`, { scroll: 'hash' })).not.toThrow()
  })

  it('smoothly reaches localized hash targets and respects reduced motion', async () => {
    const target = document.createElement('section')
    target.id = 'projects'
    document.body.append(target)
    navigate(`/en${sectionHash('en', 'projects')}`, { scroll: 'hash' })
    await waitFor(() => expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' }))

    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    expect(getNavigationBehavior()).toBe('auto')
    target.remove()
  })

  it('captures exact modal background state without resetting scroll and rejects malformed state', () => {
    window.history.replaceState(null, '', '/tr#projeler')
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 17 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 834 })
    openProjectModal('tr', 'face-tracking', 'project-trigger-face-tracking-cta')

    expect(window.location.pathname).toBe(projectPath('tr', 'face-tracking'))
    expect(parseModalState(window.history.state)).toMatchObject({
      version: 1,
      kind: 'project-modal',
      locale: 'tr',
      projectId: 'face-tracking',
      background: { pathname: '/tr', hash: '#projeler', scrollX: 17, scrollY: 834, triggerId: 'project-trigger-face-tracking-cta' },
    })
    expect(window.scrollTo).not.toHaveBeenCalled()
    expect(parseModalState({ kind: 'project-modal', version: 99 })).toBeNull()
  })

  it('switches locale with replaceState while preserving semantic home hash and modal state', () => {
    window.history.replaceState(null, '', '/tr#hakkimda')
    const homeLocation: AppLocation = {
      pathname: '/tr', search: '', hash: '#hakkimda', state: null, route: parseRoute('/tr'),
    }
    const replaceState = vi.spyOn(window.history, 'replaceState')
    switchLocale('en', homeLocation)
    expect(window.location.href).toContain('/en#about')
    expect(replaceState).toHaveBeenCalled()

    window.history.replaceState(null, '', '/tr#projeler')
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 0 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 600 })
    openProjectModal('tr', 'xtts-fine-tuning', 'project-trigger-xtts-fine-tuning-title')
    const modalLocation: AppLocation = {
      pathname: window.location.pathname,
      search: '',
      hash: '',
      state: parseModalState(window.history.state),
      route: parseRoute(window.location.href),
    }
    switchLocale('en', modalLocation)
    expect(window.location.pathname).toBe(projectPath('en', 'xtts-fine-tuning'))
    expect(parseModalState(window.history.state)).toMatchObject({
      locale: 'en',
      projectId: 'xtts-fine-tuning',
      background: { pathname: homePath('en'), hash: '#projects', scrollY: 600 },
    })
    replaceState.mockRestore()
  })

  it('preserves project query and safely translates known hashes during locale switch', () => {
    window.history.replaceState(null, '', '/tr/projeler/gercek-zamanli-yuz-takibi?from=share#projeler')
    const location: AppLocation = {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: null,
      route: parseRoute(window.location.href),
    }
    switchLocale('en', location)
    expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe(
      '/en/projects/real-time-face-tracking?from=share#projects',
    )
  })

  it.each([
    ['background locale mismatch', { version: 1, kind: 'project-modal', locale: 'tr', projectId: 'face-tracking', background: { pathname: '/en', search: '', hash: '#about', scrollX: 12, scrollY: 720, triggerId: 'project-trigger-face-tracking-media' } }],
    ['wrong project trigger', { version: 1, kind: 'project-modal', locale: 'tr', projectId: 'face-tracking', background: { pathname: '/tr', search: '', hash: '#projeler', scrollX: 12, scrollY: 720, triggerId: 'project-trigger-gender-classification-media' } }],
    ['negative scroll', { version: 1, kind: 'project-modal', locale: 'tr', projectId: 'face-tracking', background: { pathname: '/tr', search: '', hash: '#projeler', scrollX: -1, scrollY: 720, triggerId: 'project-trigger-face-tracking-media' } }],
    ['NaN scroll', { version: 1, kind: 'project-modal', locale: 'tr', projectId: 'face-tracking', background: { pathname: '/tr', search: '', hash: '#projeler', scrollX: 12, scrollY: Number.NaN, triggerId: 'project-trigger-face-tracking-media' } }],
    ['missing search/hash', { version: 1, kind: 'project-modal', locale: 'tr', projectId: 'face-tracking', background: { pathname: '/tr', scrollX: 12, scrollY: 720, triggerId: 'project-trigger-face-tracking-media' } }],
  ] as const)('rejects malformed history state: %s', (_label, state) => {
    expect(parseModalState(state)).toBeNull()
  })

  it('uses the stored background URL when browser history cannot go back', () => {
    window.history.replaceState(null, '', '/tr#projeler')
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 4 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 444 })
    openProjectModal('tr', 'speech-transcription', 'project-trigger-speech-transcription-title')
    const originalLength = window.history.length
    Object.defineProperty(window.history, 'length', { configurable: true, value: 1 })
    closeProjectModal()
    expect(window.location.pathname).toBe('/tr')
    expect(window.location.hash).toBe('#projeler')
    expect(window.history.state).toBeNull()
    Object.defineProperty(window.history, 'length', { configurable: true, value: originalLength })
  })
})
