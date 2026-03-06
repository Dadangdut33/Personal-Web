type JsonRecord = Record<string, unknown>

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const sanitizeMarks = (value: unknown) => {
  if (!Array.isArray(value)) return undefined

  const marks = value
    .filter(isRecord)
    .map((mark) => {
      if (typeof mark.type !== 'string' || !mark.type.trim()) return null

      const nextMark: JsonRecord = { type: mark.type }
      if (isRecord(mark.attrs)) {
        nextMark.attrs = mark.attrs
      }

      return nextMark
    })
    .filter((mark): mark is JsonRecord => mark !== null)

  return marks.length > 0 ? marks : undefined
}

const extractTextContent = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map((item) => extractTextContent(item)).join('')
  }
  if (!isRecord(value)) return ''

  if (typeof value.text === 'string') return value.text
  if (Array.isArray(value.content)) return extractTextContent(value.content)
  return ''
}

const sanitizeNode = (value: unknown): JsonRecord | null => {
  if (!isRecord(value)) return null
  if (typeof value.type !== 'string' || !value.type.trim()) return null

  if (value.type === 'text') {
    const text = typeof value.text === 'string' ? value.text : extractTextContent(value.content)
    if (!text) return null

    const nextTextNode: JsonRecord = {
      type: 'text',
      text,
    }

    const marks = sanitizeMarks(value.marks)
    if (marks) nextTextNode.marks = marks

    return nextTextNode
  }

  const nextNode: JsonRecord = {
    type: value.type,
  }

  if (isRecord(value.attrs)) {
    nextNode.attrs = value.attrs
  }

  if (Array.isArray(value.content)) {
    const content = value.content
      .map((item) => sanitizeNode(item))
      .filter((item): item is JsonRecord => item !== null)

    if (content.length > 0) {
      nextNode.content = content
    }
  }

  return nextNode
}

export const sanitizeTiptapContent = <T>(value: T): T => {
  const sanitized = sanitizeNode(value)

  if (!sanitized) {
    return { type: 'doc', content: [] } as T
  }

  if (sanitized.type !== 'doc') {
    return {
      type: 'doc',
      content: [sanitized],
    } as T
  }

  if (!Array.isArray(sanitized.content)) {
    sanitized.content = []
  }

  return sanitized as T
}
