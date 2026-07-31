import { getLocaleContent, getProject, getProjects, localeContent, sharedProjectMedia } from './content'
import { LOCALES, PROJECT_IDS, localeRoutes } from './route-manifest'

describe('localized portfolio content', () => {
  it('keeps compile-time-complete locale and project parity', () => {
    expect(Object.keys(localeContent).sort()).toEqual([...LOCALES].sort())
    for (const locale of LOCALES) {
      const content = getLocaleContent(locale)
      expect(Object.keys(content.projects).sort()).toEqual([...PROJECT_IDS].sort())
      expect(getProjects(locale)).toHaveLength(4)
      expect(Object.keys(localeRoutes[locale].slugs).sort()).toEqual([...PROJECT_IDS].sort())
    }
    expect(Object.keys(sharedProjectMedia).sort()).toEqual([...PROJECT_IDS].sort())
  })

  it('keeps every localized slug URL-safe and unique per locale', () => {
    for (const locale of LOCALES) {
      const slugs = PROJECT_IDS.map((projectId) => getProject(locale, projectId).slug)
      expect(new Set(slugs)).toHaveLength(PROJECT_IDS.length)
      slugs.forEach((slug) => expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
    }
  })

  it('preserves evidence qualifiers in both languages', () => {
    expect(getProject('tr', 'xtts-fine-tuning').result).toContain('muhtemelen')
    expect(getProject('en', 'xtts-fine-tuning').result).toContain('probably')
    expect(getProject('tr', 'face-tracking').result).toContain('kişisel bir gözlem')
    expect(getProject('en', 'face-tracking').result).toContain('personal observation')
    expect(getProject('tr', 'speech-transcription').result).toContain('dar kapsamlı')
    expect(getProject('en', 'speech-transcription').result).toContain('narrow')
    expect(getProject('tr', 'gender-classification').summary).toContain('belirsiz')
    expect(getProject('en', 'gender-classification').summary).toContain('uncertain')
  })

  it('publishes authorized About facts without private names or self-deprecation', () => {
    const privateProgramName = ['cou', 'ncil'].join('')
    const restrictedVoiceName = ['ci', 'ri'].join('')
    for (const locale of LOCALES) {
      const content = getLocaleContent(locale)
      const publicCopy = JSON.stringify(content)
      expect(content.about.intro).toHaveLength(3)
      expect(content.about.expertise).toHaveLength(3)
      expect(publicCopy.toLocaleLowerCase('tr-TR')).not.toContain(privateProgramName)
      expect(publicCopy.toLocaleLowerCase('tr-TR')).not.toContain(restrictedVoiceName)
      expect(publicCopy).not.toMatch(/[—–]/)
      expect(publicCopy).not.toMatch(/99\.9%|10×|10x faster/i)
    }
    expect(getLocaleContent('tr').about.intro.join(' ')).toMatch(/18 yaşındayım|üniversite sınavına/)
    expect(getLocaleContent('en').about.intro.join(' ')).toMatch(/I’m Mehmet, 18|university entrance exam/)
  })

  it('shares media dimensions without duplicating them in locale copy', () => {
    const tr = getProject('tr', 'gender-classification')
    const en = getProject('en', 'gender-classification')
    expect({ base: tr.base, width: tr.width, height: tr.height }).toEqual({ base: en.base, width: en.width, height: en.height })
    expect(tr.alt).not.toBe(en.alt)
  })
})
