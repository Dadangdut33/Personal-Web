import Roles from '#enums/roles'
import User from '#models/user'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const user = await User.create({
      fullName: 'Super Admin',
      email: 'admin@admin.com',
      password: 'wadaw1234',
      isEmailVerified: true,
    })

    await user.related('roles').attach([Roles.ADMIN])
  }
}
