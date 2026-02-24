import type { Editor } from '@tiptap/react'
import { NodeSelection } from 'prosemirror-state'
import { useCallback, useEffect, useState } from 'react'

type LinkMetadata = {
  url: string
  title?: string | null
  description?: string | null
  imageUrl?: string | null
  siteName?: string | null
}

type YoutubeMetadata = {
  url: string
  videoId: string
  title?: string | null
  thumbnailUrl?: string | null
}

const normalizeExternalUrl = (rawUrl: string) => {
  const trimmed = rawUrl.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const extractYoutubeVideoId = (input: string) => {
  const trimmed = input.trim()
  if (!trimmed) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

export default function useEmbedActions(editor: Editor | null) {
  const [linkUrl, setLinkUrl] = useState('')
  const [isFetchingLinkMetadata, setIsFetchingLinkMetadata] = useState(false)
  const [linkMetadata, setLinkMetadata] = useState<LinkMetadata | null>(null)
  const [linkMetadataError, setLinkMetadataError] = useState<string | null>(null)

  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isFetchingYoutubeMetadata, setIsFetchingYoutubeMetadata] = useState(false)
  const [youtubeMetadata, setYoutubeMetadata] = useState<YoutubeMetadata | null>(null)
  const [youtubeMetadataError, setYoutubeMetadataError] = useState<string | null>(null)

  const setLink = useCallback(() => {
    if (!editor || !editor.isEditable) return

    const normalizedUrl = normalizeExternalUrl(linkUrl)
    if (!normalizedUrl) return

    const selection = editor.state.selection
    const hasTextSelection = !selection.empty && !(selection instanceof NodeSelection)

    if (hasTextSelection) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedUrl }).run()
    } else {
      const isMetadataForCurrentUrl = linkMetadata?.url === normalizedUrl
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'linkCard',
            attrs: {
              url: normalizedUrl,
              title: isMetadataForCurrentUrl ? linkMetadata?.title || null : null,
              description: isMetadataForCurrentUrl ? linkMetadata?.description || null : null,
              imageUrl: isMetadataForCurrentUrl ? linkMetadata?.imageUrl || null : null,
              siteName: isMetadataForCurrentUrl ? linkMetadata?.siteName || null : null,
              size: 'md',
              position: 'center',
            },
          },
          { type: 'paragraph' },
        ])
        .run()
    }

    setLinkUrl('')
    setLinkMetadata(null)
    setLinkMetadataError(null)
  }, [editor, linkUrl, linkMetadata])

  const fetchLinkMetadata = useCallback(async () => {
    if (!editor || !editor.isEditable) return

    const normalizedUrl = normalizeExternalUrl(linkUrl)
    if (!normalizedUrl) return

    setIsFetchingLinkMetadata(true)
    setLinkMetadataError(null)
    try {
      const response = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(normalizedUrl)}&screenshot=false&video=false&audio=false`
      )
      if (!response.ok) throw new Error('Failed to fetch link metadata')

      const payload = await response.json()
      const data = payload?.data
      if (!data) throw new Error('Metadata response is empty')

      const imageUrl =
        (typeof data.image === 'string' ? data.image : data.image?.url) ||
        (typeof data.logo === 'string' ? data.logo : data.logo?.url) ||
        null

      const siteName =
        (typeof data.publisher === 'string' ? data.publisher : data.publisher?.name) ||
        (typeof data.site === 'string' ? data.site : data.site?.name) ||
        (typeof data.author === 'string' ? data.author : data.author?.name) ||
        null

      setLinkMetadata({
        url: normalizedUrl,
        title: typeof data.title === 'string' ? data.title : null,
        description: typeof data.description === 'string' ? data.description : null,
        imageUrl,
        siteName,
      })
    } catch (err) {
      setLinkMetadata({
        url: normalizedUrl,
        title: null,
        description: null,
        imageUrl: null,
        siteName: null,
      })
      setLinkMetadataError(err instanceof Error ? err.message : 'Failed to fetch metadata')
    } finally {
      setIsFetchingLinkMetadata(false)
    }
  }, [editor, linkUrl])

  const fetchYoutubeMetadata = useCallback(async () => {
    if (!editor || !editor.isEditable) return

    const normalizedUrl = normalizeExternalUrl(youtubeUrl)
    const videoId = extractYoutubeVideoId(normalizedUrl)
    if (!normalizedUrl || !videoId) {
      setYoutubeMetadataError('Invalid YouTube URL')
      return
    }

    setIsFetchingYoutubeMetadata(true)
    setYoutubeMetadataError(null)
    try {
      const response = await fetch(
        `https://noembed.com/embed?url=${encodeURIComponent(normalizedUrl)}`
      )
      if (!response.ok) throw new Error('Failed to fetch YouTube metadata')

      const data = await response.json()
      setYoutubeMetadata({
        url: normalizedUrl,
        videoId,
        title: typeof data.title === 'string' ? data.title : null,
        thumbnailUrl:
          typeof data.thumbnail_url === 'string'
            ? data.thumbnail_url
            : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      })
    } catch (err) {
      setYoutubeMetadata({
        url: normalizedUrl,
        videoId,
        title: null,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      })
      setYoutubeMetadataError(
        err instanceof Error ? err.message : 'Failed to fetch YouTube metadata'
      )
    } finally {
      setIsFetchingYoutubeMetadata(false)
    }
  }, [editor, youtubeUrl])

  const addYoutubeEmbed = useCallback(() => {
    if (!editor || !editor.isEditable) return

    const normalizedUrl = normalizeExternalUrl(youtubeUrl)
    const videoId = extractYoutubeVideoId(normalizedUrl)
    if (!normalizedUrl || !videoId) {
      setYoutubeMetadataError('Invalid YouTube URL')
      return
    }

    const isMetadataForCurrentUrl = youtubeMetadata?.url === normalizedUrl
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'youtubeEmbed',
          attrs: {
            url: normalizedUrl,
            videoId,
            title: isMetadataForCurrentUrl ? youtubeMetadata?.title || null : null,
            thumbnailUrl: isMetadataForCurrentUrl ? youtubeMetadata?.thumbnailUrl || null : null,
            size: 'md',
            position: 'center',
            aspectRatio: '16/9',
            startAt: 0,
          },
        },
        { type: 'paragraph' },
      ])
      .run()

    setYoutubeUrl('')
    setYoutubeMetadata(null)
    setYoutubeMetadataError(null)
  }, [editor, youtubeUrl, youtubeMetadata])

  useEffect(() => {
    if (!linkUrl.trim()) {
      setLinkMetadata(null)
      setLinkMetadataError(null)
      return
    }

    const normalized = normalizeExternalUrl(linkUrl)
    if (linkMetadata?.url && linkMetadata.url !== normalized) {
      setLinkMetadata(null)
      setLinkMetadataError(null)
    }
  }, [linkUrl, linkMetadata?.url])

  useEffect(() => {
    if (!youtubeUrl.trim()) {
      setYoutubeMetadata(null)
      setYoutubeMetadataError(null)
      return
    }

    const normalized = normalizeExternalUrl(youtubeUrl)
    if (youtubeMetadata?.url && youtubeMetadata.url !== normalized) {
      setYoutubeMetadata(null)
      setYoutubeMetadataError(null)
    }
  }, [youtubeUrl, youtubeMetadata?.url])

  return {
    linkUrl,
    setLinkUrl,
    isFetchingLinkMetadata,
    linkMetadata,
    linkMetadataError,
    setLink,
    fetchLinkMetadata,

    youtubeUrl,
    setYoutubeUrl,
    isFetchingYoutubeMetadata,
    youtubeMetadata,
    youtubeMetadataError,
    fetchYoutubeMetadata,
    addYoutubeEmbed,
  }
}
