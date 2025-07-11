import env from '#start/env'

import { isProd } from '@/lib/utils'

export default function Analytics() {
  if (!env.get('UMAMI_ID')) return null

  // only load the analytics script in production
  if (isProd())
    return (
      <script
        defer
        src="https://analytics.dadangdut33.my.id/x.js"
        data-website-id={env.get('UMAMI_ID')}
      ></script>
    )

  return null
}
