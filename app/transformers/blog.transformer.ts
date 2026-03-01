import { signRteMediaUrlsForOutput } from '#lib/rte_media_url'
import { buildBlogUrlPath, toSafeSlug } from '#lib/url_slug'
import type Blog from '#models/blog'

import { BaseTransformer } from '@adonisjs/core/transformers'

import { BlogVersionTransformer } from './blog_version.transformer.js'
import { MediaTransformer } from './media.transformer.js'
import { ProjectTransformer } from './project.transformer.js'
import { TagTransformer } from './tag.transformer.js'

export class BlogTransformer extends BaseTransformer<Blog & { view_count?: number | null }> {
  toObject() {
    const safeTitle = toSafeSlug(this.resource.title)

    return {
      id: this.resource.id,
      slug_id: this.resource.slug_id,
      url_segment: safeTitle ? `${safeTitle}-${this.resource.slug_id}` : this.resource.slug_id,
      url_path: buildBlogUrlPath(this.resource.title, this.resource.slug_id),
      title: this.resource.title,
      is_active: this.resource.is_active,
      is_pinned: this.resource.is_pinned,
      thumbnail_id: this.resource.thumbnail_id,
      description: this.resource.description,
      content: signRteMediaUrlsForOutput(this.resource.content),
      tags: TagTransformer.transform(this.whenLoaded(this.resource.tags)),
      created_at: this.resource.created_at ? this.resource.created_at.toString() : '',
      updated_at: this.resource.updated_at ? this.resource.updated_at.toString() : '',
      thumbnail: MediaTransformer.transform(this.whenLoaded(this.resource.thumbnail)),
      projects: ProjectTransformer.transform(this.whenLoaded(this.resource.projects)),
      versions: BlogVersionTransformer.transform(this.whenLoaded(this.resource.versions)),
      view_count: this.resource.view_count ?? null,
    }
  }
}

export default BlogTransformer
