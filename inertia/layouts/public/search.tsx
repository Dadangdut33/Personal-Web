'use client'

import type { BaseAPIResponse } from '#types/api'

import { Link } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/core'
import { useDebouncedValue } from '@mantine/hooks'
import { Search as SearchIcon } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '~/components/ui/command'
import { api } from '~/lib/axios'
import { urlFor } from '~/lib/client'
import { NAVIGATION_LINKS } from '~/lib/constants'

type BlogSearchItem = {
  id: string
  title: string
  slug_id: string
  description: string | null
  url_path: string
}

export default function Search() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [blogResults, setBlogResults] = useState<BlogSearchItem[]>([])
  const [debouncedQuery] = useDebouncedValue(query.trim(), 300)

  const sections = useMemo(() => {
    if (query.trim().length > 0) return []
    return [
      {
        heading: 'Navigation',
        links: [...NAVIGATION_LINKS.map((item) => ({ text: item.text, href: item.href }))],
      },
    ]
  }, [query])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!open) return

    const keyword = debouncedQuery
    if (keyword.length < 2) {
      setBlogResults([])
      setIsSearching(false)
      return
    }

    const controller = new AbortController()
    setIsSearching(true)

    api
      .get<BaseAPIResponse<BlogSearchItem[]>>(urlFor('api.v1.public.blog.search'), {
        params: { q: keyword, limit: 8 },
        signal: controller.signal,
      })
      .then((response) => {
        setBlogResults(response.data.data || [])
      })
      .catch((error) => {
        if (error?.code !== 'ERR_CANCELED') {
          setBlogResults([])
        }
      })
      .finally(() => {
        setIsSearching(false)
      })

    return () => {
      controller.abort()
    }
  }, [debouncedQuery, open])

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="relative bg-secondary-background dark:text-white shadow-nav dark:shadow-navDark hover:translate-x-[4px]! hover:translate-y-[4px]! hover:shadow-none dark:hover:shadow-none px-3 pr-3 xl:pr-16 shrink-0 xl:w-[unset] w-9 h-9 text-base"
      >
        <span className="flex text-sm items-center gap-1">
          <SearchIcon className="xl:!size-4 !size-5 shrink-0" />
          <span className="xl:inline hidden">Search</span>
        </span>

        <span className="absolute xl:flex hidden items-center justify-center text-black border text-xs px-1 border-black rounded-base bg-main h-6 right-2 top-1">
          ⌘ K
        </span>
      </Button>
      <CommandDialog title="Search" open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search blog posts..." value={query} onValueChange={setQuery} />
        <CommandList className="command-scrollbar **:data-[slot=command-item]:py-1.5!">
          <CommandEmpty>
            {query.trim().length > 0 ? 'No blog posts found.' : 'No results found.'}
          </CommandEmpty>
          {query.trim().length > 0 && (
            <CommandGroup heading={isSearching ? 'Searching...' : 'Blog Posts'}>
              {blogResults.map((item) => {
                const subtitle = item.description?.trim() || item.url_path
                return (
                  <Link href={item.url_path} key={item.id}>
                    <CommandItem value={`${item.title} ${subtitle}`}>
                      <div className="min-w-0">
                        <p className="truncate">{item.title}</p>
                        <p className="text-muted-foreground text-xs truncate">{subtitle}</p>
                      </div>
                    </CommandItem>
                  </Link>
                )
              })}
            </CommandGroup>
          )}
          {sections.map(({ heading, links }, i) => {
            return (
              <React.Fragment key={heading}>
                <CommandGroup heading={heading}>
                  {links.map(({ text, href }) => {
                    return (
                      <Link href={href} key={href}>
                        <CommandItem value={text}>{text}</CommandItem>
                      </Link>
                    )
                  })}
                </CommandGroup>
                {i < sections.length - 1 && <CommandSeparator />}
              </React.Fragment>
            )
          })}
        </CommandList>
      </CommandDialog>
    </>
  )
}
