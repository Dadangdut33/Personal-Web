import AuthService from '#services/auth.service'
import env from '#start/env'
import {
  askEmailVerifyValidator,
  askResetPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from '#validators/auth/auth'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AuthController {
  protected bypassCaptcha = env.get('BYPASS_CF_TURNSTILE')
  protected siteKey = env.get('TURNSTILE_SITE')
  protected baseProp = {
    site_key: this.siteKey,
    bypass_captcha: this.bypassCaptcha,
  }

  constructor(protected service: AuthService) {}

  async viewLogin({ inertia }: HttpContext) {
    return inertia.render('auth/login', { ...this.baseProp })
  }

  async viewRegister({ inertia }: HttpContext) {
    return inertia.render('auth/register', { ...this.baseProp })
  }

  // Basically for the reset password and verify email page.
  // We will rely on the token in the URL.
  // If no token, we give the form to make rqeuest
  // If token exist, we give the form to reset the password
  async viewResetPassword({ inertia, params }: HttpContext) {
    const token = params.token || ''
    return inertia.render('auth/resetPassword', { token, ...this.baseProp })
  }

  async viewVerifyMail({ inertia, params }: HttpContext) {
    const token = params.token || ''
    return inertia.render('auth/verifyMail', { token, ...this.baseProp })
  }

  async login({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(loginValidator)
      await this.service.verifyCFToken(payload.cf_token)
      const { accessToken, user } = await this.service.login(payload)

      // if user is not verified, redirect to verify email page
      if (!user.isEmailVerified) return response.redirect().toRoute('auth.verifyMail')

      return response.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: { accessToken, user },
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async register({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator)
      await this.service.verifyCFToken(payload.cf_token)
      const { accessToken, user } = await this.service.register(payload)

      return response.status(201).json({
        status: 'success',
        message: 'User registered successfully, please verify your email to continue',
        data: { accessToken, user },
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  /**
   * Request a new email verification for the authenticated user.
   * This is used for when the user have logged in but their email is not verified.
   *
   * @param {HttpContext} { request,response, auth }
   * @return {*}
   * @memberof AuthController
   */
  async requestVerifyEmail({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(askEmailVerifyValidator)
      await this.service.verifyCFToken(payload.cf_token)
      const user = auth.getUserOrFail()
      await this.service.requestEmail(user)

      return response.status(200).json({
        status: 'success',
        message: 'Request for new email verification sent successfully',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  /**
   * Verify email verification token
   *
   * @param {HttpContext} { response, params, auth }
   * @return {*}
   * @memberof AuthController
   */
  async verifyEmail({ response, params, auth }: HttpContext) {
    try {
      const token = params.token
      const user = auth.getUserOrFail()

      const isAdmin = user.isAdmin
      await this.service.verifyEmail(token, user)

      return response.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: isAdmin,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  /**
   * Request a password reset
   *
   * @param {HttpContext} { request, response }
   * @return {*}
   * @memberof AuthController
   */
  async requestResetPassword({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(askResetPasswordValidator)
      await this.service.verifyCFToken(payload.cf_token)
      await this.service.requestResetPassword(payload.email)

      return response.status(200).json({
        status: 'success',
        message: 'Password reset email sent successfully',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async resetPassword({ request, response }: HttpContext) {
    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { email, password, token, cf_token } =
        await request.validateUsing(resetPasswordValidator)
      await this.service.verifyCFToken(cf_token)
      await this.service.resetPassword(token, password, email)
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  /**
   * Logout a user by invalidating their access token and loging out the auth
   *
   * @param {HttpContext} { auth, response }
   * @return {*}
   * @memberof AuthController
   */
  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      if (auth.authenticatedViaGuard === 'web') {
        await auth.use('web').logout()
      } else {
        const token = user.currentAccessToken
        await this.service.deleteToken(user, token!)
      }

      return response.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async getAuthUser({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      return response.status(200).json({
        status: 'success',
        message: 'User fetched successfully',
        data: user,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
