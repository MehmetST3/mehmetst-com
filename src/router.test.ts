import { waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { getNavigationBehavior, navigate } from './router'

describe('navigation scroll policy', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
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

  it('scrolls hashless routes to the top', () => {
    navigate('/projeler/xtts-v2-fine-tuning')

    expect(window.location.pathname).toBe('/projeler/xtts-v2-fine-tuning')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' })
  })

  it('smoothly reaches a hash target without duplicating rapid-click history', async () => {
    const target = document.createElement('section')
    target.id = 'projeler'
    document.body.append(target)
    const pushState = vi.spyOn(window.history, 'pushState')

    navigate('/#projeler')
    navigate('/#projeler')

    expect(window.location.hash).toBe('#projeler')
    expect(pushState).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    })
    target.remove()
    pushState.mockRestore()
  })

  it('uses automatic scrolling when reduced motion is requested', async () => {
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
    const target = document.createElement('section')
    target.id = 'hakkimda'
    document.body.append(target)

    navigate('/#hakkimda')

    expect(getNavigationBehavior()).toBe('auto')
    await waitFor(() => {
      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
    })
    target.remove()
  })
})
