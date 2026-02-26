import { SharedProps } from '@adonisjs/inertia/types'
import { usePage } from '@inertiajs/react'
import { isProd } from '~/lib/utils'

export default function Analytics({ id, url }: { id?: string; url?: string }) {
  const { props } = usePage<SharedProps>()
  const currentPath = props.currentPath || ''

  if (!isProd()) return null
  if (!url || !id) return null
  if (currentPath.startsWith('/dashboard')) return null

  // only load the analytics script in production and when not in dashboard
  return <script defer src={url} data-website-id={id}></script>
}
