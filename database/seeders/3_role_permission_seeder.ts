import Roles from '#enums/roles'
import Permission from '#models/permission'
import Role from '#models/role'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const permissions = await Permission.query()
    const superAdminId = Roles.SUPER_ADMIN
    const superAdmin = await Role.query().where('id', superAdminId).first()

    if (!superAdmin) {
      throw new Error('Super admin role not found')
    }

    const permIds = permissions.map((permission) => permission.id)
    await superAdmin.related('permissions').attach(permIds)

    console.log('Permissions assigned to super admin role')
  }
}
