'use client'

import type { BaseAPIResponse } from '#types/api'

import { useQuery } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { api } from '~/lib/axios'
import { urlFor } from '~/lib/client'

type ViewCountResponse = {
  slug_id: string
  view_count: number | null
}

async function fetchBlogViewCount(slugId: string, urlPath: string): Promise<number | null> {
  const { data } = await api.get<BaseAPIResponse<ViewCountResponse>>(
    urlFor('api.v1.blog.viewCount', { slugId }),
    {
      params: {
        url_path: urlPath,
      },
    }
  )

  return data.data?.view_count ?? null
}

export default function BlogViewCount({ slugId, urlPath }: { slugId: string; urlPath: string }) {
  const { data, isPending } = useQuery({
    queryKey: ['blog', 'view-count', slugId, urlPath],
    queryFn: () => fetchBlogViewCount(slugId, urlPath),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
  })

  return (
    <span className="inline-flex items-center gap-1">
      <Eye className="size-3.5" />
      {isPending ? '...' : typeof data === 'number' ? data.toLocaleString() : '-'}
    </span>
  )
}
