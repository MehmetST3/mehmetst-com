import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import type { AppHistoryState } from '../router'
import { navigate } from '../router'

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Readonly<{
    to: string
    state?: AppHistoryState | null
  }>

export function AppLink({ to, state = null, onClick, ...props }: AppLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    navigate(to, state)
  }

  return <a href={to} onClick={handleClick} {...props} />
}
