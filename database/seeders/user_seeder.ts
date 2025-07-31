import Roles from '#enums/roles'
import User from '#models/user'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const user = await User.create({
      fullName: 'Super Admin',
      username: 'SuperAdmin',
      email: 'admin@admin.com',
      password: 'Password@123',
      isEmailVerified: true,
    })

    await user.related('roles').attach([Roles.ADMIN])
  }
}
