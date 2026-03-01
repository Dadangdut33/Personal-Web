'use client'

import { useEffect, useRef } from 'react'

type GiscusCommentsProps = {
  host?: string
  repo?: string
  repoId?: string
  category?: string
  categoryId?: string
  theme?: string
  lang?: string
  termMapping: string
}

export default function GiscusComments({
  host = 'https://giscus.app',
  repo,
  repoId,
  category,
  categoryId,
  termMapping,
  theme = 'preferred_color_scheme',
  lang = 'en',
}: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (!repo || !repoId || !category || !categoryId) return
    const normalizedHost = host.replace(/\/+$/, '')

    containerRef.current.innerHTML = ''
    const script = document.createElement('script')
    script.src = `${normalizedHost}/client.js`
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-term', termMapping)
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '1')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-lang', lang)
    script.setAttribute('data-repo', repo)
    script.setAttribute('data-repo-id', repoId)
    script.setAttribute('data-category', category)
    script.setAttribute('data-category-id', categoryId)
    script.setAttribute('data-theme', theme)
    containerRef.current.appendChild(script)
  }, [host, repo, repoId, category, categoryId, termMapping, theme, lang])

  if (!repo || !repoId || !category || !categoryId) return null
  return <div ref={containerRef} />
}
