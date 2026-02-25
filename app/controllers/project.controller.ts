import { ProjectDto } from '#dto/project.dto'
import {
  getMethodActName,
  getRequestFingerprint,
  mapRequestToQueryParams,
  returnError,
  throwForbidden,
  throwNotFound,
} from '#lib/utils'
import Project from '#models/project'
import ActivityLogService from '#services/activity_log.service'
import ProjectService from '#services/project.service'
import { PaginationMeta } from '#types/app'
import { createEditProjectValidator } from '#validators/auth/project'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { route } from '@izzyjs/route/client'

@inject()
export default class ProjectController {
  constructor(
    protected projectSvc: ProjectService,
    protected activityLogSvc: ActivityLogService
  ) {}

  async viewCreate({ bouncer, inertia }: HttpContext) {
    await bouncer.with('ProjectPolicy').authorize('viewCreate')
    return inertia.render('dashboard/project/createEdit', { data: null })
  }

  async viewEdit({ bouncer, inertia, params }: HttpContext) {
    await bouncer.with('ProjectPolicy').authorize('viewEdit')

    const id = params.id
    if (!id) return throwNotFound()

    const data = await this.projectSvc.findOrFail(id)
    await data.load('thumbnail')

    return inertia.render('dashboard/project/createEdit', {
      data: new ProjectDto(data),
    })
  }

  async viewList({ request, bouncer, inertia }: HttpContext) {
    await bouncer.with('ProjectPolicy').authorize('view')

    const q = mapRequestToQueryParams<typeof Project>(request)
    const dataQ = await this.projectSvc.index(q)

    return inertia.render('dashboard/project/list', {
      data: ProjectDto.collect(dataQ.all()),
      meta: dataQ.getMeta() as PaginationMeta,
    })
  }

  async storeOrUpdate({ request, response, bouncer, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(createEditProjectValidator)

      if (request.method() === 'POST') {
        await bouncer.with('ProjectPolicy').authorize('create', request)

        const created = await this.projectSvc.createUpdate(payload)
        await this.activityLogSvc.log(
          auth.user!.id,
          'create_project',
          `Created project:\n\`\`\`\n${created.title} [${created.id}]\n\`\`\``,
          getRequestFingerprint(request)
        )
      } else if (request.method() === 'PATCH') {
        await bouncer.with('ProjectPolicy').authorize('update', request)
        if (!payload.id) return response.badRequest('Project id is required for update')

        const updated = await this.projectSvc.createUpdate(payload)
        await this.activityLogSvc.log(
          auth.user!.id,
          'update_project',
          `Updated project:\n\`\`\`\n${updated.title} [${updated.id}]\n\`\`\``,
          getRequestFingerprint(request)
        )
      } else {
        throwForbidden()
      }

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} project.`,
        redirect_to: route('project.index' as any).path,
      })
    } catch (error) {
      return returnError(response, error, `PROJECT_${request.method()}`, { logErrors: true })
    }
  }

  async destroy({ response, params, bouncer, auth, request }: HttpContext) {
    try {
      await bouncer.with('ProjectPolicy').authorize('delete', request)

      const id = params.id
      if (!id) return response.badRequest('Project id is required')
      const project = await this.projectSvc.findOrFail(id)
      await this.projectSvc.delete(id)
      await this.activityLogSvc.log(
        auth.user!.id,
        'delete_project',
        `Deleted project:\n\`\`\`\n${project.title} [${project.id}]\n\`\`\``,
        getRequestFingerprint(request)
      )

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted project.',
      })
    } catch (error) {
      return returnError(response, error, 'PROJECT_DELETE', { logErrors: true })
    }
  }

  async bulkDestroy({ response, request, bouncer, auth }: HttpContext) {
    try {
      await bouncer.with('ProjectPolicy').authorize('delete', request)

      const { ids } = request.only(['ids'])
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return response.badRequest('Invalid ids provided')
      }

      const projects = await this.projectSvc.findByIds(ids)
      const titles = projects.map((project) => `- ${project.title} [${project.id}]`).join('\n')
      await this.projectSvc.deleteProjects(ids)
      await this.activityLogSvc.log(
        auth.user!.id,
        'bulk_delete_project',
        `Deleted projects:\n\`\`\`\n${titles}\n\`\`\``,
        getRequestFingerprint(request)
      )

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted selected projects.',
      })
    } catch (error) {
      return returnError(response, error, 'PROJECT_BULK_DELETE', { logErrors: true })
    }
  }
}
