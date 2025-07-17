import PasswordResetNotification from '#mails/password_reset_notification'
import VerifyEmailNotification from '#mails/verify_e_notification'
import User from '#models/user'
import AuthRepository from '#repositories/auth.repository'
import TokenRepository from '#repositories/token.repository'
import env from '#start/env'
import { TurnstileResponse } from '#types/api'
import { LoginPayload, RegisterPayload } from '#types/inferred'

import { AccessToken } from '@adonisjs/auth/access_tokens'
import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import mail from '@adonisjs/mail/services/main'

@inject()
export default class AuthService {
  constructor(
    protected authRepo: AuthRepository,
    protected tokenRepo: TokenRepository
  ) {}

  /**
   * Register user
   *
   * @param {RegisterPayload} payload
   * @return {*}
   * @memberof AuthService
   */
  async register(payload: RegisterPayload) {
    const exist = await this.authRepo.findBy('email', payload.email)
    if (exist)
      throw new Exception('User with this email already exists.', {
        status: 400,
      })

    const user = await User.create(payload)
    const accessToken = await User.accessTokens.create(user)
    const emailVerifyToken = await this.tokenRepo.generateToken(user, 'VERIFY_EMAIL')
    await mail.sendLater(new VerifyEmailNotification(user, emailVerifyToken))

    return { accessToken, user }
  }

  /**
   * Login user
   *
   * @param {LoginPayload} { email, password }
   * @return {*}
   * @memberof AuthService
   */
  async login({ email, password }: LoginPayload) {
    const user = await User.verifyCredentials(email, password)
    if (!user) throw new Exception('Invalid email or password.', { status: 401 })

    const accessToken = await User.accessTokens.create(user)

    return { accessToken, user }
  }

  /**
   * Delete access token of a user
   *
   * @param {User} user
   * @param {AccessToken} token
   * @memberof AuthService
   */
  async deleteToken(user: User, token: AccessToken) {
    await User.accessTokens.delete(user, token.identifier)
  }

  /**
   * Request email verification
   *
   * @param {User} user
   * @memberof AuthService
   */
  async requestEmail(user: User) {
    if (user.isEmailVerified)
      throw new Exception('Your email is already verified.', {
        status: 400,
      })

    const existingToken = await this.tokenRepo.canRequestToken(user, 'VERIFY_EMAIL')
    if (existingToken)
      throw new Exception('You can only request a verification email every 30 minutes.', {
        status: 429,
      })

    const token = await this.tokenRepo.generateToken(user, 'VERIFY_EMAIL')
    await mail.sendLater(new VerifyEmailNotification(user, token))
  }

  /**
   * Verify email requesst verification
   *
   * @param {string} token
   * @param {User} auth
   * @memberof AuthService
   */
  async verifyEmail(token: string, auth: User) {
    const user = await this.tokenRepo.getTokenWithUser(token, 'VERIFY_EMAIL')
    const isMatch = user?.id === auth?.id // making sure that the one in auth is the user

    if (!user || !isMatch)
      throw new Exception('Invalid token or token does not belong to the authenticated user.', {
        status: 401,
      })

    user.isEmailVerified = true
    await user.save()
    await this.tokenRepo.expireTokens(user, 'verifyEmailTokens')
  }

  /**
   * Request password reset
   *
   * @param {string} email
   * @memberof AuthService
   */
  async requestResetPassword(email: string) {
    const user = await this.authRepo.findBy('email', email)
    if (!user) throw new Exception('User with this email does not exist.', { status: 404 })

    const existingToken = await this.tokenRepo.canRequestToken(user, 'PASSWORD_RESET')
    if (existingToken)
      throw new Exception('You can only request a password reset every 30 minutes.', {
        status: 429,
      })

    const token = await this.tokenRepo.generateToken(user, 'PASSWORD_RESET')
    await mail.sendLater(new PasswordResetNotification(user, token))
  }

  /**
   * Reset user password
   *
   * @param {string} token
   * @param {string} password
   * @param {string} email
   * @memberof AuthService
   */
  async resetPassword(token: string, password: string, email: string) {
    const user = await this.tokenRepo.getTokenWithUser(token, 'PASSWORD_RESET')
    const isMatch = user?.email === email
    if (!user || !isMatch)
      throw new Exception('Invalid token or token does not belong to the authenticated user.', {
        status: 401,
      })

    user.password = password
    await user.save()
    await this.tokenRepo.expireTokens(user, 'passwordResetTokens')
  }

  async fetchVerifyCFToken(token: string) {
    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

    const res = await fetch(url, {
      method: 'POST',
      body: `secret=${env.get('TURNSTILE_SECRET')}&response=${token}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })

    const data = (await res.json()) as TurnstileResponse
    return data.success
  }

  async verifyCFToken(token: string) {
    const res = await this.fetchVerifyCFToken(token)

    if (!res) throw new Exception('Invalid captcha.', { status: 401 })
  }
}
