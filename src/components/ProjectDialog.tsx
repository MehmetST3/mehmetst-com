import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { closeProjectModal } from '../router'
import type { AppLocation } from '../router'
import type { LocaleContent, LocalizedCaseStudy } from '../types'
import { LanguageToggle } from './LanguageToggle'
import { ProjectDetail } from './ProjectDetail'

type ProjectDialogProps = Readonly<{
  study: LocalizedCaseStudy
  content: LocaleContent
  location: AppLocation
}>

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function ProjectDialog({ study, content, location }: ProjectDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const appRoot = document.getElementById('root')
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const previousRestoration = window.history.scrollRestoration
    const previousInert = appRoot?.inert ?? false
    const previousAriaHidden = appRoot?.getAttribute('aria-hidden') ?? null
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    if (appRoot) {
      appRoot.inert = true
      appRoot.setAttribute('aria-hidden', 'true')
    }
    window.history.scrollRestoration = 'manual'
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
    dialogRef.current?.querySelector<HTMLButtonElement>('[data-dialog-close]')?.focus({ preventScroll: true })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeProjectModal()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector))
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const handleFocusIn = (event: FocusEvent) => {
      const dialog = dialogRef.current
      if (!dialog || dialog.contains(event.target as Node)) return
      dialog.querySelector<HTMLElement>('[data-dialog-close]')?.focus({ preventScroll: true })
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)
      if (appRoot) {
        appRoot.inert = previousInert
        if (previousAriaHidden === null) appRoot.removeAttribute('aria-hidden')
        else appRoot.setAttribute('aria-hidden', previousAriaHidden)
      }
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  const closeButton = (
    <button className="text-control" type="button" onClick={closeProjectModal} data-dialog-close>{content.detail.close}</button>
  )

  return createPortal(
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeProjectModal()}>
      <div className="dialog-shell" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`detail-title-${study.id}`} aria-describedby={`detail-description-${study.id}`}>
        <ProjectDetail
          study={study}
          content={content}
          mode="dialog"
          closeControl={closeButton}
          headerExtra={<LanguageToggle content={content} location={location} />}
        />
      </div>
    </div>,
    document.body,
  )
}
