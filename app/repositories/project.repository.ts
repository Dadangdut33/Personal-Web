import Project from '#models/project'

import BaseRepository from './_base_repository.js'

export type ProjectUpsertPayload = {
  id?: string
  is_active?: boolean
  is_pinned?: boolean
  title?: string
  thumbnail_id?: string | null
  description?: string | null
  tags?: string[] | null
}

export default class ProjectRepository extends BaseRepository<typeof Project> {
  constructor() {
    super(Project)
  }

  private normalizeTags(tags: string[] | null | undefined) {
    if (tags === undefined) return undefined
    if (tags === null) return null

    return tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .filter((value, index, self) => self.indexOf(value) === index)
  }

  async updateOrCreateProject(data: ProjectUpsertPayload) {
    const { id, tags, ...rest } = data
    const normalizedTags = this.normalizeTags(tags)

    const payload: ProjectUpsertPayload = {
      ...rest,
      ...(normalizedTags !== undefined ? { tags: normalizedTags } : {}),
    }

    const project = id
      ? await this.model.updateOrCreate({ id }, payload)
      : await this.model.create(payload)
    return project
  }
}
