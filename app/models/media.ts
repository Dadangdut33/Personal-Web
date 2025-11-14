import Tables from '#enums/tables'

import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Media extends BaseModel {
  static table = Tables.MEDIAS

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare drive_key: string

  @column()
  declare mime_type: string

  @column()
  declare name: string

  @column()
  declare extension: string

  @column()
  declare size: number

  @column()
  declare hash: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null
}
