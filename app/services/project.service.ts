import Project from '#models/project'
import ProjectRepository, { ProjectUpsertPayload } from '#repositories/project.repository'
import { QueryBuilderParams } from '#types/app'

import { inject } from '@adonisjs/core'

@inject()
export default class ProjectService {
  constructor(protected repo: ProjectRepository) {}

  async index(queryParams: QueryBuilderParams<typeof Project>) {
    const preload = queryParams.preload ? [...queryParams.preload] : []
    if (!preload.includes('thumbnail')) preload.push('thumbnail')

    const q = this.repo.query({
      ...queryParams,
      preload,
    })

    return await this.repo.paginate(q, queryParams)
  }

  async createUpdate(data: ProjectUpsertPayload) {
    return this.repo.updateOrCreateProject(data)
  }

  async findOrFail(id: string) {
    return this.repo.findOrFail(id)
  }

  async findByIds(ids: string[]) {
    return this.repo.model.query().whereIn('id', ids)
  }

  async publicIndex({
    search = '',
    page = 1,
    perPage = 25,
  }: {
    search?: string
    page?: number
    perPage?: number
  }) {
    const q = this.repo.query({
      page,
      perPage,
      search: search.trim(),
      filters: { is_active: true },
      preload: ['thumbnail', 'blogs'],
      searchableCol: ['title', 'description', 'tags', 'links'],
      searchRelations: [{ relation: 'blogs', columns: ['title'] }],
      sortBy: 'is_pinned',
      sortDirection: 'desc',
    })

    q.orderBy('updated_at', 'desc')
    return this.repo.paginate(q, { page, perPage })
  }

  async delete(id: string) {
    const project = await this.repo.findOrFail(id)
    await this.repo.deleteGeneric(project.id)
    return true
  }

  async deleteProjects(ids: string[]) {
    for (const id of ids) {
      await this.delete(id)
    }

    return true
  }
}
