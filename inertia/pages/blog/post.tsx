import { Link } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/core'
import { Tooltip, useMantineColorScheme } from '@mantine/core'
import dayjs from 'dayjs'
import { ArrowLeft, ArrowUp, CalendarDays, Pin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import TiptapEditor from '~/components/RTE'
import GiscusComments from '~/components/core/giscus-comments'
import HorizontalDragScroll from '~/components/core/horizontal-drag-scroll'
import ImageWithLoader from '~/components/core/image'
import AppMeta from '~/components/core/meta'
import BlogContributors from '~/components/page-components/blog/blog-contributors'
import BlogHeadingTOC from '~/components/page-components/blog/blog-heading-toc'
import BlogViewCount from '~/components/page-components/blog/blog-view-count'
import PublicPageShell from '~/components/page-components/public/public-page-shell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import PublicLayout from '~/layouts/public'
import { urlFor } from '~/lib/client'
import { InertiaProps } from '~/types'
import type { Data } from '~data'

type BlogPostExtraProps = {
  giscus_host: string
  giscus_repo: string
  giscus_repo_id: string
  giscus_category: string
  giscus_category_id: string
}

type PageProps = InertiaProps<{ data: Data.Blog }> & BlogPostExtraProps

type HeadingItem = {
  id: string
  text: string
  level: number
}

const slugifyHeading = (text: string, index: number) => {
  const safe = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return safe ? `${safe}-${index}` : `section-${index}`
}

export default function BlogPostPage(props: PageProps) {
  const { data } = props
  const articleRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [rteRenderedTick, setRteRenderedTick] = useState(0)
  const [readProgress, setReadProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)
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

  const scrollToHeading = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return

    const nextUrl = `${window.location.pathname}${window.location.search}#${id}`
    router.push({ url: nextUrl, preserveScroll: true, preserveState: true })
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const headingElements = Array.from(
      container.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6')
    )

    const mapped: HeadingItem[] = headingElements
      .map((element, index) => {
        const oldAnchor = element.querySelector<HTMLElement>('.blog-heading-anchor-link')
        oldAnchor?.remove()

        const text = element.textContent?.trim() || ''
        if (!text) return null

        const level = Number(element.tagName.replace('H', '')) || 2
        const id = element.id || slugifyHeading(text, index + 1)

        element.id = id
        element.classList.add('group/heading', 'scroll-mt-24')

        const anchor = document.createElement('a')
        anchor.type = 'button'
        anchor.className =
          'blog-heading-anchor-link ml-2 align-middle text-foreground/40 no-underline opacity-0 transition hover:text-foreground group-hover/heading:opacity-100 focus-visible:opacity-100'
        anchor.setAttribute('aria-label', `Go to section link: ${text}`)
        anchor.href = `#${id}`
        anchor.textContent = '#'
        anchor.onclick = () => scrollToHeading(id)
        element.appendChild(anchor)

        return { id, text, level }
      })
      .filter((item): item is HeadingItem => item !== null)

    setHeadings(mapped)
    if (mapped.length > 0) {
      setActiveHeadingId((prev) =>
        prev && mapped.some((item) => item.id === prev) ? prev : mapped[0].id
      )
    } else {
      setActiveHeadingId(null)
    }
  }, [data.content, rteRenderedTick])

  useEffect(() => {
    if (headings.length === 0) return

    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((item): item is HTMLElement => !!item)

    if (headingElements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveHeadingId(visible[0].target.id)
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: [0, 0.2, 1],
      }
    )

    headingElements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [headings])

  return (
    <PublicLayout>
      <AppMeta
        title={data.title}
        description={data.description ?? undefined}
        ogImage={data.thumbnail?.url ?? undefined}
      />

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
          { label: 'Home', href: urlFor('home') },
          { label: 'Blog', href: urlFor('blog') },
          { label: data.title, current: true, className: 'max-w-[420px] truncate' },
        ]}
      >
        <div className="mb-4 px-5 sm:px-0 font-geistmono">
          <Button asChild variant="neutral" size="sm">
            <Link href={urlFor('blog')}>
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
              <ImageWithLoader
                height={250}
                src={data.thumbnail.url}
                alt={data.title}
                className="max-h-[450px] w-full object-cover"
              />
            </div>
          ) : null}

          <header className="border-b-2 border-border p-4 sm:p-5">
            <div className="mb-2 flex items-start justify-between gap-3 font-geistmono">
              <h1 className="text-2xl font-heading sm:text-3xl">{data.title}</h1>
              <div className="flex items-center gap-2">
                {!data.is_active ? <Badge variant="neutral">Draft Preview</Badge> : null}
                {data.is_pinned ? (
                  <Badge>
                    <Pin className="size-3" />
                    Featured
                  </Badge>
                ) : null}
              </div>
            </div>

            {data.description ? (
              <p className="text-foreground/80 mb-6">{data.description}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/70">
              <BlogContributors author={data.author} editor={data.editor} />
              <Tooltip
                label={`Updated at: ${data.updated_at ? dayjs(data.updated_at).format('YYYY-MM-DD') : '-'}`}
              >
                <span className="inline-flex items-center gap-1 font-geistmono">
                  <CalendarDays className="size-3.5" />
                  {data.created_at ? dayjs(data.created_at).format('YYYY-MM-DD') : '-'}
                </span>
              </Tooltip>
              <BlogViewCount slugId={data.slug_id} urlPath={data.url_path} />
            </div>

            {data.tags?.length ? (
              <HorizontalDragScroll className="mt-3 pb-1 font-geistmono">
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
              <div className="mt-4 font-geistmono">
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
                          href={`${urlFor('projects')}?search=${encodeURIComponent(project.title)}`}
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

          <div ref={contentRef} className="blog-post-content p-4 sm:p-5">
            <TiptapEditor
              content={data.content}
              readOnly
              ssr
              onRendered={() => setRteRenderedTick((prev) => prev + 1)}
            />
          </div>
        </article>

        <section className="mx-2 mt-8 rounded-base border-2 border-border bg-secondary-background p-5 shadow-shadow sm:mx-0">
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

        <BlogHeadingTOC
          headings={headings}
          activeHeadingId={activeHeadingId}
          onSelect={scrollToHeading}
        />
      </PublicPageShell>
    </PublicLayout>
  )
}
