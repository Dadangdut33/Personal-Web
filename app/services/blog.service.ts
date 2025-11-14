import Blog from '#models/blog'
import BlogRepository from '#repositories/blog.repository'
import { QueryBuilderParams } from '#types/app'

import { inject } from '@adonisjs/core'

@inject()
export default class BlogService {
  constructor(protected repo: BlogRepository) {}

  async index(queryParams: QueryBuilderParams<typeof Blog>) {
    return await this.repo.query(queryParams)
  }

  async createUpdate(data: Partial<Blog>) {
    return this.repo.updateOrCreateBlog(data)
  }

  async delete(id: any) {
    return await this.repo.deleteGeneric(id)
  }
}
