import Tables from '#enums/tables'

import { BaseModel, beforeCreate, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import Media from './media.js'
import Project from './project.js'

export default class Blog extends BaseModel {
  static table = Tables.BLOGS

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare slug_id: string

  @column()
  declare title: string

  @column()
  declare thumbnail_id: number | null

  @column()
  declare description: string | null

  @column({
    prepare: (value) => JSON.stringify(value),
    consume: (value) => JSON.parse(value),
  })
  declare content: Record<string, any>

  @column({
    prepare: (value) => JSON.stringify(value),
    consume: (value) => JSON.parse(value),
  })
  declare tags: string[] | null

  @belongsTo(() => Media, {
    foreignKey: 'thumbnail_id',
  })
  declare thumbnail: BelongsTo<typeof Media>

  @manyToMany(() => Project, {
    pivotTable: Tables.PROJECTS,
  })
  declare permissions: ManyToMany<typeof Project>

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null

  @beforeCreate()
  static assignUuid(self: Blog) {
    self.id = randomUUID()
  }
}
