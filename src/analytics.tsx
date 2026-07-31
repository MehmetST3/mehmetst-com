import { Analytics } from '@vercel/analytics/react'
import { analyticsDescriptor } from './router'
import type { ParsedRoute } from './router'

export function CanonicalAnalytics({ route }: Readonly<{ route: ParsedRoute }>) {
  const isLocalPreview = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (isLocalPreview && import.meta.env.MODE !== 'test') return null
  const descriptor = analyticsDescriptor(route)
  return <Analytics route={descriptor.route} path={descriptor.path} />
}
