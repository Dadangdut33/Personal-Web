import PreDefinedRolesId from '#enums/roles'
import User from '#models/user'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const user = await User.create({
      full_name: 'Super Admin',
      username: 'SuperAdmin',
      email: 'admin@admin.com',
      password: 'Password@123',
      is_email_verified: true,
    })

    await user.related('roles').attach([PreDefinedRolesId.ADMIN])
  }
}
