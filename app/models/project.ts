import Tables from '#enums/tables'

import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

import Media from './media.js'

export default class Project extends BaseModel {
  static table = Tables.PROJECTS

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare is_active: boolean

  @column()
  declare is_pinned: boolean

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
  declare tags: string[] | null

  @belongsTo(() => Media, {
    foreignKey: 'thumbnail_id',
  })
  declare thumbnail: BelongsTo<typeof Media>

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null
}
