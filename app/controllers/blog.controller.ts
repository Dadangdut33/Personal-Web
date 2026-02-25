import { BlogDto } from '#dto/blog.dto'
import { ProjectDto } from '#dto/project.dto'
import { TagDto } from '#dto/tag.dto'
import {
  getMethodActName,
  getRequestFingerprint,
  mapRequestToQueryParams,
  returnError,
  throwForbidden,
  throwNotFound,
} from '#lib/utils'
import Blog from '#models/blog'
import Project from '#models/project'
import Tag from '#models/tag'
import ActivityLogService from '#services/activity_log.service'
import BlogService from '#services/blog.service'
import { PaginationMeta } from '#types/app'
import { createEditBlogValidator } from '#validators/auth/blog'

import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { route } from '@izzyjs/route/client'

@inject()
export default class BlogController {
  constructor(
    protected blogSvc: BlogService,
    protected activityLogSvc: ActivityLogService
  ) {}

  async viewCreate({ bouncer, inertia }: HttpContext) {
    await bouncer.with('BlogPolicy').authorize('viewCreate')

    const projects = await Project.query().select(['id', 'title']).orderBy('title', 'asc')
    const availableTags = await Tag.query().where('type', 'blog').orderBy('name', 'asc')

    return inertia.render('dashboard/blog/createEdit', {
      data: null,
      projects: ProjectDto.collect(projects),
      availableTags: TagDto.collect(availableTags),
    })
  }

  async viewEdit({ bouncer, inertia, params }: HttpContext) {
    await bouncer.with('BlogPolicy').authorize('viewEdit')

    const id = params.id
    if (!id) return throwNotFound()

    const data = await this.blogSvc.findOrFail(id)
    await data.load('tags')
    await data.load('projects')
    await data.load('thumbnail')

    const projects = await Project.query().select(['id', 'title']).orderBy('title', 'asc')
    const availableTags = await Tag.query().where('type', 'blog').orderBy('name', 'asc')

    return inertia.render('dashboard/blog/createEdit', {
      data: new BlogDto(data),
      projects: ProjectDto.collect(projects),
      availableTags: TagDto.collect(availableTags),
    })
  }

  async viewList({ request, bouncer, inertia }: HttpContext) {
    await bouncer.with('BlogPolicy').authorize('view')

    const q = mapRequestToQueryParams<typeof Blog>(request)
    const dataQ = await this.blogSvc.index(q)

    return inertia.render('dashboard/blog/list', {
      data: BlogDto.collect(dataQ.all()),
      meta: dataQ.getMeta() as PaginationMeta,
    })
  }

  async storeOrUpdate({ request, response, bouncer, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(createEditBlogValidator)

      if (request.method() === 'POST') {
        await bouncer.with('BlogPolicy').authorize('create', request)

        const created = await this.blogSvc.createUpdate(payload)
        await this.activityLogSvc.log(
          auth.user!.id,
          'create_blog',
          `Created blog:\n\`\`\`\n${created.title} [${created.id}]\n\`\`\``,
          getRequestFingerprint(request)
        )
      } else if (request.method() === 'PATCH') {
        await bouncer.with('BlogPolicy').authorize('update', request)

        const updated = await this.blogSvc.createUpdate(payload)
        await this.activityLogSvc.log(
          auth.user!.id,
          'update_blog',
          `Updated blog:\n\`\`\`\n${updated.title} [${updated.id}]\n\`\`\``,
          getRequestFingerprint(request)
        )
      } else {
        throwForbidden()
      }

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} blog.`,
        redirect_to: route('blog.index' as any).path,
      })
    } catch (error) {
      return returnError(response, error, `BLOG_${request.method()}`, { logErrors: true })
    }
  }

  async destroy({ response, params, bouncer, auth, request }: HttpContext) {
    try {
      await bouncer.with('BlogPolicy').authorize('delete', request)

      const id = params.id
      const blog = await this.blogSvc.findOrFail(id)

      await this.blogSvc.delete(id)
      await this.activityLogSvc.log(
        auth.user!.id,
        'delete_blog',
        `Deleted blog:\n\`\`\`\n${blog.title} [${blog.id}]\n\`\`\``,
        getRequestFingerprint(request)
      )

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted blog.',
      })
    } catch (error) {
      return returnError(response, error, 'BLOG_DELETE', { logErrors: true })
    }
  }

  async bulkDestroy({ response, request, bouncer, auth }: HttpContext) {
    try {
      await bouncer.with('BlogPolicy').authorize('delete', request)

      const { ids } = request.only(['ids'])
      if (!ids || !Array.isArray(ids)) return response.badRequest('Invalid ids provided')

      const blogs = await this.blogSvc.findByIds(ids)
      const titles = blogs.map((blog) => `- ${blog.title} [${blog.id}]`).join('\n')

      await this.blogSvc.deleteBlogs(ids)
      await this.activityLogSvc.log(
        auth.user!.id,
        'bulk_delete_blog',
        `Deleted blogs:\n\`\`\`\n${titles}\n\`\`\``,
        getRequestFingerprint(request)
      )

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted selected blogs.',
      })
    } catch (error) {
      return returnError(response, error, 'BLOG_BULK_DELETE', { logErrors: true })
    }
  }
}
