import Project from '#models/project'
import ProjectRepository from '#repositories/project.repository'
import { QueryBuilderParams } from '#types/app'

import { inject } from '@adonisjs/core'

@inject()
export default class ProjectService {
  constructor(protected repo: ProjectRepository) {}

  async index(queryParams: QueryBuilderParams<typeof Project>) {
    return await this.repo.query(queryParams)
  }

  async createUpdate(data: Partial<Project>) {
    return this.repo.updateOrCreateProject(data)
  }

  async delete(id: any) {
    return await this.repo.deleteGeneric(id)
  }
}
