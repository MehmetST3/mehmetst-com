import { access, readFile } from 'node:fs/promises'

const root = new URL('../dist/', import.meta.url)
const canonicalRoutes = [
  'tr',
  'tr/projeler/xtts-v2-fine-tuning',
  'tr/projeler/gercek-zamanli-yuz-takibi',
  'tr/projeler/ses-tanima-transkripsiyon',
  'tr/projeler/cinsiyet-siniflandirma-modeli',
  'en',
  'en/projects/xtts-v2-fine-tuning',
  'en/projects/real-time-face-tracking',
  'en/projects/speech-recognition-transcription',
  'en/projects/gender-classification-model',
]
const shellPaths = [
  ...canonicalRoutes.map((route) => `${route}/index.html`),
  'tr/404/index.html',
  'en/404/index.html',
  '404.html',
]

for (const relativePath of shellPaths) {
  const file = new URL(relativePath, root)
  await access(file)
  const html = await readFile(file, 'utf8')
  if (!/<meta property="og:image" content="https:\/\/[^"/]+\/og-mehmet\.png" \/>/.test(html)) {
    throw new Error(`${relativePath} is missing an absolute OG image`)
  }
  if (!html.includes('<link rel="canonical" href="https://')) {
    throw new Error(`${relativePath} is missing an absolute canonical link`)
  }
}

const sitemapPath = new URL('sitemap.xml', root)
const robotsPath = new URL('robots.txt', root)
await Promise.all([access(sitemapPath), access(robotsPath)])
const [sitemap, robots] = await Promise.all([readFile(sitemapPath, 'utf8'), readFile(robotsPath, 'utf8')])

if ((sitemap.match(/<url>/g) ?? []).length !== canonicalRoutes.length) {
  throw new Error(`sitemap.xml must contain ${canonicalRoutes.length} canonical URLs`)
}
for (const route of canonicalRoutes) {
  if (!sitemap.includes(`/${route}</loc>`)) throw new Error(`sitemap.xml is missing /${route}`)
}
if (!robots.includes('Allow: /') || !robots.includes('/sitemap.xml')) {
  throw new Error('robots.txt is missing Allow or Sitemap directives')
}

console.log(`Verified ${shellPaths.length} HTML shells, ${canonicalRoutes.length} sitemap routes, and robots.txt`)
