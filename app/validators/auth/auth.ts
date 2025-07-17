import { emailValidator } from '#validators/_shared'

import vine from '@vinejs/vine'

export const password = vine.string().minLength(8).maxLength(16)

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().minLength(3).maxLength(64),
    email: emailValidator,
    password,
    cf_token: vine.string().minLength(1),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password,
    cf_token: vine.string().minLength(1),
  })
)

export const askEmailVerifyValidator = vine.compile(
  vine.object({
    cf_token: vine.string().minLength(1),
  })
)

export const askResetPasswordValidator = vine.compile(
  vine.object({
    email: emailValidator,
    cf_token: vine.string().minLength(1),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: emailValidator,
    password: vine.string().minLength(8).maxLength(16),
    token: vine.string().minLength(1),
    cf_token: vine.string().minLength(1),
  })
)
