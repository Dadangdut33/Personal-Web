import type { PaginationMeta } from '#types/app'

import { Head, router } from '@inertiajs/react'
import { Search, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ProjectCard from '~/components/page-components/project/project-card'
import PublicPageShell from '~/components/page-components/public/public-page-shell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { Data } from '~/generated/data'
import PublicLayout from '~/layouts/public'
import { urlFor } from '~/lib/client'
import { InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  data: Data.Project[]
  meta: PaginationMeta
  filters: {
    search: string
  }
}>

export default function ProjectPage(props: PageProps) {
  const { data, meta, filters } = props
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const firstSearchRenderRef = useRef(true)

  const doSearch = (search: string, page = 1) => {
    router.get(
      urlFor('projects'),
      {
        search,
        page,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    )
  }

  useEffect(() => {
    if (firstSearchRenderRef.current) {
      firstSearchRenderRef.current = false
      return
    }

    const timeout = setTimeout(() => {
      const current = (filters.search || '').trim()
      const next = searchInput.trim()
      if (current !== next) doSearch(next, 1)
    }, 450)

    return () => clearTimeout(timeout)
  }, [searchInput])

  const onPageChange = (page: number) => {
    doSearch(filters.search || '', page)
  }

  return (
    <PublicLayout>
      <Head title="Projects" />

      <PublicPageShell
        breadcrumbs={[
          { label: 'Home', href: urlFor('home') },
          { label: 'Projects', current: true },
        ]}
      >
        <section className="rounded-base border-2 border-border bg-main dark:bg-secondary-background p-5 shadow-shadow">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-base border-2 border-border px-2 py-1 text-xs font-heading dark:bg-main bg-secondary-background text-foreground dark:text-main-foreground">
                <Sparkles className="size-3.5" />
                PROJECTS
              </div>
              <h1 className="text-3xl font-heading sm:text-4xl">Projects I've Built</h1>
              <Tooltip>
                <TooltipTrigger>
                  <p className="mt-2 max-w-2xl text-sm text-foreground/80">
                    Some cool stuff that i have worked on.
                  </p>
                </TooltipTrigger>

                <TooltipContent>
                  <p className="text-xs">
                    Not all of it though... Check my github profile for more :D
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-xs font-heading text-foreground/80">
              Page {meta.current_page} of {meta.last_page}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/60" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.currentTarget.value)}
                placeholder="Search title, description, or tags..."
                className="pl-9"
              />
            </div>
            <Button
              variant="neutral"
              onClick={() => {
                setSearchInput('')
                doSearch('', 1)
              }}
            >
              Reset
            </Button>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>

        {data.length === 0 ? (
          <section className="mt-6 rounded-base border-2 border-border bg-secondary-background p-8 text-center shadow-shadow">
            <p className="text-lg font-heading">No projects found</p>
            <p className="mt-1 text-sm text-foreground/70">Try different keywords.</p>
          </section>
        ) : null}

        {meta.last_page > 1 ? (
          <section className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="neutral"
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange(meta.current_page - 1)}
            >
              Prev
            </Button>
            <Badge variant="neutral">
              {meta.current_page} / {meta.last_page}
            </Badge>
            <Button
              variant="neutral"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => onPageChange(meta.current_page + 1)}
            >
              Next
            </Button>
          </section>
        ) : null}
      </PublicPageShell>
    </PublicLayout>
  )
}
