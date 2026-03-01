import BlogPublicController from '#controllers/blog_public.controller'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { Head, Link } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { useMantineColorScheme } from '@mantine/core'
import dayjs from 'dayjs'
import { ArrowLeft, ArrowUp, CalendarDays, Clock3, Pin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import TiptapEditor from '~/components/RTE'
import GiscusComments from '~/components/core/giscus-comments'
import HorizontalDragScroll from '~/components/core/horizontal-drag-scroll'
import PublicPageShell from '~/components/page-components/public/public-page-shell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import PublicLayout from '~/layouts/public'

type PageProps = SharedProps & InferPageProps<BlogPublicController, 'viewPost'>

export default function BlogPostPage(props: PageProps) {
  const { data } = props
  const articleRef = useRef<HTMLElement | null>(null)
  const [readProgress, setReadProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { colorScheme } = useMantineColorScheme()

  useEffect(() => {
    const updateProgress = () => {
      const article = articleRef.current
      if (!article) return

      const rect = article.getBoundingClientRect()
      const articleTop = window.scrollY + rect.top
      const articleHeight = Math.max(rect.height, 1)
      const start = articleTop
      const end = articleTop + articleHeight - window.innerHeight

      let progress = 0
      if (end <= start) {
        progress = window.scrollY >= start ? 1 : 0
      } else {
        progress = (window.scrollY - start) / (end - start)
      }

      const clamped = Math.min(1, Math.max(0, progress))
      setReadProgress(clamped)
      setShowScrollTop(clamped >= 0.85)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <PublicLayout>
      <Head title={data.title} />
      <div className="pointer-events-none fixed left-0 top-0 z-50 h-1 w-full bg-transparent">
        <div
          className="h-full bg-main transition-[width] duration-150 ease-out dark:bg-main"
          style={{ width: `${Math.round(readProgress * 100)}%` }}
        />
      </div>

      {showScrollTop ? (
        <Button
          type="button"
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full border-2 border-border shadow-shadow"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-5" />
        </Button>
      ) : null}

      <PublicPageShell
        widthClassName="w-[1100px]"
        className="px-0 sm:px-5 pt-2 sm:pt-5 pb-10"
        breadCrumbsClassName="px-5 sm:px-0"
        breadcrumbs={[
          { label: 'Home', href: route('home').path },
          { label: 'Blog', href: route('blog').path },
          { label: data.title, current: true, className: 'max-w-[420px] truncate' },
        ]}
      >
        <div className="mb-4 px-5 sm:px-0">
          <Button asChild variant="neutral" size="sm">
            <Link href={route('blog').path}>
              <ArrowLeft className="size-4" />
              Back to blog list
            </Link>
          </Button>
        </div>

        <article
          ref={articleRef}
          className="rounded-none border-0 bg-secondary-background shadow-none sm:rounded-base sm:border-2 sm:border-border sm:shadow-shadow"
        >
          {data.thumbnail?.url ? (
            <div className="overflow-hidden border-b-2 border-border">
              <img
                src={data.thumbnail.url}
                alt={data.title}
                className="max-h-[450px] w-full object-cover"
              />
            </div>
          ) : null}

          <header className="border-b-2 border-border p-4 sm:p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <h1 className="text-2xl font-heading sm:text-3xl">{data.title}</h1>
              {data.is_pinned ? (
                <Badge>
                  <Pin className="size-3" />
                  Featured
                </Badge>
              ) : null}
            </div>

            {data.description ? <p className="text-foreground/80">{data.description}</p> : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/70">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {data.created_at ? dayjs(data.created_at).format('YYYY-MM-DD') : '-'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3.5" />
                {data.updated_at ? dayjs(data.updated_at).format('YYYY-MM-DD') : '-'}
              </span>
            </div>

            {data.tags?.length ? (
              <HorizontalDragScroll className="mt-3 pb-1">
                <div className="inline-flex gap-1.5">
                  {data.tags.map((tag) => (
                    <Badge key={tag.id} variant="neutral" className="shrink-0">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </HorizontalDragScroll>
            ) : null}

            {data.projects?.length ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-heading uppercase tracking-wide text-foreground/70">
                  Related Projects
                </p>
                <HorizontalDragScroll className="pb-1">
                  <div className="inline-flex gap-1.5">
                    {data.projects.map((project) => (
                      <Button
                        key={project.id}
                        asChild
                        variant="neutral"
                        size="sm"
                        className="shrink-0"
                      >
                        <Link
                          href={`${route('projects').path}?search=${encodeURIComponent(project.title)}`}
                        >
                          {project.title}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </HorizontalDragScroll>
              </div>
            ) : null}
          </header>

          <div className="blog-post-content p-4 sm:p-5">
            <TiptapEditor content={data.content} readOnly ssr />
          </div>
        </article>

        <section className="mx-2 sm:mx-0 mt-8 rounded-base border-2 border-border bg-secondary-background p-5 shadow-shadow">
          <h2 className="mb-4 text-xl font-heading">Comments</h2>
          <GiscusComments
            host={props.giscus_host}
            repo={props.giscus_repo}
            repoId={props.giscus_repo_id}
            category={props.giscus_category}
            categoryId={props.giscus_category_id}
            termMapping={data.slug_id}
            theme={colorScheme === 'dark' ? 'dark' : 'light'}
          />
        </section>
      </PublicPageShell>
    </PublicLayout>
  )
}
