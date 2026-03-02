import Project from '#models/project'
import type { ProjectLink } from '#models/project'

import { BlogDto } from './blog.dto.js'
import { MediaDto } from './media.dto.js'

export class ProjectDto {
  readonly id: string
  readonly is_active: boolean
  readonly is_pinned: boolean
  readonly title: string
  readonly thumbnail_id: string | null
  readonly description: string | null
  readonly tags: string[] | null
  readonly links: ProjectLink[] | null
  readonly created_at: string
  readonly updated_at: string
  readonly thumbnail?: MediaDto
  readonly related_blogs?: BlogDto[]

  constructor(project: Project) {
    this.id = project.id
    this.is_active = project.is_active
    this.is_pinned = project.is_pinned
    this.title = project.title
    this.thumbnail_id = project.thumbnail_id
    this.description = project.description
    this.tags = project.tags
    this.links = project.links
    this.created_at = project.created_at ? project.created_at.toString() : ''
    this.updated_at = project.updated_at ? project.updated_at.toString() : ''
    this.thumbnail = project.thumbnail ? new MediaDto(project.thumbnail) : undefined
    this.related_blogs = project.blogs
      ? BlogDto.collect(
          project.blogs
            .filter((blog) => blog.is_active)
            .sort((a, b) => {
              if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
              const left = a.updated_at?.toMillis?.() ?? 0
              const right = b.updated_at?.toMillis?.() ?? 0
              return right - left
            })
        )
      : undefined
  }

  static collect(projects: Project[]): ProjectDto[] {
    return projects.map((project) => new ProjectDto(project))
  }
}
