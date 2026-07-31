import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { App } from './App'
import { useReveal } from './hooks/useReveal'

const defaultIntersectionObserver = window.IntersectionObserver

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

function renderAt(path = '/') {
  window.history.replaceState(null, '', path)
  return render(<App />)
}

beforeEach(() => {
  setReducedMotion(false)
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: defaultIntersectionObserver,
  })
  vi.mocked(window.scrollTo).mockClear()
  vi.mocked(HTMLElement.prototype.scrollIntoView).mockClear()
})

describe('project detail navigation', () => {
  it('opens a home-origin project as an accessible dialog and restores focus on Escape', async () => {
    const user = userEvent.setup()
    renderAt()

    const opener = screen.getAllByRole('link', { name: 'İncele' })[0]
    expect(opener).toBeDefined()
    await user.click(opener!)

    const dialog = await screen.findByRole('dialog', {
      name: 'XTTS-v2 üzerinde kapsamlı fine-tuning',
    })
    const closeButtons = within(dialog).getAllByRole('button', { name: 'Kapat' })
    expect(closeButtons[0]).toHaveFocus()
    expect(document.body).toHaveStyle({ overflow: 'hidden' })

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(opener).toHaveFocus()
    expect(document.body.style.overflow).toBe('')

    window.history.forward()
    const reopenedDialog = await screen.findByRole('dialog', {
      name: 'XTTS-v2 üzerinde kapsamlı fine-tuning',
    })
    await user.click(within(reopenedDialog).getAllByRole('button', { name: 'Kapat' })[0]!)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('keeps keyboard focus inside the open dialog', async () => {
    const user = userEvent.setup()
    renderAt()

    await user.click(screen.getAllByRole('link', { name: 'İncele' })[0]!)
    const dialog = await screen.findByRole('dialog')
    const closeButtons = within(dialog).getAllByRole('button', { name: 'Kapat' })

    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(closeButtons.at(-1)).toHaveFocus()

    await user.keyboard('{Tab}')
    expect(closeButtons[0]).toHaveFocus()
  })

  it('restores focus and unlocks body when the close button is used', async () => {
    const user = userEvent.setup()
    renderAt()

    const opener = screen.getAllByRole('link', { name: 'İncele' })[1]!
    await user.click(opener)
    const dialog = await screen.findByRole('dialog', { name: 'Gerçek zamanlı yüz tanıma ve takip sistemi' })

    expect(document.body).toHaveStyle({ overflow: 'hidden' })
    await user.click(within(dialog).getAllByRole('button', { name: 'Kapat' })[0]!)

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(opener).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })

  it('renders a direct project URL as a full page using the same detail sections', () => {
    renderAt('/projeler/ses-tanima-transkripsiyon')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Ses tanıma ve transkripsiyon sistemi' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 2, name: 'Ne yaptım' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 2, name: 'Neden yaptım' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 2, name: 'Sonuç' })).toBeVisible()
    expect(screen.getAllByRole('link', { name: 'Ana sayfaya dön' })).toHaveLength(2)
  })

  it('returns from a direct detail page to the work section without opening an overlay', async () => {
    const user = userEvent.setup()
    renderAt('/projeler/ses-tanima-transkripsiyon')

    await user.click(screen.getAllByRole('link', { name: 'Ana sayfaya dön' })[0]!)

    expect(await screen.findByRole('heading', { level: 2, name: 'Seçili projeler' })).toBeVisible()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
    expect(window.location.hash).toBe('#projeler')
    await waitFor(() => {
      expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    })
  })

  it.each([
    '/projeler/bilinmeyen',
    '/rastgele/bir-yol',
    `/projeler/${['akilli', 'gozluk', 'ozel', 'pcb'].join('-')}`,
  ])(
    'shows the intentional not-found page for %s',
    (path) => {
      renderAt(path)

      expect(screen.getByRole('heading', { level: 1, name: 'Burada bir sayfa yok.' })).toBeVisible()
      expect(screen.getByRole('link', { name: 'Ana sayfaya dön' })).toBeVisible()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    },
  )

  it('renders the classifier as a direct project page', () => {
    renderAt('/projeler/cinsiyet-siniflandirma-modeli')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Gerçek zamanlı cinsiyet sınıflandırma modeli' }),
    ).toBeVisible()
    expect(document.title).toBe('Cinsiyet sınıflandırma modeli | Mehmet Tüysüz')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('returns from not-found to home and scrolls a hashless route to the top', async () => {
    const user = userEvent.setup()
    renderAt('/bulunamayan-sayfa')

    await user.click(screen.getByRole('link', { name: 'Ana sayfaya dön' }))

    expect(await screen.findByRole('heading', { level: 1, name: /Mehmet/ })).toBeVisible()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' })
  })

  it('shows reveal content immediately when reduced motion is requested', async () => {
    const observerConstructor = vi.fn()
    setReducedMotion(true)
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: observerConstructor,
    })

    renderAt()

    await waitFor(() => {
      const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
      expect(revealElements.length).toBeGreaterThan(10)
      expect(revealElements.every((element) => element.classList.contains('is-visible'))).toBe(true)
      const polishedElements = Array.from(
        document.querySelectorAll<HTMLElement>('.about-paragraph-reveal, .expertise-reveal, .ongoing-row-reveal'),
      )
      expect(polishedElements).toHaveLength(9)
      expect(polishedElements.every((element) => element.classList.contains('is-visible'))).toBe(true)
    })
    expect(observerConstructor).not.toHaveBeenCalled()
  })

  it('does not replay a revealed key after remounting', async () => {
    const key = 'motion-once-remount-test'
    const Harness = () => {
      useReveal()
      return <div className="expertise-reveal" data-reveal data-reveal-key={key}>Visible content</div>
    }
    setReducedMotion(true)
    const first = render(<Harness />)
    await waitFor(() => expect(screen.getByText('Visible content')).toHaveClass('is-visible'))
    first.unmount()

    const observe = vi.fn()
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: vi.fn(() => ({ observe, unobserve: vi.fn(), disconnect: vi.fn() })),
    })
    setReducedMotion(false)
    render(<Harness />)

    const remounted = screen.getByText('Visible content')
    await waitFor(() => expect(remounted).toHaveClass('is-visible'))
    expect(observe).not.toHaveBeenCalledWith(remounted)
  })

  it('keeps hash history usable across back and forward navigation', async () => {
    const user = userEvent.setup()
    renderAt()
    const primaryNav = screen.getByRole('navigation', { name: 'Ana menü' })

    await user.click(within(primaryNav).getByRole('link', { name: 'Hakkımda' }))
    await waitFor(() => expect(window.location.hash).toBe('#hakkimda'))
    await user.click(within(primaryNav).getByRole('link', { name: 'Projeler' }))
    await waitFor(() => expect(window.location.hash).toBe('#projeler'))

    window.history.back()
    await waitFor(() => expect(window.location.hash).toBe('#hakkimda'))
    window.history.forward()
    await waitFor(() => expect(window.location.hash).toBe('#projeler'))
  })

  it('renders restrained decorative cues without changing accessible link labels', () => {
    renderAt()

    expect(Array.from(document.querySelectorAll('.project-index')).map((item) => item.textContent?.trim())).toEqual([
      '01',
      '02',
      '03',
      '04',
    ])
    expect(document.querySelectorAll('.expertise-icon[aria-hidden="true"]')).toHaveLength(3)
    expect(document.querySelectorAll('.direction-cue[aria-hidden="true"]')).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'GitHub' })[0]).toBeVisible()
    expect(screen.getAllByRole('link', { name: 'Projeler' })[0]).toBeVisible()
  })
})
