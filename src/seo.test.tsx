import { render, waitFor } from '@testing-library/react'
import { parseRoute } from './router'
import { FALLBACK_SITE_URL } from './seo-data'
import { usePageMetadata } from './seo'

function MetadataHarness({ path }: Readonly<{ path: string }>) {
  usePageMetadata(parseRoute(path))
  return null
}

function canonicalHref() {
  return document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href
}

describe('runtime localized metadata', () => {
  afterEach(() => {
    document.head.querySelectorAll('meta, link[rel="canonical"], link[rel="alternate"]').forEach((node) => node.remove())
  })

  it('sets Turkish home metadata', async () => {
    render(<MetadataHarness path="/tr" />)
    await waitFor(() => expect(document.title).toBe('Mehmet Tüysüz | Yapay zekâ ve sistemler'))
    expect(document.documentElement.lang).toBe('tr')
    expect(canonicalHref()).toBe(`${FALLBACK_SITE_URL}/tr`)
    expect(document.head.querySelector('link[hreflang="en"]')).toHaveAttribute('href', `${FALLBACK_SITE_URL}/en`)
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index,follow')
  })

  it('sets English home metadata and hreflang pair', async () => {
    render(<MetadataHarness path="/en" />)
    await waitFor(() => expect(document.title).toBe('Mehmet Tüysüz | AI and systems'))
    expect(document.documentElement.lang).toBe('en')
    expect(canonicalHref()).toBe(`${FALLBACK_SITE_URL}/en`)
    expect(document.head.querySelector('link[hreflang="tr"]')).toHaveAttribute('href', `${FALLBACK_SITE_URL}/tr`)
    expect(document.head.querySelector('link[hreflang="x-default"]')).toHaveAttribute('href', `${FALLBACK_SITE_URL}/tr`)
  })

  it('sets canonical English project metadata', async () => {
    render(<MetadataHarness path="/en/projects/real-time-face-tracking?from=share#projects" />)
    await waitFor(() => expect(document.title).toBe('Face recognition and tracking | Mehmet Tüysüz'))
    expect(canonicalHref()).toBe(`${FALLBACK_SITE_URL}/en/projects/real-time-face-tracking`)
    expect(document.head.querySelector('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US')
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute('content', `${FALLBACK_SITE_URL}/og-mehmet.png`)
  })

  it('marks unknown English routes noindex with normalized canonical metadata', async () => {
    render(<MetadataHarness path="/en/unknown" />)
    await waitFor(() => expect(document.title).toBe('Page not found | Mehmet Tüysüz'))
    expect(document.documentElement.lang).toBe('en')
    expect(canonicalHref()).toBe(`${FALLBACK_SITE_URL}/en/404`)
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow')
  })
})
