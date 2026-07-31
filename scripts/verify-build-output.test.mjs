import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { pathToFileURL } from 'node:url'
import { execFile } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'
import { verifyBuildOutput } from './verify-build-output.mjs'

const origin = 'https://preview.example'
const canonicalRoutes = ['/tr', '/en']
const temporaryDirectories = []
const execFileAsync = promisify(execFile)

function shell(route) {
  return `<!doctype html>
<html><head>
  <link rel="canonical" href="${origin}${route}" />
  <meta property="og:url" content="${origin}${route}" />
  <meta property="og:image" content="${origin}/og-mehmet.png" />
</head><body></body></html>`
}

async function write(root, relativePath, content) {
  const file = path.join(root, relativePath)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, content)
}

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'mehmetst-build-verifier-'))
  temporaryDirectories.push(root)
  await Promise.all([
    write(root, 'index.html', shell('/tr')),
    write(root, 'tr/index.html', shell('/tr')),
    write(root, 'en/index.html', shell('/en')),
    write(root, 'tr/404/index.html', shell('/tr/404')),
    write(root, 'en/404/index.html', shell('/en/404')),
    write(root, '404.html', shell('/tr/404')),
    write(
      root,
      'sitemap.xml',
      `<?xml version="1.0"?><urlset>${canonicalRoutes.map((route) => `<url><loc>${origin}${route}</loc></url>`).join('')}</urlset>`,
    ),
    write(root, 'robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`),
  ])
  return root
}

async function replace(root, relativePath, from, to) {
  const file = path.join(root, relativePath)
  await writeFile(file, (await readFile(file, 'utf8')).replace(from, to))
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('build output verifier', () => {
  it('accepts shells, sitemap and robots that use the exact expected origin and routes', async () => {
    const root = await fixture()
    await expect(verifyBuildOutput({ root, expectedOrigin: origin, canonicalRoutes })).resolves.toMatchObject({
      htmlShells: 6,
      sitemapRoutes: 2,
    })
  })

  it('rejects missing exact metadata on the root redirect shell', async () => {
    const root = await fixture()
    await replace(root, 'index.html', `${origin}/tr`, '/tr')
    await expect(verifyBuildOutput({ root, expectedOrigin: origin, canonicalRoutes })).rejects.toThrow(/index\.html canonical URL/)
  })

  it('rejects a canonical URL from the wrong origin', async () => {
    const root = await fixture()
    await replace(root, 'tr/index.html', `${origin}/tr`, 'https://wrong.example/tr')
    await expect(verifyBuildOutput({ root, expectedOrigin: origin, canonicalRoutes })).rejects.toThrow(/canonical URL/)
  })

  it('rejects a canonical URL with the wrong route', async () => {
    const root = await fixture()
    await replace(root, 'tr/index.html', `${origin}/tr`, `${origin}/old-tr`)
    await expect(verifyBuildOutput({ root, expectedOrigin: origin, canonicalRoutes })).rejects.toThrow(/canonical URL/)
  })

  it('rejects an OG URL with the wrong route', async () => {
    const root = await fixture()
    await replace(root, 'en/index.html', `og:url" content="${origin}/en`, `og:url" content="${origin}/old-en`)
    await expect(verifyBuildOutput({ root, expectedOrigin: origin, canonicalRoutes })).rejects.toThrow(/og:url/)
  })

  it('rejects an OG image from the wrong origin', async () => {
    const root = await fixture()
    await replace(root, 'tr/index.html', `${origin}/og-mehmet.png`, 'https://wrong.example/og-mehmet.png')
    await expect(verifyBuildOutput({ root, expectedOrigin: origin, canonicalRoutes })).rejects.toThrow(/og:image/)
  })

  it('rejects sitemap URLs from the wrong origin', async () => {
    const root = await fixture()
    await replace(root, 'sitemap.xml', `${origin}/en`, 'https://wrong.example/en')
    await expect(verifyBuildOutput({ root, expectedOrigin: origin, canonicalRoutes })).rejects.toThrow(/sitemap.xml/)
  })

  it('rejects a robots sitemap directive from the wrong origin', async () => {
    const root = await fixture()
    await replace(root, 'robots.txt', `${origin}/sitemap.xml`, 'https://wrong.example/sitemap.xml')
    await expect(verifyBuildOutput({ root, expectedOrigin: origin, canonicalRoutes })).rejects.toThrow(/robots.txt/)
  })

  it.each(['/tr', '/en'])('rejects robots.txt when it disallows canonical route %s', async (route) => {
    const root = await fixture()
    const robotsPath = path.join(root, 'robots.txt')
    await writeFile(robotsPath, `${await readFile(robotsPath, 'utf8')}Disallow: ${route}\n`)
    await expect(verifyBuildOutput({ root, expectedOrigin: origin, canonicalRoutes })).rejects.toThrow(/robots.txt/)
  })

  it('rejects stale output when the authoritative source has a newer route', async () => {
    const root = await fixture()
    await expect(
      verifyBuildOutput({ root, expectedOrigin: origin, canonicalRoutes: [...canonicalRoutes, '/en/new-route'] }),
    ).rejects.toThrow(/en\/new-route\/index\.html/)
  })

  it('does not leak Vite development mode into a later production build', async () => {
    const verifierUrl = pathToFileURL(path.resolve('scripts/verify-build-output.mjs')).href
    const source = `import { loadSeoBuildContract } from ${JSON.stringify(verifierUrl)}; await loadSeoBuildContract(process.cwd()); process.stdout.write(process.env.NODE_ENV || 'missing')`
    const { stdout } = await execFileAsync(process.execPath, ['--input-type=module', '--eval', source], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'production' },
    })
    expect(stdout).toBe('production')
  })
})
