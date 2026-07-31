import { useEffect, useState } from 'react'

export function LogoMark({ animate = false }: Readonly<{ animate?: boolean }>) {
  const [shouldAnimate] = useState(() => {
    if (!animate) return false
    try {
      return window.sessionStorage.getItem('mehmet-logo-played') !== '1'
    } catch {
      return true
    }
  })

  useEffect(() => {
    if (!shouldAnimate) return
    try {
      window.sessionStorage.setItem('mehmet-logo-played', '1')
    } catch {
      return
    }
  }, [shouldAnimate])

  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true" data-animate={shouldAnimate ? 'true' : 'false'}>
      <path className="logo-main" pathLength="1" d="M4 23V7h4l8 10 8-10h4v16h-4V13l-8 10-8-10v10z" />
      <path className="logo-accent" pathLength="1" d="M4 26h9" />
    </svg>
  )
}
