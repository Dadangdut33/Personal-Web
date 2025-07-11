import { emailValidator } from '#validators/_shared'

import vine from '@vinejs/vine'

export const password = vine.string().minLength(8).maxLength(16)

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().minLength(3).maxLength(64),
    email: emailValidator,
    password,
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password,
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: emailValidator,
    password: vine.string().minLength(8).maxLength(16),
    token: vine.string().minLength(1),
  })
)
