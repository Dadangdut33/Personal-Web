import router from '@adonisjs/core/services/router'

const REDIRECT_PATH_REGEX = /^\/api\/v1\/public\/media\/redirect\/([^/?#]+)$/
const MEDIA_NODE_URL_FIELD: Record<string, string> = {
  image: 'src',
  fileAttachment: 'url',
  audioAttachment: 'url',
  videoAttachment: 'url',
}

const toTempUrl = (value: string) => {
  try {
    return new URL(value)
  } catch {
    return new URL(value, 'http://localhost')
  }
}

const extractMediaIdFromUrl = (value: string): string | null => {
  if (!value || typeof value !== 'string') return null

  const parsed = toTempUrl(value)
  const match = parsed.pathname.match(REDIRECT_PATH_REGEX)
  if (!match) return null

  return decodeURIComponent(match[1])
}

const makeUnsignedMediaRedirectUrl = (id: string) => {
  return router.builder().params({ id }).make('api.v1.media.redirect')
}

const makeSignedMediaRedirectUrl = (id: string) => {
  return router.builder().params({ id }).makeSigned('api.v1.media.redirect', { expiresIn: '1h' })
}

const cloneValue = <T>(value: T): T => {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value))
  }
}

const walkAndTransform = (value: unknown, mode: 'normalize' | 'sign'): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => walkAndTransform(item, mode))
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const data = value as Record<string, unknown>
  const result: Record<string, unknown> = {}

  for (const [key, child] of Object.entries(data)) {
    result[key] = walkAndTransform(child, mode)
  }

  const nodeType = typeof result.type === 'string' ? result.type : null
  const urlField = nodeType ? MEDIA_NODE_URL_FIELD[nodeType] : null

  if (urlField && result.attrs && typeof result.attrs === 'object') {
    const attrs = { ...(result.attrs as Record<string, unknown>) }
    const rawUrl = attrs[urlField]

    if (typeof rawUrl === 'string' && rawUrl.length > 0) {
      const mediaId = extractMediaIdFromUrl(rawUrl)
      if (mediaId) {
        attrs[urlField] =
          mode === 'normalize'
            ? makeUnsignedMediaRedirectUrl(mediaId)
            : makeSignedMediaRedirectUrl(mediaId)
      }
    }

    result.attrs = attrs
  }

  return result
}

export const normalizeRteMediaUrlsForSave = <T>(content: T): T => {
  if (!content) return content
  const cloned = cloneValue(content)
  return walkAndTransform(cloned, 'normalize') as T
}

export const signRteMediaUrlsForOutput = <T>(content: T): T => {
  if (!content) return content
  const cloned = cloneValue(content)
  return walkAndTransform(cloned, 'sign') as T
}
