import indexHtml from '../index.html?raw'
import vercelIgnore from '../.vercelignore?raw'

const deployedPortraitFiles = import.meta.glob('/public/**/*{mehmet-tuysuz,portrait,WhatsApp}*', {
  eager: true,
  query: '?url',
  import: 'default',
})

const deployedSentientFiles = import.meta.glob('/public/fonts/sentient-*', {
  eager: true,
  query: '?url',
  import: 'default',
})

const obsoleteRedesignFiles = import.meta.glob(
  '/src/**/*{ThemeToggle,PaletteControl,PaletteProvider,PaletteContext,palette,SignalField,SignalIndex,SignalArtwork,useReducedMotion}*',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)

const publicSourceFiles = import.meta.glob('/src/**/*.{ts,tsx,css}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const restrictedPublicName = ['ci', 'ri'].join('')
const publicProjectImages = import.meta.glob('/public/images/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})
const classifierImages = import.meta.glob('/public/images/gender-classifier-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})
const looseClassifierMaster = import.meta.glob('/public/images/cnnmodel*', {
  eager: true,
  query: '?url',
  import: 'default',
})

describe('production identity assets', () => {
  it('keeps portrait assets and the old editorial font out of public builds', () => {
    expect(Object.keys(deployedPortraitFiles)).toHaveLength(0)
    expect(Object.keys(deployedSentientFiles)).toHaveLength(0)
    expect(indexHtml).not.toMatch(/mehmet-tuysuz|WhatsApp|og-mehmet\.jpg|sentient|mehmet-theme|mehmet-palette|data-palette/i)
    expect(Object.keys(obsoleteRedesignFiles)).toHaveLength(0)
  })

  it('excludes the Council source-asset archive from Vercel uploads', () => {
    expect(vercelIgnore.split(/\r?\n/)).toContain('.council/')
  })

  it('keeps the restricted source name out of public source and metadata', () => {
    const publicText = [indexHtml, ...Object.values(publicSourceFiles)].join('\n').toLocaleLowerCase('tr-TR')
    expect(publicText).not.toContain(restrictedPublicName)
  })

  it('ships the classifier image set and excludes the retired smart-glasses asset', () => {
    const retiredAssetStem = ['wearable', 'pcb'].join('-')
    const retiredSlug = ['akilli', 'gozluk', 'ozel', 'pcb'].join('-')
    const publicText = [indexHtml, ...Object.values(publicSourceFiles)].join('\n').toLocaleLowerCase('tr-TR')

    expect(Object.keys(classifierImages)).toHaveLength(3)
    expect(Object.keys(looseClassifierMaster)).toHaveLength(0)
    expect(Object.keys(publicProjectImages).some((path) => path.includes(retiredAssetStem))).toBe(false)
    expect(publicText).not.toContain(retiredAssetStem)
    expect(publicText).not.toContain(retiredSlug)
  })
})
