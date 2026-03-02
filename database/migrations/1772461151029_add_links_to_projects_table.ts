import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.PROJECTS

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('links').nullable().after('tags')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('links')
    })
  }
}
