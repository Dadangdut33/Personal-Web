import { signRteMediaUrlsForOutput } from '#lib/rte_media_url'
import Blog from '#models/blog'

import { BlogVersionDto } from './blog_version.dto.js'
import { MediaDto } from './media.dto.js'
import { ProjectDto } from './project.dto.js'
import { TagDto } from './tag.dto.js'

export class BlogDto {
  readonly id: string
  readonly slug_id: string
  readonly url_segment: string
  readonly url_path: string
  readonly title: string
  readonly thumbnail_id: string | null
  readonly description: string | null
  readonly content: Record<string, any>
  readonly tags?: TagDto[]
  readonly created_at: string
  readonly updated_at: string
  readonly thumbnail?: MediaDto
  readonly projects?: ProjectDto[]
  readonly versions?: BlogVersionDto[]

  constructor(blog: Blog) {
    const safeTitle = blog.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    this.id = blog.id
    this.slug_id = blog.slug_id
    this.url_segment = safeTitle ? `${safeTitle}-${blog.slug_id}` : blog.slug_id
    this.url_path = `/blog/${this.url_segment}`
    this.title = blog.title
    this.thumbnail_id = blog.thumbnail_id
    this.description = blog.description
    this.content = signRteMediaUrlsForOutput(blog.content)
    this.tags = blog.tags ? TagDto.collect(blog.tags) : undefined
    this.created_at = blog.created_at ? blog.created_at.toString() : ''
    this.updated_at = blog.updated_at ? blog.updated_at.toString() : ''
    this.thumbnail = blog.thumbnail ? new MediaDto(blog.thumbnail) : undefined
    this.projects = blog.projects ? ProjectDto.collect(blog.projects) : undefined
    this.versions = blog.versions ? BlogVersionDto.collect(blog.versions) : undefined
  }

  static collect(blogs: Blog[]): BlogDto[] {
    return blogs.map((blog) => new BlogDto(blog))
  }
}
