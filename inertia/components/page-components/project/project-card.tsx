import { Link } from '@inertiajs/react'
import dayjs from 'dayjs'
import { ArrowRight, Pin } from 'lucide-react'
import HorizontalDragScroll from '~/components/core/horizontal-drag-scroll'
import { Badge } from '~/components/ui/badge'

type ProjectCardProps = {
  project: {
    id: string
    title: string
    description: string | null
    is_pinned: boolean
    tags: string[] | null
    updated_at: string
    thumbnail?: { url?: string } | null
    related_blogs?: {
      id: string
      title: string
      url_path: string
    }[]
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const relatedBlogs = project.related_blogs || []

  return (
    <article className="flex h-full flex-col rounded-base border-2 border-border bg-secondary-background shadow-shadow">
      <div className="relative h-48 overflow-hidden border-b-2 border-border">
        {project.thumbnail?.url ? (
          <img
            src={project.thumbnail.url}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center bg-background text-sm text-foreground/70">
            No thumbnail
          </div>
        )}
        {project.is_pinned ? (
          <div className="absolute left-2 top-2">
            <Badge>
              <Pin className="size-3" />
              Featured
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-1 text-lg font-heading">{project.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-foreground/80">{project.description}</p>

        {(project.tags || []).length > 0 ? (
          <HorizontalDragScroll className="mt-3 pb-1">
            <div className="inline-flex gap-1.5">
              {(project.tags || []).map((tag) => (
                <Badge key={`${project.id}-${tag}`} variant="neutral" className="shrink-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </HorizontalDragScroll>
        ) : null}

        <div className="mt-4 border-t-2 border-dashed border-border pt-3">
          <p className="mb-2 text-xs font-heading">Related Blogs</p>
          {relatedBlogs.length === 0 ? (
            <p className="text-sm text-foreground/70">
              No post have been made about this project yet.
            </p>
          ) : (
            <div className="max-h-28 space-y-1 overflow-y-auto pr-1">
              {relatedBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={blog.url_path}
                  className="list-disc group flex items-center justify-between rounded-base border-2 border-transparent px-2 py-1 text-sm hover:border-border hover:bg-background"
                >
                  <span className="line-clamp-1">{blog.title}</span>
                  <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-foreground/70">
          Updated {project.updated_at ? dayjs(project.updated_at).format('YYYY-MM-DD') : '-'}
        </p>
      </div>
    </article>
  )
}
