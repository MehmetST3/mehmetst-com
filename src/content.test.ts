import { aboutContent, caseStudies, getCaseStudy, hasUniqueCaseStudySlugs, ongoingWorkItems } from './content'

describe('portfolio content invariants', () => {
  it('contains exactly four case studies with unique URL-safe slugs', () => {
    expect(caseStudies).toHaveLength(4)
    expect(hasUniqueCaseStudySlugs(caseStudies)).toBe(true)

    for (const study of caseStudies) {
      expect(study.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(study.what).toBeTruthy()
      expect(study.why).toBeTruthy()
      expect(study.result).toBeTruthy()
    }
  })

  it('keeps three ongoing work notes outside the routable case-study model', () => {
    expect(ongoingWorkItems).toHaveLength(3)
    for (const item of ongoingWorkItems) {
      expect(typeof item).toBe('string')
      expect(item.length).toBeGreaterThan(40)
    }
  })

  it('publishes the compact classifier without undocumented accuracy claims', () => {
    const classifier = getCaseStudy('cinsiyet-siniflandirma-modeli')
    const retiredSlug = ['akilli', 'gozluk', 'ozel', 'pcb'].join('-')

    expect(classifier).toMatchObject({
      title: 'Gerçek zamanlı cinsiyet sınıflandırma modeli',
      image: { base: 'gender-classifier', width: 1440, height: 960 },
    })
    expect(classifier?.what).toContain('100×100')
    expect(classifier?.what).toContain('altı katmanlı')
    expect(classifier?.result).toContain('yaklaşık 15 MB')
    expect(JSON.stringify(classifier)).not.toMatch(/accuracy|doğruluk|başarı oranı|%\s*\d/i)
    expect(getCaseStudy(retiredSlug)).toBeUndefined()
  })

  it('keeps public copy evidence-bound and free of forbidden punctuation', () => {
    const xtts = getCaseStudy('xtts-v2-fine-tuning')
    const face = getCaseStudy('gercek-zamanli-yuz-takibi')
    const speech = getCaseStudy('ses-tanima-transkripsiyon')
    const publicCopy = JSON.stringify({ aboutContent, caseStudies, ongoingWorkItems })
    const restrictedName = ['ci', 'ri'].join('')
    const privateProgramName = ['cou', 'ncil'].join('')
    const xttsWhyWords = xtts?.why.trim().split(/\s+/) ?? []

    expect(xttsWhyWords.length).toBeGreaterThanOrEqual(55)
    expect(xttsWhyWords.length).toBeLessThanOrEqual(80)
    expect(xtts?.result).toContain('muhtemelen')
    expect(face?.result).toContain('kişisel bir gözlem')
    expect(speech?.result).toContain('dar kapsamlı')
    expect(publicCopy.toLocaleLowerCase('tr-TR')).not.toContain(restrictedName)
    expect(publicCopy.toLocaleLowerCase('tr-TR')).not.toContain(privateProgramName)
    expect(publicCopy).not.toMatch(/[—–]/)
  })

  it('publishes authorized personal facts without a definitive job title or self-deprecation', () => {
    const intro = aboutContent.intro.join(' ')
    const wordCount = intro.trim().split(/\s+/).length
    const expertise = aboutContent.expertise.map(({ title, body }) => `${title} ${body}`).join(' ')

    expect(wordCount).toBeGreaterThanOrEqual(70)
    expect(wordCount).toBeLessThanOrEqual(120)
    expect(intro).toContain('Adım Mehmet')
    expect(intro).toContain('18 yaşındayım')
    expect(intro).toContain('üniversite sınavına hazırlanıyorum')
    expect(intro).toContain('Yaklaşık dört yıldır')
    expect(intro).toContain('ilk kez düzenli biçimde paylaştığım yer')
    expect(expertise).toContain('Computer Vision')
    expect(expertise).toContain('LLM fine-tuning')
    expect(expertise).toContain('MCP araç entegrasyonları')
    expect(intro).not.toMatch(/Ben bir yapay zekâ mühendisiyim|layık değilim|zekâm|bilgim yetmiyor/i)
  })
})
