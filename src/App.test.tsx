import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { App } from './App'
import { projectPath } from './route-manifest'
import { useReveal } from './hooks/useReveal'

vi.mock('@vercel/analytics/react', () => ({
  Analytics: ({ route, path }: { route?: string; path?: string }) => <span hidden data-testid="analytics" data-route={route} data-path={path} />,
}))

function setReducedMotion(matches: boolean) {
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

function renderAt(path = '/tr', state: unknown = null) {
  window.history.replaceState(state, '', path)
  return render(<App />, { container: document.getElementById('root')! })
}

describe('localized portfolio application', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>'
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    Object.defineProperty(window.history, 'scrollRestoration', { configurable: true, writable: true, value: 'auto' })
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 0 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    vi.mocked(window.scrollTo).mockClear()
    vi.mocked(HTMLElement.prototype.scrollIntoView).mockClear()
    Object.defineProperty(document, 'startViewTransition', { configurable: true, writable: true, value: undefined })
    document.documentElement.classList.remove('locale-transitioning')
    setReducedMotion(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    ['/tr', 'tr', 'Hakkımda', 'Seçili projeler'],
    ['/en', 'en', 'About', 'Selected projects'],
  ] as const)('renders the complete %s home locale', (path, lang, about, projects) => {
    renderAt(path)
    expect(document.documentElement.lang).toBe(lang)
    expect(screen.getByRole('heading', { name: about })).toBeVisible()
    expect(screen.getByRole('heading', { name: projects })).toBeVisible()
    expect(screen.getAllByRole('article')).toHaveLength(4)
    expect(screen.getByRole('radiogroup')).toBeVisible()
  })

  it('normalizes the root and legacy project URL without losing the page', async () => {
    renderAt('/')
    await waitFor(() => expect(window.location.pathname).toBe('/tr'))
    expect(screen.getByRole('heading', { name: 'Hakkımda' })).toBeVisible()
  })

  it.each([
    ['/tr/projeler/xtts-v2-fine-tuning', 'XTTS-v2 üzerinde kapsamlı fine-tuning', 'tr'],
    ['/en/projects/real-time-face-tracking', 'Real-time face recognition and tracking', 'en'],
  ] as const)('renders localized direct project pages', (path, title, lang) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeVisible()
    expect(document.documentElement.lang).toBe(lang)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it.each([
    ['/tr/bilinmeyen', 'Burada bir sayfa yok.'],
    ['/en/unknown', 'There’s nothing here.'],
  ] as const)('renders locale-aware unknown routes', (path, title) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeVisible()
  })

  async function openFaceModal() {
    const user = userEvent.setup()
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 12 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 720 })
    renderAt('/tr#projeler')
    const trigger = document.getElementById('project-trigger-face-tracking-media') as HTMLAnchorElement
    await user.click(trigger)
    await screen.findByRole('dialog')
    return { user, trigger }
  }

  it.each(['button', 'escape', 'backdrop', 'browser-back'] as const)(
    'restores exact scroll and trigger focus after modal close via %s',
    async (method) => {
      const { user, trigger } = await openFaceModal()
      expect(document.body.style.overflow).toBe('hidden')
      expect(window.history.scrollRestoration).toBe('manual')

      if (method === 'button') await user.click(screen.getAllByRole('button', { name: 'Kapat' })[0]!)
      if (method === 'escape') await user.keyboard('{Escape}')
      if (method === 'backdrop') fireEvent.mouseDown(document.querySelector('.dialog-backdrop')!)
      if (method === 'browser-back') window.history.back()

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith({ left: 12, top: 720, behavior: 'auto' }))
      await waitFor(() => expect(document.getElementById(trigger.id)).toHaveFocus())
      expect(document.body.style.overflow).toBe('')
      expect(window.history.scrollRestoration).toBe('auto')
    },
  )

  it('does not duplicate modal history during rapid repeated clicks', async () => {
    renderAt('/en#projects')
    const trigger = document.getElementById('project-trigger-xtts-fine-tuning-cta') as HTMLAnchorElement
    const pushState = vi.spyOn(window.history, 'pushState')
    fireEvent.click(trigger)
    fireEvent.click(trigger)
    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(pushState).toHaveBeenCalledTimes(1)
    pushState.mockRestore()
  })

  it('keeps Back and Forward modal cycles deterministic', async () => {
    const { user } = await openFaceModal()
    window.history.back()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    window.history.forward()
    expect(await screen.findByRole('dialog')).toBeVisible()
    await user.click(screen.getAllByRole('button', { name: 'Kapat' })[0]!)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(window.location.pathname).toBe('/tr')
    expect(window.location.hash).toBe('#projeler')
  })

  it('treats malformed modal state as a direct project page', () => {
    renderAt(projectPath('tr', 'face-tracking'), { version: 99, kind: 'project-modal' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Gerçek zamanlı yüz tanıma ve takip sistemi' })).toBeVisible()
  })

  it.each([
    ['locale/background mismatch', { version: 1, kind: 'project-modal', locale: 'tr', projectId: 'face-tracking', background: { pathname: '/en', search: '', hash: '#about', scrollX: 12, scrollY: 720, triggerId: 'project-trigger-face-tracking-media' } }],
    ['wrong trigger project', { version: 1, kind: 'project-modal', locale: 'tr', projectId: 'face-tracking', background: { pathname: '/tr', search: '', hash: '#projeler', scrollX: 12, scrollY: 720, triggerId: 'project-trigger-xtts-fine-tuning-media' } }],
    ['negative scroll', { version: 1, kind: 'project-modal', locale: 'tr', projectId: 'face-tracking', background: { pathname: '/tr', search: '', hash: '#projeler', scrollX: -1, scrollY: 720, triggerId: 'project-trigger-face-tracking-media' } }],
    ['NaN scroll', { version: 1, kind: 'project-modal', locale: 'tr', projectId: 'face-tracking', background: { pathname: '/tr', search: '', hash: '#projeler', scrollX: 12, scrollY: Number.NaN, triggerId: 'project-trigger-face-tracking-media' } }],
    ['missing search/hash', { version: 1, kind: 'project-modal', locale: 'tr', projectId: 'face-tracking', background: { pathname: '/tr', scrollX: 12, scrollY: 720, triggerId: 'project-trigger-face-tracking-media' } }],
  ] as const)('rejects malformed modal state: %s', (_label, state) => {
    renderAt(projectPath('tr', 'face-tracking'), state)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Gerçek zamanlı yüz tanıma ve takip sistemi' })).toBeVisible()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('keeps a locale selected and supports Radix roving keyboard navigation', async () => {
    const user = userEvent.setup()
    renderAt('/tr')
    const group = screen.getByRole('radiogroup', { name: 'Dil seçimi' })
    const tr = within(group).getByRole('radio', { name: 'Türkçe' })
    const en = within(group).getByRole('radio', { name: 'English' })
    expect(tr).toHaveAttribute('data-state', 'on')
    await user.click(tr)
    expect(window.location.pathname).toBe('/tr')
    expect(screen.getByRole('status')).toHaveTextContent('Seçili dil')
    tr.focus()
    await user.keyboard('{ArrowRight}')
    expect(en).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(tr).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(en).toHaveFocus()
    await user.keyboard(' ')
    await waitFor(() => expect(window.location.pathname).toBe('/en'))
    expect(window.history.state).toBeNull()
  })

  it('keeps the modal language group focus-scoped while the app root is inert', async () => {
    const { user } = await openFaceModal()
    const root = document.getElementById('root')!
    const dialog = screen.getByRole('dialog')
    const group = within(dialog).getByRole('radiogroup', { name: 'Dil seçimi' })
    expect(root.inert).toBe(true)
    expect(root).toHaveAttribute('aria-hidden', 'true')
    expect(within(group).getByRole('radio', { name: 'Türkçe' })).toBeVisible()

    const backgroundLink = root.querySelector<HTMLAnchorElement>('.site-brand')!
    fireEvent.focusIn(backgroundLink)
    expect(within(dialog).getAllByRole('button', { name: 'Kapat' })[0]).toHaveFocus()

    await user.click(within(dialog).getAllByRole('button', { name: 'Kapat' })[0]!)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(root.inert).toBe(false)
    expect(root).not.toHaveAttribute('aria-hidden')
  })

  it.each(['escape', 'backdrop', 'browser-back'] as const)(
    'restores localized background after modal language switch via %s',
    async (method) => {
      const user = userEvent.setup()
      Object.defineProperty(window, 'scrollX', { configurable: true, value: 12 })
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 720 })
      renderAt('/tr?from=review#projeler')
      await user.click(document.getElementById('project-trigger-face-tracking-cta')!)
      const dialog = await screen.findByRole('dialog')
      await user.click(within(dialog).getByRole('radio', { name: 'English' }))
      await waitFor(() => expect(window.location.href).toContain('/en/projects/real-time-face-tracking?from=review#projects'))

      if (method === 'escape') await user.keyboard('{Escape}')
      if (method === 'backdrop') fireEvent.mouseDown(document.querySelector('.dialog-backdrop')!)
      if (method === 'browser-back') act(() => window.history.back())

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(window.location.pathname).toBe('/en')
      expect(window.location.search).toBe('?from=review')
      expect(window.location.hash).toBe('#projects')
      expect(window.history.state).toBeNull()
      await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith({ left: 12, top: 720, behavior: 'auto' }))
      await waitFor(() => expect(document.getElementById('project-trigger-face-tracking-cta')).toHaveFocus())
      expect(document.getElementById('project-trigger-face-tracking-cta')?.closest('article')).toHaveTextContent('Real-time face recognition and tracking')
    },
  )

  it('reopens a localized modal with Forward and closes to the same clean background', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 12 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 720 })
    renderAt('/tr#projeler')
    await user.click(document.getElementById('project-trigger-face-tracking-media')!)
    await user.click(within(await screen.findByRole('dialog')).getByRole('radio', { name: 'English' }))
    act(() => window.history.back())
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    act(() => window.history.forward())
    expect(await screen.findByRole('dialog')).toBeVisible()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(`${window.location.pathname}${window.location.hash}`).toBe('/en#projects')
    expect(window.history.state).toBeNull()
    await waitFor(() => expect(window.scrollTo).toHaveBeenLastCalledWith({ left: 12, top: 720, behavior: 'auto' }))
    await waitFor(() => expect(document.getElementById('project-trigger-face-tracking-media')).toHaveFocus())
  })

  it('commits the English DOM inside one View Transition callback', () => {
    let callbackText = ''
    const startViewTransition = vi.fn((callback: () => void) => {
      callback()
      callbackText = document.body.textContent ?? ''
      return { finished: Promise.resolve() }
    })
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: startViewTransition })
    renderAt('/tr')
    fireEvent.click(screen.getByRole('radio', { name: 'English' }))
    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(callbackText).toContain('Selected projects')
    expect(callbackText).not.toContain('Seçili projeler')
  })

  it('uses and clears the CSS fallback when View Transitions are unavailable', () => {
    vi.useFakeTimers()
    renderAt('/tr')
    fireEvent.click(screen.getByRole('radio', { name: 'English' }))
    expect(document.documentElement).toHaveClass('locale-transitioning')
    act(() => vi.advanceTimersByTime(180))
    expect(document.documentElement).not.toHaveClass('locale-transitioning')
    vi.useRealTimers()
  })

  it('switches locale instantly without transition animation under reduced motion', () => {
    setReducedMotion(true)
    const startViewTransition = vi.fn()
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: startViewTransition })
    renderAt('/tr')
    fireEvent.click(screen.getByRole('radio', { name: 'English' }))
    expect(window.location.pathname).toBe('/en')
    expect(startViewTransition).not.toHaveBeenCalled()
    expect(document.documentElement).not.toHaveClass('locale-transitioning')
  })

  it('switches locale on direct and modal projects without polluting history', async () => {
    const user = userEvent.setup()
    renderAt('/tr/projeler/cinsiyet-siniflandirma-modeli')
    const replaceState = vi.spyOn(window.history, 'replaceState')
    await user.click(screen.getByRole('radio', { name: 'English' }))
    await waitFor(() => expect(window.location.pathname).toBe('/en/projects/gender-classification-model'))
    expect(replaceState).toHaveBeenCalled()

    replaceState.mockClear()
    window.history.replaceState(null, '', '/tr#projeler')
    act(() => window.dispatchEvent(new PopStateEvent('popstate')))
    await waitFor(() => expect(document.getElementById('project-trigger-face-tracking-cta')).toBeInTheDocument())
    const trigger = document.getElementById('project-trigger-face-tracking-cta') as HTMLAnchorElement
    await user.click(trigger)
    await screen.findByRole('dialog')
    await user.click(within(screen.getByRole('dialog')).getByRole('radio', { name: 'English' }))
    expect(window.location.pathname).toBe('/en/projects/real-time-face-tracking')
    expect(window.history.state).toMatchObject({ kind: 'project-modal', locale: 'en', projectId: 'face-tracking' })
    await user.click(screen.getAllByRole('button', { name: 'Close' })[0]!)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(window.location.pathname).toBe('/en')
    expect(window.location.hash).toBe('#projects')
    replaceState.mockRestore()
  })

  it('shows all polished reveal content immediately with reduced motion', async () => {
    setReducedMotion(true)
    const observer = vi.spyOn(window, 'IntersectionObserver')
    renderAt('/tr')
    await waitFor(() => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
      expect(elements.length).toBeGreaterThan(10)
      expect(elements.every((element) => element.classList.contains('is-visible'))).toBe(true)
    })
    expect(observer).not.toHaveBeenCalled()
    observer.mockRestore()
  })

  it('does not replay a stable reveal key after remounting', async () => {
    const Harness = () => {
      useReveal()
      return <div data-reveal data-reveal-key="localized-motion-once">Visible content</div>
    }
    setReducedMotion(true)
    const first = render(<Harness />)
    await waitFor(() => expect(screen.getByText('Visible content')).toHaveClass('is-visible'))
    first.unmount()
    const observe = vi.fn()
    Object.defineProperty(window, 'IntersectionObserver', { writable: true, configurable: true, value: vi.fn(() => ({ observe, unobserve: vi.fn(), disconnect: vi.fn() })) })
    setReducedMotion(false)
    render(<Harness />)
    const remounted = screen.getByText('Visible content')
    await waitFor(() => expect(remounted).toHaveClass('is-visible'))
    expect(observe).not.toHaveBeenCalledWith(remounted)
  })
})
