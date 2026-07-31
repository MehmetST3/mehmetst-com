import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { App } from './App'

const pageviews = vi.hoisted(() => [] as Array<{ route?: string; path?: string }>)

vi.mock('@vercel/analytics/react', async () => {
  const React = await import('react')
  return {
    Analytics: ({ route, path }: { route?: string; path?: string }) => {
      React.useEffect(() => {
        pageviews.push({ route, path })
      }, [route, path])
      return null
    },
  }
})

describe('canonical analytics pageviews', () => {
  beforeEach(() => {
    pageviews.length = 0
    window.history.replaceState(null, '', '/tr')
    vi.mocked(window.scrollTo).mockClear()
  })

  it('counts canonical page changes once and excludes hash-only navigation', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(pageviews).toEqual([{ route: '/tr', path: '/tr' }]))

    await user.click(screen.getAllByRole('link', { name: 'Hakkımda' })[0]!)
    expect(window.location.hash).toBe('#hakkimda')
    expect(pageviews).toHaveLength(1)

    await user.click(document.getElementById('project-trigger-face-tracking-cta')!)
    await waitFor(() => expect(pageviews).toHaveLength(2))
    expect(pageviews[1]).toEqual({ route: '/tr/projeler/[project]', path: '/tr/projeler/gercek-zamanli-yuz-takibi' })

    await user.click(screen.getAllByRole('button', { name: 'Kapat' })[0]!)
    await waitFor(() => expect(pageviews).toHaveLength(3))
    expect(pageviews[2]).toEqual({ route: '/tr', path: '/tr' })
  })

  it('normalizes every unknown English URL to one analytics path', async () => {
    window.history.replaceState(null, '', '/en/anything')
    render(<App />)
    await waitFor(() => expect(pageviews).toEqual([{ route: '/en/404', path: '/en/404' }]))
  })

  it('bridges canonical router changes exactly once through locale, modal, history and close', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(pageviews).toHaveLength(1))

    await user.click(screen.getByRole('radio', { name: 'English' }))
    await waitFor(() => expect(pageviews).toHaveLength(2))
    await user.click(document.getElementById('project-trigger-face-tracking-cta')!)
    await waitFor(() => expect(pageviews).toHaveLength(3))
    act(() => window.history.back())
    await waitFor(() => expect(pageviews).toHaveLength(4))
    act(() => window.history.forward())
    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(pageviews).toHaveLength(5))
    await user.click(within(dialog).getAllByRole('button', { name: 'Close' })[0]!)
    await waitFor(() => expect(pageviews).toHaveLength(6))
    await user.click(screen.getAllByRole('link', { name: 'About' })[0]!)
    expect(window.location.hash).toBe('#about')

    expect(pageviews).toEqual([
      { route: '/tr', path: '/tr' },
      { route: '/en', path: '/en' },
      { route: '/en/projects/[project]', path: '/en/projects/real-time-face-tracking' },
      { route: '/en', path: '/en' },
      { route: '/en/projects/[project]', path: '/en/projects/real-time-face-tracking' },
      { route: '/en', path: '/en' },
    ])
  })
})
