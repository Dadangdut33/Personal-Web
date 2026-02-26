import { ProjectDto } from '#dto/project.dto'
import ProjectService from '#services/project.service'
import { PaginationMeta } from '#types/app'

import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ProjectPublicController {
  constructor(protected projectSvc: ProjectService) {}

  async view({ inertia, request }: HttpContext) {
    const search = String(request.input('search', '')).trim()
    const page = Math.max(Number(request.input('page', 1)) || 1, 1)

    const data = await this.projectSvc.publicIndex({
      search,
      page,
    })

    return inertia.render('project/index', {
      data: ProjectDto.collect(data.all()),
      meta: data.getMeta() as PaginationMeta,
      filters: {
        search,
      },
    })
  }
}
