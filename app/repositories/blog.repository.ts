import Blog from '#models/blog'

import BaseRepository from './_base_repository.js'

export default class BlogRepository extends BaseRepository<typeof Blog> {
  constructor() {
    super(Blog)
  }

  async updateOrCreateBlog(data: Partial<Blog>) {
    const { id, ...rest } = data
    const blog = await this.model.updateOrCreate({ id }, rest)
    return blog
  }
}
