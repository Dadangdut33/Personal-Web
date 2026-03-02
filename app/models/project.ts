import Tables from '#enums/tables'

import { BaseModel, beforeCreate, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import SnakeCaseNamingStrategy from './_naming_strategy.js'
import Blog from './blog.js'
import Media from './media.js'

export type ProjectLinkIcon = string
export type ProjectLink = {
  label: string
  url: string
  icon?: ProjectLinkIcon
}

export default class Project extends BaseModel {
  static namingStrategy = new SnakeCaseNamingStrategy()
  static table = Tables.PROJECTS

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare is_active: boolean

  @column()
  declare is_pinned: boolean

  @column()
  declare title: string

  @column()
  declare thumbnail_id: string | null

  @column()
  declare description: string | null

  @column({
    prepare: (value) => (typeof value === 'string' ? value : JSON.stringify(value)),
    consume: (value) => {
      if (value === null || value === undefined) return null
      if (typeof value === 'string') return JSON.parse(value)
      if (Array.isArray(value)) return value
      return null
    },
  })
  declare tags: string[] | null

  @column({
    prepare: (value) => (typeof value === 'string' ? value : JSON.stringify(value)),
    consume: (value) => {
      if (value === null || value === undefined) return null
      if (typeof value === 'string') return JSON.parse(value)
      if (Array.isArray(value)) return value
      return null
    },
  })
  declare links: ProjectLink[] | null

  @belongsTo(() => Media, {
    foreignKey: 'thumbnail_id',
  })
  declare thumbnail: BelongsTo<typeof Media>

  @manyToMany(() => Blog, {
    pivotTable: Tables.BLOGS_PROJECTS,
  })
  declare blogs: ManyToMany<typeof Blog>

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null

  @beforeCreate()
  static assignUuid(self: Project) {
    self.id = randomUUID()
  }
}
