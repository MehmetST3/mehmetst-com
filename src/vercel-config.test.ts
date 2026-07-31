import vercelConfig from '../vercel.json'

describe('Vercel SPA fallback', () => {
  it('keeps deep project URLs routed to the SPA entry', () => {
    expect(vercelConfig.rewrites).toContainEqual({
      source: '/(.*)',
      destination: '/index.html',
    })
  })
})
