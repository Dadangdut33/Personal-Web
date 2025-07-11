import Permission from '#models/permission'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const prefixes = ['user', 'role', 'permission']
    const permissionType = ['view', 'create', 'update', 'delete']

    const permissions = prefixes.flatMap((prefix) =>
      permissionType.map((type) => ({ name: `${prefix}.${type}` }))
    )
    await Permission.createMany(permissions)
  }
}
