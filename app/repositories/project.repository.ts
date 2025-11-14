import Project from '#models/project'

import BaseRepository from './_base_repository.js'

export default class ProjectRepository extends BaseRepository<typeof Project> {
  constructor() {
    super(Project)
  }

  async updateOrCreateProject(data: Partial<Project>) {
    const { id, ...rest } = data
    const project = await this.model.updateOrCreate({ id }, rest)
    return project
  }
}
