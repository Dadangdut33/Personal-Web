import vine from '@vinejs/vine'

import { emailValidator } from './_shared.js'

export const createEditUserValidator = vine.compile(
  vine.object({
    id: vine.string().uuid().optional(),
    fullName: vine.string(),
    email: emailValidator,
    password: vine.string().minLength(8).optional(),
    is_email_verified: vine.boolean().optional(),
    roles: vine.array(vine.number().unique({ table: 'roles', column: 'id' })),
  })
)
