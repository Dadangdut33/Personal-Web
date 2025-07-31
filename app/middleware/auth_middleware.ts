import { errors as authErrors } from '@adonisjs/auth'
import type { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirect_to = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    try {
      await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirect_to })
    } catch (error) {
      if (error instanceof authErrors.E_UNAUTHORIZED_ACCESS) {
        ctx.response.status(401).json({
          status: 'error',
          message: 'Unauthorized access',
        })
        return
      }
      throw error
    }
    return next()
  }
}
