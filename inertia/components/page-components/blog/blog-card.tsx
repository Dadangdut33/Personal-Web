import { Link } from '@inertiajs/react'
import dayjs from 'dayjs'
import { ArrowRight, CalendarDays, Clock3, Pin } from 'lucide-react'
import HorizontalDragScroll from '~/components/core/horizontal-drag-scroll'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

import BlogViewCount from './blog-view-count'

type BlogCardProps = {
  blog: {
    id: string
    slug_id: string
    title: string
    is_pinned: boolean
    description: string | null
    created_at: string
    updated_at: string
    url_path: string
    thumbnail?: { url?: string } | null
    tags?: { id: string; name: string }[]
  }
  variant?: 'default' | 'compact'
}

export default function BlogCard({ blog, variant = 'default' }: BlogCardProps) {
  const isCompact = variant === 'compact'
  const body = (
    <article className="group flex h-full flex-col rounded-base border-2 border-border bg-secondary-background shadow-shadow transition-all duration-200 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none">
      <div
        className={`relative overflow-hidden border-b-2 border-border ${isCompact ? 'h-36' : 'h-48'}`}
      >
        {blog.thumbnail?.url ? (
          <img
            src={blog.thumbnail.url}
            alt={blog.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid h-full place-items-center bg-background text-sm text-foreground/70">
            No thumbnail
          </div>
        )}
        {blog.is_pinned ? (
          <div className="absolute left-2 top-2">
            <Badge>
              <Pin className="size-3" />
              Featured
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className={`line-clamp-2 font-heading ${isCompact ? 'text-base' : 'text-lg'}`}>
          {blog.title}
        </h2>
        {!isCompact ? (
          <p className="mt-2 line-clamp-3 text-sm text-foreground/80">
            {blog.description || 'No description yet.'}
          </p>
        ) : null}

        {blog.tags?.length ? (
          <HorizontalDragScroll className={`${isCompact ? 'mt-2' : 'mt-3'} pb-1`}>
            <div className="inline-flex gap-1.5">
              {blog.tags.map((tag) => (
                <Badge key={tag.id} variant="neutral" className="shrink-0">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </HorizontalDragScroll>
        ) : null}

        <div
          className={`${isCompact ? 'mt-2' : 'mt-4'} flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/70`}
        >
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {blog.created_at ? dayjs(blog.created_at).format('YYYY-MM-DD') : '-'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" />
            {blog.updated_at ? dayjs(blog.updated_at).format('YYYY-MM-DD') : '-'}
          </span>
          <BlogViewCount slugId={blog.slug_id} urlPath={blog.url_path} />
        </div>

        {!isCompact && (
          <div className={`${isCompact ? 'mt-3' : 'mt-4'}`}>
            <Button asChild size="sm">
              <div>
                Read post
                <ArrowRight className="blog-read-arrow size-4" />
              </div>
            </Button>
          </div>
        )}
      </div>
    </article>
  )

  return (
    <Link href={blog.url_path} className="block h-full cursor-pointer">
      {body}
    </Link>
  )
}
