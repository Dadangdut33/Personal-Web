import Tables from '#enums/tables'

import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import User from './user.js'

export default class Profile extends BaseModel {
  static table = Tables.USER_PROFILES

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare bio: string

  @column()
  declare userId: string

  @hasOne(() => User)
  declare user: HasOne<typeof User>

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime | null

  @beforeCreate()
  static assignUuid(profile: Profile) {
    profile.id = randomUUID()
  }
}
