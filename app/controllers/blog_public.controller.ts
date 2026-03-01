import { BlogDto } from '#dto/blog.dto'
import { throwNotFound } from '#lib/utils'
import BlogService from '#services/blog.service'
import env from '#start/env'
import { PaginationMeta } from '#types/app'

import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

type BlogSort = 'created_desc' | 'created_asc' | 'updated_desc' | 'updated_asc'

@inject()
export default class BlogPublicController {
  constructor(protected blogSvc: BlogService) {}

  private getGiscusConfig() {
    return {
      giscus_host: env.get('GISCUS_HOST'),
      giscus_repo: env.get('GISCUS_REPO'),
      giscus_repo_id: env.get('GISCUS_REPO_ID'),
      giscus_category: env.get('GISCUS_CATEGORY'),
      giscus_category_id: env.get('GISCUS_CATEGORY_ID'),
      giscus_mapping: env.get('GISCUS_MAPPING'),
    }
  }

  private resolveSort(sort: string | undefined): {
    sort: BlogSort
    sortBy: 'created_at' | 'updated_at'
    sortDirection: 'asc' | 'desc'
  } {
    const value = (sort || 'created_desc') as BlogSort

    switch (value) {
      case 'created_asc':
        return { sort: 'created_asc', sortBy: 'created_at', sortDirection: 'asc' }
      case 'updated_desc':
        return { sort: 'updated_desc', sortBy: 'updated_at', sortDirection: 'desc' }
      case 'updated_asc':
        return { sort: 'updated_asc', sortBy: 'updated_at', sortDirection: 'asc' }
      case 'created_desc':
      default:
        return { sort: 'created_desc', sortBy: 'created_at', sortDirection: 'desc' }
    }
  }

  async view({ inertia, request }: HttpContext) {
    const search = String(request.input('search', '')).trim()
    const page = Math.max(Number(request.input('page', 1)) || 1, 1)
    const requestedPerPage = Number(request.input('per_page', 12)) || 12
    const perPage = Math.min(Math.max(requestedPerPage, 6), 24)
    const sortInput = String(request.input('sort', 'created_desc'))
    const { sort, sortBy, sortDirection } = this.resolveSort(sortInput)

    const data = await this.blogSvc.publicIndex({
      search,
      page,
      perPage,
      sortBy,
      sortDirection,
    })

    return inertia.render('blog/index', {
      data: BlogDto.collect(data.all()),
      meta: data.getMeta() as PaginationMeta,
      filters: {
        search,
        sort,
        per_page: perPage,
      },
    })
  }

  async viewCount({ response, params, request }: HttpContext) {
    const slugId = String(params.slugId || '').trim()
    const queryPath = String(request.input('url_path', '')).trim()
    if (!slugId) {
      return response.badRequest({
        status: 'error',
        message: 'Slug id is required',
      })
    }

    const viewCount = await this.blogSvc.getPublicViewCountByPath(slugId, queryPath)

    return response.ok({
      status: 'success',
      message: 'Blog view count fetched',
      data: {
        slug_id: slugId,
        view_count: viewCount,
      },
    })
  }

  async viewPost({ inertia, params, response }: HttpContext) {
    const segment = String(params.segment || '').trim()
    if (!segment) return throwNotFound()

    const detail = await this.blogSvc.publicFindBySegment(segment)
    if (!detail) return throwNotFound()

    if (!detail.isCanonical) {
      return response.redirect(detail.canonicalPath)
    }

    return inertia.render('blog/post', {
      data: new BlogDto(detail.blog),
      ...this.getGiscusConfig(),
    })
  }
}
