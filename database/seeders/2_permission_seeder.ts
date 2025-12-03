import Permission from '#models/permission'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const prefixes = ['user', 'role', 'permission']
    const permissionType = ['view', 'create', 'update', 'delete']
    const manual = ['dashboard.view']
    const manualMapped = manual.map((manualName) => ({ name: manualName }))

    const permissions = prefixes.flatMap((prefix) =>
      permissionType.map((type) => ({ name: `${prefix}.${type}` }))
    )

    permissions.push(...manualMapped)

    await Permission.createMany(permissions)

    console.log('Permissions created')
  }
}
