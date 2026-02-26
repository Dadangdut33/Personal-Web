'use client'

import { useEffect, useRef } from 'react'

type GiscusCommentsProps = {
  host?: string
  repo?: string
  repoId?: string
  category?: string
  categoryId?: string
  mapping?: string
  strict?: string
  reactionsEnabled?: string
  inputPosition?: string
  theme?: string
  lang?: string
}

export default function GiscusComments({
  host = 'https://giscus.app',
  repo,
  repoId,
  category,
  categoryId,
  mapping = 'pathname',
  strict = '0',
  reactionsEnabled = '1',
  inputPosition = 'top',
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
    script.setAttribute('data-repo', repo)
    script.setAttribute('data-repo-id', repoId)
    script.setAttribute('data-category', category)
    script.setAttribute('data-category-id', categoryId)
    script.setAttribute('data-mapping', mapping)
    script.setAttribute('data-strict', strict)
    script.setAttribute('data-reactions-enabled', reactionsEnabled)
    script.setAttribute('data-input-position', inputPosition)
    script.setAttribute('data-theme', theme)
    script.setAttribute('data-lang', lang)
    containerRef.current.appendChild(script)
  }, [
    host,
    repo,
    repoId,
    category,
    categoryId,
    mapping,
    strict,
    reactionsEnabled,
    inputPosition,
    theme,
    lang,
  ])

  if (!repo || !repoId || !category || !categoryId) return null
  return <div ref={containerRef} />
}
