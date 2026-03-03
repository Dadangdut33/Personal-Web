import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import ImageWithLoader from '~/components/core/image'
import { cn } from '~/lib/utils'

type ImageAttrs = {
  src?: string | null
  alt?: string | null
  title?: string | null
  width?: number | string | null
  height?: number | string | null
  align?: 'left' | 'center' | 'right'
}

const toNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return undefined
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

export default function ResizableImageNodeView({ node, selected }: NodeViewProps) {
  const attrs = node.attrs as ImageAttrs
  const width = toNumber(attrs.width)
  const height = toNumber(attrs.height)
  const align = attrs.align || 'center'

  const justifyClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'

  return (
    <NodeViewWrapper className="not-prose my-4">
      <div className={cn('flex w-full', justifyClass)}>
        <ImageWithLoader
          src={attrs.src || ''}
          alt={attrs.alt || undefined}
          title={attrs.title || undefined}
          width={width || 'auto'}
          height={height || 'auto'}
          radius="md"
          className={cn(
            'inline-block max-w-full rounded-md border-2 border-transparent transition-shadow',
            selected && 'border-border shadow-sm'
          )}
          fit="contain"
        />
      </div>
    </NodeViewWrapper>
  )
}
