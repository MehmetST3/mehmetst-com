export type CaseStudy = Readonly<{
  slug: string
  title: string
  shortTitle: string
  summary: string
  image: Readonly<{
    base: string
    alt: string
    width: number
    height: number
  }>
  what: string
  why: string
  result: string
}>
