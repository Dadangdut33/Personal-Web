import Roles from '#enums/roles'

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  async handle({ response, auth }: HttpContext, next: NextFn) {
    await auth.user?.load('roles')
    const isAdmin = auth.user?.roles.some(
      (role) => role.id === Roles.ADMIN || role.id === Roles.SUPER_ADMIN
    )

    if (!isAdmin) {
      return response.status(403).json({
        status: 'error',
        message: 'Only users with an admin role can perform this action.',
      })
    }

    const output = await next()
    return output
  }
}
