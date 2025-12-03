import Roles from '#enums/roles'
import Role from '#models/role'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const data = [
      {
        id: Roles.USER,
        name: 'User',
        is_protected: true,
      },
      {
        id: Roles.ADMIN,
        name: 'Admin',
        is_protected: true,
      },
      {
        id: Roles.SUPER_ADMIN,
        name: 'Super Admin',
        is_protected: true,
      },
    ]

    await Role.createMany(data)

    console.log('Roles created')
  }
}
