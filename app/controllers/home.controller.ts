import { BlogDto } from '#dto/blog.dto'
import BlogService from '#services/blog.service'

import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class HomeController {
  constructor(protected blogSvc: BlogService) {}

  async view({ inertia }: HttpContext) {
    const blogs = await this.blogSvc.publicIndex({
      page: 1,
      perPage: 6,
      sortBy: 'created_at',
      sortDirection: 'desc',
      search: '',
    })

    return inertia.render('home', {
      latestBlogs: BlogDto.collect(blogs.all()),
    })
  }
}
