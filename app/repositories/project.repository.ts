import Project from '#models/project'
import type { ProjectLink } from '#models/project'

import BaseRepository from './_base_repository.js'

export type ProjectUpsertPayload = {
  id?: string
  is_active?: boolean
  is_pinned?: boolean
  title?: string
  thumbnail_id?: string | null
  description?: string | null
  tags?: string[] | null
  links?: ProjectLink[] | null
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

  private normalizeLinks(links: ProjectLink[] | null | undefined) {
    if (links === undefined) return undefined
    if (links === null) return null

    const sanitizeIconName = (value: unknown): ProjectLink['icon'] => {
      if (typeof value !== 'string' || value.trim().length === 0) return 'IconLink'
      return value.trim().startsWith('Icon') ? value.trim() : 'IconLink'
    }

    const normalized = links
      .map((link) => {
        return {
          label: String(link.label || '').trim(),
          url: String(link.url || '').trim(),
          icon: sanitizeIconName(link.icon),
        }
      })
      .filter((link) => link.label.length > 0 && link.url.length > 0)
      .filter((value, index, self) => self.findIndex((item) => item.url === value.url) === index)

    return normalized
  }

  async updateOrCreateProject(data: ProjectUpsertPayload) {
    const { id, tags, links, ...rest } = data
    const normalizedTags = this.normalizeTags(tags)
    const normalizedLinks = this.normalizeLinks(links)

    const payload: ProjectUpsertPayload = {
      ...rest,
      ...(normalizedTags !== undefined ? { tags: normalizedTags } : {}),
      ...(normalizedLinks !== undefined ? { links: normalizedLinks } : {}),
    }

    const project = id
      ? await this.model.updateOrCreate({ id }, payload)
      : await this.model.create(payload)
    return project
  }
}
