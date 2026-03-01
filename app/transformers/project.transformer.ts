import type Project from '#models/project'

import { BaseTransformer } from '@adonisjs/core/transformers'

import { BlogTransformer } from './blog.transformer.js'
import { MediaTransformer } from './media.transformer.js'

export class ProjectTransformer extends BaseTransformer<Project> {
  toObject() {
    const relatedBlogs = this.resource.blogs
      ? this.resource.blogs
          .filter((blog) => blog.is_active)
          .sort((a, b) => {
            if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
            const left = a.updated_at?.toMillis?.() ?? 0
            const right = b.updated_at?.toMillis?.() ?? 0
            return right - left
          })
      : undefined

    return {
      id: this.resource.id,
      is_active: this.resource.is_active,
      is_pinned: this.resource.is_pinned,
      title: this.resource.title,
      thumbnail_id: this.resource.thumbnail_id,
      description: this.resource.description,
      tags: this.resource.tags,
      created_at: this.resource.created_at ? this.resource.created_at.toString() : '',
      updated_at: this.resource.updated_at ? this.resource.updated_at.toString() : '',
      thumbnail: MediaTransformer.transform(this.whenLoaded(this.resource.thumbnail)),
      related_blogs: BlogTransformer.transform(this.whenLoaded(relatedBlogs)),
    }
  }
}

export default ProjectTransformer
