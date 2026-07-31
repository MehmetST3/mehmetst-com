import { useEffect } from 'react'

const revealedKeys = new Set<string>()

export function useReveal() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal], [data-line-reveal], [data-clip-reveal]'),
    )
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveal = (element: HTMLElement) => {
      element.classList.add('is-visible')
      const key = element.dataset.revealKey
      if (key) revealedKeys.add(key)
    }

    const pending = elements.filter((element) => {
      const key = element.dataset.revealKey
      if (key && revealedKeys.has(key)) {
        element.classList.add('is-visible')
        return false
      }
      return true
    })

    if (reducedMotion || !('IntersectionObserver' in window)) {
      pending.forEach(reveal)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          reveal(entry.target as HTMLElement)
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    )

    pending.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
}
