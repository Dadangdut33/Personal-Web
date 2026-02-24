import Project from '#models/project'

import { MediaDto } from './media.dto.js'

export class ProjectDto {
  readonly id: string
  readonly is_active: boolean
  readonly is_pinned: boolean
  readonly title: string
  readonly thumbnail_id: number | null
  readonly description: string | null
  readonly tags: string[] | null
  readonly created_at: string
  readonly updated_at: string
  readonly thumbnail?: MediaDto

  constructor(project: Project) {
    this.id = project.id
    this.is_active = project.is_active
    this.is_pinned = project.is_pinned
    this.title = project.title
    this.thumbnail_id = project.thumbnail_id
    this.description = project.description
    this.tags = project.tags
    this.created_at = project.created_at ? project.created_at.toString() : ''
    this.updated_at = project.updated_at ? project.updated_at.toString() : ''
    this.thumbnail = project.thumbnail ? new MediaDto(project.thumbnail) : undefined
  }

  static collect(projects: Project[]): ProjectDto[] {
    return projects.map((project) => new ProjectDto(project))
  }
}
