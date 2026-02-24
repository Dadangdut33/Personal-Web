import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.BLOGS_PROJECTS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('project_id').references('id').inTable(Tables.PROJECTS).onDelete('CASCADE')
      table.uuid('blog_id').references('id').inTable(Tables.BLOGS).onDelete('CASCADE')
      table.primary(['project_id', 'blog_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
