import PreDefinedRolesId from '#enums/roles'
import User from '#models/user'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const user = await User.create({
      full_name: 'Super Admin',
      username: 'SuperAdmin',
      email: 'superadmin@example.local',
      password: 'Password@123',
      is_email_verified: true,
    })

    await user.related('roles').attach([PreDefinedRolesId.SUPER_ADMIN])

    console.log('Super admin user created')
  }
}
