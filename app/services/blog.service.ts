import { normalizeRteMediaUrlsForSave } from '#lib/rte_media_url'
import Blog from '#models/blog'
import BlogRepository, {
  BlogUpsertPayload,
  RevertableBlogField,
} from '#repositories/blog.repository'
import { QueryBuilderParams } from '#types/app'

import { inject } from '@adonisjs/core'

@inject()
export default class BlogService {
  constructor(protected repo: BlogRepository) {}

  async index(queryParams: QueryBuilderParams<typeof Blog>) {
    const preload = queryParams.preload ? [...queryParams.preload] : []
    if (!preload.includes('tags')) preload.push('tags')
    if (!preload.includes('projects')) preload.push('projects')
    if (!preload.includes('thumbnail')) preload.push('thumbnail')
    const exclude = Array.from(new Set([...(queryParams.exclude || []), 'content'])) as any

    const q = this.repo.query({
      ...queryParams,
      preload,
      exclude,
    })

    return await this.repo.paginate(q, queryParams)
  }

  async createUpdate(data: BlogUpsertPayload) {
    return this.repo.updateOrCreateBlog({
      ...data,
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

  async revertToRevision(blogId: string, revisionId: string) {
    return this.repo.revertToRevision(blogId, revisionId)
  }

  async revertFieldsToRevision(blogId: string, revisionId: string, fields: RevertableBlogField[]) {
    return this.repo.revertFieldsToRevision(blogId, revisionId, fields)
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
