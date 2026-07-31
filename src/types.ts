export type Locale = 'tr' | 'en'

export type ProjectId =
  | 'xtts-fine-tuning'
  | 'face-tracking'
  | 'speech-transcription'
  | 'gender-classification'

export type SectionId = 'about' | 'projects' | 'ongoing' | 'contact'

export type ProjectMedia = Readonly<{
  base: string
  width: number
  height: number
}>

export type ProjectCopy = Readonly<{
  slug: string
  title: string
  shortTitle: string
  summary: string
  alt: string
  what: string
  why: string
  result: string
}>

export type LocalizedCaseStudy = ProjectCopy &
  ProjectMedia &
  Readonly<{
    id: ProjectId
  }>

export type LocaleContent = Readonly<{
  locale: Locale
  languageName: string
  seo: Readonly<{
    homeTitle: string
    homeDescription: string
    ogDescription: string
    ogLocale: string
    ogImageAlt: string
    notFoundTitle: string
    notFoundDescription: string
  }>
  aria: Readonly<{
    skipHome: string
    skipProject: string
    mainNav: string
    homeLink: string
    languageGroup: string
    openProject: (title: string) => string
    ongoingList: string
    expertiseList: string
  }>
  nav: Readonly<{
    about: string
    projects: string
    contact: string
  }>
  hero: Readonly<{
    title: string
    intro: string
    projectsCta: string
  }>
  about: Readonly<{
    title: string
    intro: readonly [string, string, string]
    expertise: readonly [
      Readonly<{ title: string; body: string }>,
      Readonly<{ title: string; body: string }>,
      Readonly<{ title: string; body: string }>,
    ]
  }>
  projectsSection: Readonly<{
    title: string
    intro: string
    inspect: string
  }>
  projects: Readonly<Record<ProjectId, ProjectCopy>>
  ongoing: Readonly<{
    eyebrow: string
    title: string
    intro: string
    items: readonly [string, string, string]
  }>
  footer: Readonly<{
    identity: string
    pages: string
    links: string
    ongoing: string
    email: string
    copyright: string
  }>
  detail: Readonly<{
    context: string
    what: string
    why: string
    result: string
    close: string
    backHome: string
  }>
  notFound: Readonly<{
    eyebrow: string
    title: string
    body: string
    backHome: string
  }>
  language: Readonly<{
    tr: string
    en: string
    current: string
  }>
}>
