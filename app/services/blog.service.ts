import { normalizeRteMediaUrlsForSave } from '#lib/rte_media_url'
import { buildBlogUrlPath, toSafeSlug } from '#lib/url_slug'
import Blog from '#models/blog'
import BlogVersion from '#models/blog_version'
import BlogRepository, {
  BlogUpsertPayload,
  RevertableBlogField,
} from '#repositories/blog.repository'
import UmamiService from '#services/umami.service'
import { QueryBuilderParams } from '#types/app'

import cache from '@adonisjs/cache/services/main'
import { inject } from '@adonisjs/core'

@inject()
export default class BlogService {
  constructor(
    protected repo: BlogRepository,
    protected umamiSvc: UmamiService
  ) {}
  private readonly externalFetchTtl = '5m'

  async index(queryParams: QueryBuilderParams<typeof Blog>) {
    const preload = queryParams.preload ? [...queryParams.preload] : []
    if (!preload.includes('tags')) preload.push('tags')
    if (!preload.includes('projects')) preload.push('projects')
    if (!preload.includes('thumbnail')) preload.push('thumbnail')
    if (!preload.includes('author')) preload.push('author')
    if (!preload.includes('editor')) preload.push('editor')
    const exclude = Array.from(new Set([...(queryParams.exclude || []), 'content']))

    const q = this.repo.query({
      ...queryParams,
      preload,
      exclude,
    })
    q.preload('author', (authorQuery) => authorQuery.preload('profile'))
    q.preload('editor', (editorQuery) => editorQuery.preload('profile'))

    return await this.repo.paginate(q, queryParams)
  }

  async publicIndex({
    search = '',
    page = 1,
    perPage = 12,
    sortBy = 'created_at',
    sortDirection = 'desc',
  }: {
    search?: string
    page?: number
    perPage?: number
    sortBy?: 'created_at' | 'updated_at'
    sortDirection?: 'asc' | 'desc'
  }) {
    const q = this.repo.query({
      page,
      perPage,
      search: search.trim(),
      filters: { is_active: true },
      preload: ['thumbnail', 'tags'],
      searchableCol: ['title', 'description', 'slug_id'],
      searchRelations: [{ relation: 'tags', columns: ['name'] }],
      exclude: ['content'],
    })
    q.preload('author', (authorQuery) => authorQuery.preload('profile'))
    q.preload('editor', (editorQuery) => editorQuery.preload('profile'))

    // Always prioritize featured posts, then apply selected sort.
    q.orderBy('is_pinned', 'desc').orderBy(sortBy, sortDirection)

    return this.repo.paginate(q, { page, perPage })
  }

  async publicFindBySegment(segment: string) {
    const normalized = segment.trim()
    if (!normalized) return null

    const blog = await this.repo.model
      .query()
      .where('is_active', true)
      .whereRaw("? LIKE '%' || slug_id", [normalized])
      .preload('thumbnail')
      .preload('tags')
      .preload('projects')
      .preload('author', (authorQuery) => authorQuery.preload('profile'))
      .preload('editor', (editorQuery) => editorQuery.preload('profile'))
      .first()

    if (!blog) return null

    const canonicalSegment = `${toSafeSlug(blog.title)}-${blog.slug_id}`
    const canonicalPath = buildBlogUrlPath(blog.title, blog.slug_id)

    return {
      blog,
      canonicalSegment,
      canonicalPath,
      isCanonical: normalized === canonicalSegment,
    }
  }

  async createUpdate(data: BlogUpsertPayload, actorId?: string) {
    return this.repo.updateOrCreateBlog({
      ...data,
      ...(actorId ? { actor_id: actorId } : {}),
      content: data.content ? normalizeRteMediaUrlsForSave(data.content) : data.content,
    })
  }

  async findOrFail(id: string) {
    return this.repo.findOrFail(id)
  }

  async findByIds(ids: string[]) {
    return this.repo.model.query().whereIn('id', ids)
  }

  async versions(blogId: string) {
    return this.repo.getVersions(blogId)
  }

  async getPublicViewCountByPath(slugId: string, blogPath: string): Promise<number | null> {
    const normalizedSlugId = slugId.trim()
    const normalizedPath = blogPath.trim()
    if (!normalizedSlugId) return null

    const cacheKey = `blog:view_count:${normalizedSlugId}`
    if (!this.umamiSvc.getApiConfig()) return null

    const viewCount = await cache.getOrSet({
      key: cacheKey,
      ttl: this.externalFetchTtl,
      factory: async () => {
        const paths = await this.resolveKnownBlogPaths(normalizedSlugId, normalizedPath)
        return this.umamiSvc.fetchAggregatePathViewCount(paths)
      },
    })

    return typeof viewCount === 'number' ? viewCount : null
  }

  private async resolveKnownBlogPaths(slugId: string, fallbackPath?: string): Promise<string[]> {
    const paths = new Set<string>()
    if (fallbackPath?.trim()) paths.add(fallbackPath.trim())

    const blog = await this.repo.model
      .query()
      .where('slug_id', slugId)
      .select(['slug_id', 'title'])
      .first()
    if (blog?.title) {
      paths.add(buildBlogUrlPath(blog.title, slugId))
    }

    const versions = await BlogVersion.query().where('slug_id', slugId).select('title')
    for (const version of versions) {
      if (version.title) {
        paths.add(buildBlogUrlPath(version.title, slugId))
      }
    }

    return Array.from(paths)
  }

  async attachViewCounts<
    T extends {
      title: string
      slug_id: string
    },
  >(blogs: T[]): Promise<Array<T & { view_count: number | null }>> {
    if (blogs.length === 0) return []

    if (!this.umamiSvc.getApiConfig()) {
      return blogs.map((blog) => ({ ...blog, view_count: null }))
    }

    const enriched = await Promise.all(
      blogs.map(async (blog) => {
        const blogPath = buildBlogUrlPath(blog.title, blog.slug_id)
        const cacheKey = `blog:view_count:${blog.slug_id}`
        const viewCount = await cache.getOrSet({
          key: cacheKey,
          ttl: this.externalFetchTtl,
          factory: async () => {
            const paths = await this.resolveKnownBlogPaths(blog.slug_id, blogPath)
            return this.umamiSvc.fetchAggregatePathViewCount(paths)
          },
        })

        return {
          ...blog,
          view_count: typeof viewCount === 'number' ? viewCount : null,
        }
      })
    )

    return enriched
  }

  async revertToRevision(blogId: string, revisionId: string, actorId?: string) {
    return this.repo.revertToRevision(blogId, revisionId, actorId)
  }

  async revertFieldsToRevision(
    blogId: string,
    revisionId: string,
    fields: RevertableBlogField[],
    actorId?: string
  ) {
    return this.repo.revertFieldsToRevision(blogId, revisionId, fields, actorId)
  }

  async deleteRevision(blogId: string, revisionId: string) {
    return this.repo.deleteRevision(blogId, revisionId)
  }

  async delete(id: any) {
    return await this.repo.deleteBlog(String(id))
  }

  async deleteBlogs(ids: string[]) {
    for (const id of ids) {
      await this.repo.deleteBlog(id)
    }

    return true
  }
}
