import Tables from '#enums/tables'

import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import Media from './media.js'

export default class Project extends BaseModel {
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

  @belongsTo(() => Media, {
    foreignKey: 'thumbnail_id',
  })
  declare thumbnail: BelongsTo<typeof Media>

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null

  @beforeCreate()
  static assignUuid(self: Project) {
    self.id = randomUUID()
  }
}
