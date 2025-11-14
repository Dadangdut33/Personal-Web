import Tables from '#enums/tables'

import vine from '@vinejs/vine'

import { emailValidator, passwordValidator, trimmedString } from './_shared.js'

// Create user by admin or edit user by admin
export const createEditUserValidator = vine.compile(
  vine.object({
    id: vine.string().uuid().optional(),
    username: trimmedString.toLowerCase(),
    full_name: trimmedString,
    email: emailValidator,
    password: passwordValidator.optional(),
    is_email_verified: vine.boolean().optional(),
    // roles is array of role ids
    roleIds: vine.array(vine.number().unique({ table: Tables.ROLES, column: 'id' })),
  })
)
