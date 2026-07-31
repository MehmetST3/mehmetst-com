import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { CaseStudy } from '../types'
import { goBack } from '../router'
import { ProjectDetail } from './ProjectDetail'

type ProjectDialogProps = Readonly<{
  study: CaseStudy
}>

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function ProjectDialog({ study }: ProjectDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    const closeButton = dialogRef.current?.querySelector<HTMLButtonElement>('[data-dialog-close]')
    closeButton?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        goBack()
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

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      previouslyFocused?.focus()
    }
  }, [])

  useEffect(() => {
    const previousTitle = document.title
    document.title = `${study.shortTitle} | Mehmet Tüysüz`
    return () => {
      document.title = previousTitle
    }
  }, [study.shortTitle])

  const closeButton = (
    <button className="text-control" type="button" onClick={goBack} data-dialog-close>
      Kapat
    </button>
  )

  return createPortal(
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) goBack()
      }}
    >
      <div
        className="dialog-shell"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`detail-title-${study.slug}`}
        aria-describedby={`detail-description-${study.slug}`}
      >
        <ProjectDetail study={study} mode="dialog" closeControl={closeButton} />
      </div>
    </div>,
    document.body,
  )
}
