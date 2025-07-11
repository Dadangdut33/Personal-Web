import Token from '#models/token'
import User from '#models/user'

import stringHelpers from '@adonisjs/core/helpers/string'
import { DateTime } from 'luxon'

import BaseRepository from './_base_repository.js'

type TokenType = 'PASSWORD_RESET' | 'VERIFY_EMAIL'
type RelationNameType = 'passwordResetTokens' | 'verifyEmailTokens'

/**
 * Repository class for managing user tokens such as email verification and password reset tokens.
 *
 * Extends the `BaseRepository` to provide token-specific operations, including:
 * - Generating tokens with expiration times based on token type.
 * - Checking if a user can request a new token within a time limit.
 * - Expiring or deleting tokens related to a user.
 * - Retrieving a token and its associated user, ensuring the token is valid and not expired.
 * - Verifying the validity of a token by type and expiration.
 *
 * @remarks
 * Token expiration times are determined by the token type:
 * - `VERIFY_EMAIL`: 30 minutes
 * - `PASSWORD_RESET`: 15 minutes
 *
 * @example
 * ```typescript
 * const repo = new TokenRepository();
 * const canRequest = await repo.canRequestToken(user, 'VERIFY_EMAIL');
 * const token = await repo.generateToken(user, 'PASSWORD_RESET');
 * const isValid = await repo.verifyToken(token, 'PASSWORD_RESET');
 * ```
 */
export default class TokenRepository extends BaseRepository<typeof Token> {
  constructor() {
    super(Token)
  }

  private getTokenTimeLimit(type: TokenType) {
    if (type === 'VERIFY_EMAIL') {
      return { minutes: 30 }
    } else if (type === 'PASSWORD_RESET') {
      return { minutes: 15 }
    }

    throw new Error(`Unknown token type: ${type}`)
  }

  async canRequestToken(user: User, type: TokenType) {
    return await this.model
      .query()
      .where('userId', user.id)
      .where('type', type)
      .where('createdAt', '>', DateTime.now().minus(this.getTokenTimeLimit(type)).toSQL())
      .first()
  }

  async generateToken(user: User, type: TokenType) {
    const token = stringHelpers.generateRandom(64)
    const expirationTime = DateTime.now().plus(this.getTokenTimeLimit(type))

    const record = await user.related('tokens').create({
      type,
      expiresAt: expirationTime,
      token,
    })

    return record.token
  }

  async expireTokens(user: User, relationName: RelationNameType) {
    await user.related(relationName).query().update({
      expiresAt: DateTime.now(),
    })
  }

  async deleteTokens(user: User, relationName: RelationNameType) {
    await user.related(relationName).query().delete()
  }

  async getTokenWithUser(token: string, type: TokenType) {
    const record = await this.model
      .query()
      .preload('user')
      .where('token', token)
      .where('type', type)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .orderBy('createdAt', 'desc')
      .first()

    return record?.user
  }

  async verifyToken(token: string, type: TokenType) {
    const record = await this.model
      .query()
      .where('expiresAt', '>', DateTime.now().toSQL())
      .where('token', token)
      .where('type', type)
      .first()

    return !!record
  }
}
